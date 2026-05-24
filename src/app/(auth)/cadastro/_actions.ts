"use server";

import { z } from "zod";

import { createSession, hashPassword } from "@/lib/auth";
import { analyzeCadastro } from "@/lib/credit-engine/analyze";
import { db } from "@/lib/db";
import type {
  ChannelType,
  SupplierCategory,
} from "@/generated/prisma/client";

const ChannelInput = z.object({
  type: z.enum([
    "PIX",
    "SHOPEE",
    "MERCADO_LIVRE",
    "INSTAGRAM",
    "FEIRA",
    "MAQUININHA",
    "OUTRO",
  ]),
  label: z.string().min(1),
  monthlyRevenueCents: z.number().int().nonnegative(),
});

const OnboardingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  cnpj: z.string().regex(/^\d{14}$/),
  cpf: z.string().regex(/^\d{11}$/),
  birthDate: z.string().date(),
  businessName: z.string().min(2),
  declaredBusinessActivity: z.string().min(2),
  monthsActive: z.number().int().nonnegative(),
  hasCadUnico: z.boolean().default(false),
  pluggyItemId: z.string().optional(),
  initialCreditAmount: z
    .union([z.literal(200), z.literal(400), z.literal(600), z.literal(800)])
    .default(400),
  channels: z.array(ChannelInput).min(1, "Conecte pelo menos um canal"),
  // Campos opcionais — defaults pro MVP. UI não coleta mais.
  phone: z.string().default(""),
  addressCep: z.string().default("00000000"),
  addressCity: z.string().default("São Paulo"),
  addressState: z.string().default("SP"),
  addressNeighborhood: z.string().default("Centro"),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;

export interface CompleteOnboardingResult {
  ok: boolean;
  error?: string;
  // Motor result (pra UI mostrar tela rica)
  decision?: "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  recommendedLimitCents?: string;
  suggestedFeePercent?: number;
  riskLevel?: "BAIXO" | "MEDIO" | "ALTO";
  confidenceLevel?: "ALTA" | "MEDIA" | "BAIXA";
  scoreFinal?: number;
  usedOpenFinance?: boolean;
  positiveFactors?: string[];
  attentionFactors?: string[];
  userExplanation?: string;
  engine?: "motor" | "fallback-local";
}

export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<CompleteOnboardingResult> {
  const parsed = OnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) return { ok: false, error: "E-mail já cadastrado" };

  const existingCnpj = await db.entrepreneurProfile.findUnique({
    where: { cnpj: data.cnpj },
  });
  if (existingCnpj) return { ok: false, error: "CNPJ já cadastrado" };

  const existingCpf = await db.entrepreneurProfile.findUnique({
    where: { cpf: data.cpf },
  });
  if (existingCpf) return { ok: false, error: "CPF já cadastrado" };

  // Roda o motor de crédito (com fallback) ANTES de criar o usuário —
  // se motor diz REJECTED, ainda criamos cadastro mas mostramos resultado
  // honestamente. APPROVED/MANUAL_REVIEW também são persistidos pro audit trail.
  const analysis = await analyzeCadastro({
    user: {
      name: data.name,
      cpf: data.cpf,
      cnpj: data.cnpj,
      birthDate: data.birthDate,
      declaredBusinessActivity: data.declaredBusinessActivity,
      city: data.addressCity,
      state: data.addressState.toUpperCase(),
      hasCadUnico: data.hasCadUnico,
      monthsOperating: data.monthsActive,
    },
    channels: data.channels.map((c) => ({
      type: c.type,
      monthlyRevenueCents: c.monthlyRevenueCents,
    })),
    pluggyItemId: data.pluggyItemId,
    initialCreditRequest: { amount: data.initialCreditAmount },
  });

  const businessSince = new Date();
  businessSince.setMonth(businessSince.getMonth() - data.monthsActive);

  const user = await db.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: hashPassword(data.password),
      role: "ENTREPRENEUR",
      name: data.name,
      entrepreneur: {
        create: {
          cnpj: data.cnpj,
          cpf: data.cpf,
          birthDate: new Date(data.birthDate),
          declaredBusinessActivity: data.declaredBusinessActivity,
          hasCadUnico: data.hasCadUnico,
          pluggyItemId: data.pluggyItemId,
          businessName: data.businessName,
          phone: data.phone || "",
          addressCep: data.addressCep || "00000000",
          addressCity: data.addressCity || "São Paulo",
          addressState: (data.addressState || "SP").toUpperCase(),
          addressNeighborhood: data.addressNeighborhood || "Centro",
          businessSince,
          channels: {
            createMany: {
              data: data.channels.map((c) => ({
                type: c.type as ChannelType,
                label: c.label,
                monthlyRevenueCents: BigInt(c.monthlyRevenueCents),
              })),
            },
          },
          creditAnalyses: {
            create: {
              engineVersion: analysis.engineVersion,
              decision: analysis.decision,
              riskLevel: analysis.riskLevel,
              confidenceLevel: analysis.confidenceLevel,
              recommendedLimitCents: analysis.recommendedLimitCents,
              suggestedFeePercent: analysis.suggestedFeePercent,
              scoreFinal: analysis.scoreFinal,
              usedOpenFinance: analysis.usedOpenFinance,
              positiveFactors: analysis.positiveFactors,
              attentionFactors: analysis.attentionFactors,
              userExplanation: analysis.userExplanation,
              rawInputJson: JSON.parse(
                JSON.stringify(analysis.raw.input),
              ),
              rawResultJson: JSON.parse(
                JSON.stringify(analysis.raw.motorResult ?? null),
              ),
            },
          },
        },
      },
    },
  });

  await createSession(user.id);

  return {
    ok: true,
    decision: analysis.decision,
    recommendedLimitCents: analysis.recommendedLimitCents.toString(),
    suggestedFeePercent: analysis.suggestedFeePercent,
    riskLevel: analysis.riskLevel,
    confidenceLevel: analysis.confidenceLevel,
    scoreFinal: analysis.scoreFinal,
    usedOpenFinance: analysis.usedOpenFinance,
    positiveFactors: analysis.positiveFactors,
    attentionFactors: analysis.attentionFactors,
    userExplanation: analysis.userExplanation,
    engine: analysis.engine,
  };
}

// ─────────────────────── Supplier (lojista) onboarding ───────────────────────

const SupplierOnboardingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  cnpj: z.string().regex(/^\d{14}$/),
  businessName: z.string().min(2),
  category: z.enum([
    "TEXTIL",
    "COSMETICOS",
    "ALIMENTOS",
    "BEBIDAS",
    "PAPELARIA",
    "ACESSORIOS",
    "CALCADOS",
    "BAZAR",
    "OUTROS",
  ]),
  addressCity: z.string().min(2),
  addressState: z.string().length(2),
  addressNeighborhood: z.string().min(2),
  description: z.string().default(""),
  phone: z.string().default(""),
  addressCep: z.string().default("00000000"),
  pixKey: z.string().default(""),
});

export type SupplierOnboardingInput = z.infer<typeof SupplierOnboardingSchema>;

export interface CompleteSupplierResult {
  ok: boolean;
  error?: string;
  supplierId?: string;
  businessName?: string;
}

export async function completeSupplierOnboardingAction(
  input: SupplierOnboardingInput,
): Promise<CompleteSupplierResult> {
  const parsed = SupplierOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) return { ok: false, error: "E-mail já cadastrado" };

  const existingCnpj = await db.supplierProfile.findUnique({
    where: { cnpj: data.cnpj },
  });
  if (existingCnpj) return { ok: false, error: "CNPJ já cadastrado" };

  const user = await db.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: hashPassword(data.password),
      role: "SUPPLIER",
      name: data.name,
      supplier: {
        create: {
          cnpj: data.cnpj,
          businessName: data.businessName,
          category: data.category as SupplierCategory,
          description: data.description || `${data.businessName} · ${data.category.toLowerCase()}`,
          phone: data.phone || "",
          addressCep: data.addressCep || "00000000",
          addressCity: data.addressCity,
          addressState: data.addressState.toUpperCase(),
          addressNeighborhood: data.addressNeighborhood,
          pixKey: data.pixKey || "",
        },
      },
    },
    include: { supplier: { select: { id: true, businessName: true } } },
  });

  await createSession(user.id);

  return {
    ok: true,
    supplierId: user.supplier?.id,
    businessName: user.supplier?.businessName,
  };
}
