"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePricing, parseCode } from "@/lib/checkout";

export async function loadCheckout(formattedCode: string) {
  const code = parseCode(formattedCode);
  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: {
      supplier: {
        select: {
          businessName: true,
          addressNeighborhood: true,
          addressCity: true,
          addressState: true,
          category: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!session) return { ok: false as const, reason: "not_found" as const };

  const expired =
    session.status === "PENDING" && session.expiresAt < new Date();

  const pricing = calculatePricing(Number(session.amount));

  return {
    ok: true as const,
    data: {
      code: formattedCode.toUpperCase(),
      status: expired ? ("EXPIRED" as const) : (session.status),
      amount: pricing.amount,
      feeCents: pricing.feeCents,
      totalCents: pricing.totalCents,
      prazo: session.prazo,
      items: session.items as Array<{ name: string; qty: number; priceCents: number }>,
      supplier: session.supplier,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}

export async function confirmCheckoutAction(
  formattedCode: string,
): Promise<
  | { ok: true; data: { dueDate: string; totalCents: number; orderId: string } }
  | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ENTREPRENEUR" || !user.entrepreneurId) {
    return { ok: false, error: "precisa estar logada como MEI pra confirmar" };
  }

  const code = parseCode(formattedCode);
  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: { supplier: true },
  });
  if (!session) return { ok: false, error: "checkout não encontrado" };
  if (session.status !== "PENDING")
    return { ok: false, error: `status inesperado: ${session.status}` };
  if (session.expiresAt < new Date()) {
    await db.checkoutSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    return { ok: false, error: "expirou" };
  }

  const pricing = calculatePricing(Number(session.amount));
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + session.prazo);

  const order = await db.order.create({
    data: {
      entrepreneurId: user.entrepreneurId,
      supplierId: session.supplierId,
      status: "FUNDED",
      subtotalCents: BigInt(pricing.amount),
      supplierDiscountBps: 300,
      supplierReceiveCents: BigInt(
        pricing.amount - Math.round((pricing.amount * 300) / 10000),
      ),
      customerInterestBps: pricing.feeBps,
      customerPayCents: BigInt(pricing.totalCents),
      termDays: session.prazo,
      platformFeeCents: BigInt(pricing.feeCents),
      captureRateBps: 3000,
      confirmedAt: new Date(),
      fundedAt: new Date(),
      dueDate,
    },
  });

  await db.checkoutSession.update({
    where: { id: session.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      entrepreneurId: user.entrepreneurId,
      orderId: order.id,
    },
  });

  return {
    ok: true,
    data: {
      dueDate: dueDate.toISOString(),
      totalCents: pricing.totalCents,
      orderId: order.id,
    },
  };
}
