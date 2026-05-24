"use server";

import { z } from "zod";

import { createSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculateScore,
  calculateCashflowStability,
} from "@/lib/scoring";
import type { ChannelType } from "@/generated/prisma/client";

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
  businessName: z.string().min(2),
  phone: z.string().min(10),
  addressCep: z.string().regex(/^\d{8}$/),
  addressCity: z.string().min(2),
  addressState: z.string().length(2),
  addressNeighborhood: z.string().min(2),
  monthsActive: z.number().int().nonnegative(),
  channels: z.array(ChannelInput).min(1, "Conecte pelo menos um canal"),
});

export async function completeOnboardingAction(
  input: z.infer<typeof OnboardingSchema>,
): Promise<{
  ok: boolean;
  error?: string;
  score?: number;
  approvedLimitCents?: string;
  approved?: boolean;
}> {
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

  const totalMonthlyCents = data.channels.reduce(
    (a, c) => a + c.monthlyRevenueCents,
    0,
  );
  const medianRevenueCents = BigInt(totalMonthlyCents);

  // Estabilidade simulada: se canais > 1, assumimos boa distribuição
  const stability =
    data.channels.length >= 3
      ? 0.85
      : data.channels.length === 2
        ? 0.7
        : 0.55;

  const scoreResult = calculateScore({
    monthlyRevenueCents: medianRevenueCents,
    monthsActive: data.monthsActive,
    channelsCount: data.channels.length,
    cashflowStabilityScore: stability,
    supplierHistoryScore: 0,
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
          businessName: data.businessName,
          phone: data.phone,
          addressCep: data.addressCep,
          addressCity: data.addressCity,
          addressState: data.addressState.toUpperCase(),
          addressNeighborhood: data.addressNeighborhood,
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
          scoreSnapshots: {
            create: {
              score: scoreResult.score,
              approvedLimitCents: scoreResult.approvedLimitCents,
              rationale: scoreResult.rationale,
              inputsJson: {
                monthlyRevenueCents: medianRevenueCents.toString(),
                monthsActive: data.monthsActive,
                channelsCount: data.channels.length,
                cashflowStabilityScore: stability,
                supplierHistoryScore: 0,
                factors: scoreResult.factors.map((f) => ({
                  ...f,
                  rawValue: String(f.rawValue),
                })),
              },
            },
          },
        },
      },
    },
  });

  await createSession(user.id);

  return {
    ok: true,
    score: scoreResult.score,
    approvedLimitCents: scoreResult.approvedLimitCents.toString(),
    approved: scoreResult.approved,
  };
}
