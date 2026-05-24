"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type AuthFormState = {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
};

export async function loginAction(
  _prev: AuthFormState,
  data: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: String(data.get("email") ?? "").toLowerCase().trim(),
    password: String(data.get("password") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      fields: { email: String(data.get("email") ?? "") },
    };
  }
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      entrepreneur: { select: { id: true } },
      supplier: { select: { id: true } },
    },
  });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return {
      ok: false,
      error: "E-mail ou senha incorretos",
      fields: { email: parsed.data.email },
    };
  }
  await createSession(user.id);
  const next = String(data.get("next") ?? "").trim();
  if (user.role === "ENTREPRENEUR") {
    // Honrar ?next= pra deep links (ex: /pay/[code])
    redirect(next && next.startsWith("/") ? next : "/app");
  } else if (user.role === "SUPPLIER") {
    redirect("/fornecedor");
  } else {
    redirect("/");
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

const RegisterEntrepreneurSchema = z.object({
  name: z.string().min(3, "Informe seu nome"),
  email: z.string().email(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos"),
  businessName: z.string().min(2),
  phone: z.string().min(10),
  addressCep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  addressCity: z.string().min(2),
  addressState: z.string().length(2),
  addressNeighborhood: z.string().min(2),
  businessSince: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function registerEntrepreneurAction(
  input: z.infer<typeof RegisterEntrepreneurSchema>,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const parsed = RegisterEntrepreneurSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const existing = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return { ok: false, error: "Já existe uma conta com esse e-mail" };
  }
  const existingCnpj = await db.entrepreneurProfile.findUnique({
    where: { cnpj: parsed.data.cnpj.replace(/\D/g, "") },
  });
  if (existingCnpj) {
    return { ok: false, error: "Já existe uma empreendedora com esse CNPJ" };
  }

  const user = await db.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash: hashPassword(parsed.data.password),
      role: "ENTREPRENEUR",
      name: parsed.data.name,
      entrepreneur: {
        create: {
          cnpj: parsed.data.cnpj.replace(/\D/g, ""),
          businessName: parsed.data.businessName,
          phone: parsed.data.phone.replace(/\D/g, ""),
          addressCep: parsed.data.addressCep,
          addressCity: parsed.data.addressCity,
          addressState: parsed.data.addressState.toUpperCase(),
          addressNeighborhood: parsed.data.addressNeighborhood,
          businessSince: new Date(parsed.data.businessSince),
        },
      },
    },
  });
  await createSession(user.id);
  return { ok: true, userId: user.id };
}
