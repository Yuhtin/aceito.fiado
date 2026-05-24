// src/app/demo-marketplace/_actions.ts
"use server";

import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
} from "@/lib/checkout";

const FAKE_ITEM = {
  name: "Turbante Imbondeiro · médio",
  qty: 1,
  priceCents: 18900,
};

export async function createDemoCheckout() {
  // Pegar o primeiro supplier do seed pra usar como vendedor
  const supplier = await db.supplierProfile.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!supplier) throw new Error("nenhum supplier no seed");

  const code = await generateUniqueCode();
  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId: supplier.id,
      amount: BigInt(FAKE_ITEM.priceCents),
      items: [FAKE_ITEM],
      prazo: 30,
      source: "API_MARKETPLACE",
      expiresAt: expirationFromNow(),
      marketplaceId: "feirapreta-demo",
      successUrl: "/demo-marketplace/obrigado",
      cancelUrl: "/demo-marketplace",
    },
  });

  return {
    code: formatCode(session.code),
    payUrl: `/pay/${formatCode(session.code)}?from=marketplace`,
  };
}
