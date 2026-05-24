// src/app/(supplier)/fornecedor/cobrar/_actions.ts
"use server";

import { revalidatePath } from "next/cache";

import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
  isValidPrazo,
} from "@/lib/checkout";

export interface CobrarItem {
  name: string;
  qty: number;
  priceCents: number;
}

export interface CobrarResult {
  code: string;
  payUrl: string;
  expiresAt: string;
}

export async function createCheckoutAction(input: {
  entrepreneurCpf?: string;
  items: CobrarItem[];
  prazo: number;
}): Promise<{ ok: true; data: CobrarResult } | { ok: false; error: string }> {
  const user = await requireSupplier();

  if (!input.items.length) {
    return { ok: false, error: "adicione pelo menos um item" };
  }
  if (!isValidPrazo(input.prazo)) {
    return { ok: false, error: "prazo inválido (use 15, 30, 45 ou 60)" };
  }

  const amount = input.items.reduce(
    (sum, it) => sum + it.priceCents * it.qty,
    0,
  );
  if (amount <= 0) {
    return { ok: false, error: "valor total deve ser positivo" };
  }

  let entrepreneurId: string | undefined;
  if (input.entrepreneurCpf) {
    const ent = await db.entrepreneurProfile.findUnique({
      where: { cnpj: input.entrepreneurCpf.replace(/\D/g, "") },
      select: { id: true },
    });
    entrepreneurId = ent?.id;
  }

  const code = await generateUniqueCode();
  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId: user.supplierId,
      entrepreneurId,
      amount: BigInt(amount),
      items: input.items as unknown as import("@/generated/prisma/client").Prisma.InputJsonValue,
      prazo: input.prazo,
      source: "QR_PRESENCIAL",
      expiresAt: expirationFromNow(),
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3010";
  const formatted = formatCode(code);

  revalidatePath("/fornecedor/cobrar");

  return {
    ok: true,
    data: {
      code: formatted,
      payUrl: `${baseUrl}/pay/${formatted}`,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}

export async function getCheckoutStatus(code: string) {
  await requireSupplier();
  const raw = code.replace(/-/g, "").toUpperCase();
  const session = await db.checkoutSession.findUnique({
    where: { code: raw },
    select: { status: true, confirmedAt: true, orderId: true },
  });
  return session;
}
