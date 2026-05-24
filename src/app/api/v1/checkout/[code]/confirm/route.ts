// src/app/api/v1/checkout/[code]/confirm/route.ts
// POST confirma fiado: cria Order, atualiza sessão, dispara webhook (best-effort).
// Requer MEI logada (sessão).

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePricing, parseCode } from "@/lib/checkout";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ENTREPRENEUR" || !user.entrepreneurId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code: rawCode } = await params;
  const code = parseCode(rawCode);

  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: { supplier: true },
  });

  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (session.status !== "PENDING") {
    return NextResponse.json(
      { error: "not_pending", status: session.status },
      { status: 409 },
    );
  }
  if (session.expiresAt < new Date()) {
    await db.checkoutSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "expired" }, { status: 410 });
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

  // Webhook best-effort
  if (session.source === "API_MARKETPLACE" && session.webhookUrl) {
    fetch(session.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: session.code,
        status: "CONFIRMED",
        amount: pricing.amount,
        orderId: order.id,
        confirmedAt: new Date().toISOString(),
      }),
    }).catch(() => {
      // log silencioso pro MVP
    });
  }

  return NextResponse.json({
    orderId: order.id,
    status: "CONFIRMED",
    dueDate: dueDate.toISOString(),
    totalCents: pricing.totalCents,
    successUrl: session.successUrl,
  });
}
