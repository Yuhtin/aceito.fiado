"use server";

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
