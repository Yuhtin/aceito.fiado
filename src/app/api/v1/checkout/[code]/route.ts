// src/app/api/v1/checkout/[code]/route.ts
// GET retorna dados pra MEI confirmar fiado.
// Público — qualquer um com o code pode ler (UX: link compartilhável).

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { calculatePricing, formatCode, parseCode } from "@/lib/checkout";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = parseCode(rawCode);

  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          addressNeighborhood: true,
          addressCity: true,
          addressState: true,
          logoUrl: true,
          category: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const expired =
    session.status === "PENDING" && session.expiresAt < new Date();

  const pricing = calculatePricing(Number(session.amount));

  return NextResponse.json({
    code: formatCode(session.code),
    status: expired ? "EXPIRED" : session.status,
    amount: pricing.amount,
    feeCents: pricing.feeCents,
    totalCents: pricing.totalCents,
    prazo: session.prazo,
    items: session.items,
    expiresAt: session.expiresAt.toISOString(),
    confirmedAt: session.confirmedAt?.toISOString() ?? null,
    supplier: session.supplier,
    source: session.source,
    successUrl: session.successUrl,
    cancelUrl: session.cancelUrl,
  });
}
