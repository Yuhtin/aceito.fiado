"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculatePricing,
  getCaptureRateBpsForTerm,
  getInterestBpsForTerm,
} from "@/lib/pricing";

const SubmitOrderSchema = z.object({
  supplierId: z.string().min(1),
  termDays: z.number().int().refine((n) => [30, 45, 60].includes(n), {
    message: "Prazo inválido",
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function submitOrderAction(
  input: z.infer<typeof SubmitOrderSchema>,
): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const parsed = SubmitOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  const user = await requireEntrepreneur();

  const [supplier, score, activeOrders, products] = await Promise.all([
    db.supplierProfile.findUnique({ where: { id: parsed.data.supplierId } }),
    db.scoreSnapshot.findFirst({
      where: { entrepreneurId: user.entrepreneurId },
      orderBy: { calculatedAt: "desc" },
    }),
    db.order.findMany({
      where: {
        entrepreneurId: user.entrepreneurId,
        status: {
          in: ["AWAITING_SUPPLIER", "SUPPLIER_CONFIRMED", "FUNDED", "ACTIVE"],
        },
      },
      select: { supplierReceiveCents: true },
    }),
    db.product.findMany({
      where: {
        id: { in: parsed.data.items.map((i) => i.productId) },
        supplierId: parsed.data.supplierId,
        active: true,
      },
    }),
  ]);

  if (!supplier) return { ok: false, error: "Fornecedor não encontrado" };
  if (!score)
    return { ok: false, error: "Você ainda não tem score calculado" };

  if (products.length !== parsed.data.items.length) {
    return { ok: false, error: "Algum produto não está disponível" };
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  let subtotalCents = 0n;
  const itemsForDB = parsed.data.items.map((item) => {
    const product = productById.get(item.productId)!;
    if (item.quantity < product.minQuantity) {
      throw new Error(
        `Quantidade mínima de ${product.name}: ${product.minQuantity}`,
      );
    }
    if (item.quantity > product.stock) {
      throw new Error(`Estoque insuficiente de ${product.name}`);
    }
    const total = product.priceCents * BigInt(item.quantity);
    subtotalCents += total;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      totalCents: total,
    };
  });

  const pricing = calculatePricing({
    subtotalCents,
    supplierDiscountBps: supplier.defaultDiscountBps,
    customerInterestBps: getInterestBpsForTerm(parsed.data.termDays),
    termDays: parsed.data.termDays,
  });

  const committed = activeOrders.reduce(
    (a, o) => a + o.supplierReceiveCents,
    0n,
  );
  const available = score.approvedLimitCents - committed;
  if (pricing.supplierReceiveCents > available) {
    return { ok: false, error: "Pedido excede o limite disponível" };
  }

  const order = await db.order.create({
    data: {
      entrepreneurId: user.entrepreneurId,
      supplierId: supplier.id,
      status: "AWAITING_SUPPLIER",
      subtotalCents: pricing.subtotalCents,
      supplierDiscountBps: supplier.defaultDiscountBps,
      supplierReceiveCents: pricing.supplierReceiveCents,
      customerInterestBps: pricing.customerInterestBps,
      customerPayCents: pricing.customerPayCents,
      platformFeeCents: pricing.platformFeeCents,
      termDays: parsed.data.termDays,
      captureRateBps: getCaptureRateBpsForTerm(parsed.data.termDays),
      items: { create: itemsForDB },
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/fiado");
  revalidatePath("/fornecedor");
  return { ok: true, orderId: order.id };
}
