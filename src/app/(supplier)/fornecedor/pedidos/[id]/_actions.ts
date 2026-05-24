"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { calcDueDate } from "@/lib/pricing";
import { nextDuplicataNumero, randomTxid } from "@/lib/utils";

const ConfirmSchema = z.object({ orderId: z.string().min(1) });

export async function confirmOrderAction(
  input: z.infer<typeof ConfirmSchema>,
): Promise<{
  ok: boolean;
  error?: string;
  duplicataNumero?: string;
  amountFormatted?: string;
}> {
  const user = await requireSupplier();
  const parsed = ConfirmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pedido inválido" };

  const order = await db.order.findFirst({
    where: {
      id: parsed.data.orderId,
      supplierId: user.supplierId,
      status: "AWAITING_SUPPLIER",
    },
    include: {
      supplier: true,
      entrepreneur: true,
    },
  });
  if (!order) {
    return { ok: false, error: "Pedido não está pendente" };
  }

  const now = new Date();
  const dueDate = calcDueDate(now, order.termDays);

  const duplicataCount = await db.duplicata.count();
  const numero = nextDuplicataNumero(1000 + duplicataCount + 1);

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "ACTIVE",
        confirmedAt: now,
        fundedAt: now,
        dueDate,
      },
    });
    await tx.duplicata.create({
      data: {
        orderId: order.id,
        numero,
        valorCents: order.customerPayCents,
        vencimento: dueDate,
        sacadoCnpj: order.entrepreneur.cnpj,
        sacadoNome: order.entrepreneur.businessName,
        sacadorCnpj: order.supplier.cnpj,
        sacadorNome: order.supplier.businessName,
        registradoraCode: "CERC",
        registradoraTxid: randomTxid("CERC"),
        status: "REGISTERED",
        issuedAt: now,
      },
    });
  });

  revalidatePath("/fornecedor");
  revalidatePath("/fornecedor/pedidos");
  revalidatePath(`/fornecedor/pedidos/${order.id}`);
  revalidatePath("/app");

  return {
    ok: true,
    duplicataNumero: numero,
    amountFormatted: formatBRL(order.supplierReceiveCents),
  };
}

const CancelSchema = z.object({ orderId: z.string().min(1) });

export async function cancelOrderAction(
  input: z.infer<typeof CancelSchema>,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireSupplier();
  const parsed = CancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pedido inválido" };

  const order = await db.order.findFirst({
    where: {
      id: parsed.data.orderId,
      supplierId: user.supplierId,
      status: "AWAITING_SUPPLIER",
    },
  });
  if (!order) return { ok: false, error: "Pedido não pode ser cancelado" };

  await db.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/fornecedor");
  revalidatePath("/fornecedor/pedidos");
  revalidatePath("/app");

  return { ok: true };
}
