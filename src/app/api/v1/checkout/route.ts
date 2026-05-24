// src/app/api/v1/checkout/route.ts
// POST cria uma CheckoutSession. Aceita 2 modos:
// - QR_PRESENCIAL: chamado por lojista logado via server action interna
//   (autoriza por sessão httpOnly)
// - API_MARKETPLACE: chamado por marketplace externo (Bearer token mock pro MVP)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
  isValidPrazo,
} from "@/lib/checkout";

const ItemSchema = z.object({
  name: z.string().min(1).max(120),
  qty: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

const CreateCheckoutSchema = z.object({
  supplierId: z.string().min(1).optional(),
  amount: z.number().int().positive(),
  items: z.array(ItemSchema).min(1),
  prazo: z.number().int(),
  entrepreneurCpf: z.string().optional(),
  marketplaceId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = CreateCheckoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  if (!isValidPrazo(body.prazo)) {
    return NextResponse.json(
      { error: "invalid_prazo", allowed: [15, 30, 45, 60] },
      { status: 400 },
    );
  }

  // Determinar fonte e supplierId
  let supplierId: string;
  let source: "QR_PRESENCIAL" | "API_MARKETPLACE";

  if (body.marketplaceId) {
    source = "API_MARKETPLACE";
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing_token" }, { status: 401 });
    }
    if (!body.supplierId) {
      return NextResponse.json(
        { error: "supplierId_required_for_marketplace" },
        { status: 400 },
      );
    }
    supplierId = body.supplierId;
  } else {
    source = "QR_PRESENCIAL";
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPPLIER" || !user.supplierId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    supplierId = user.supplierId;
  }

  // Resolver entrepreneurId via CPF (cnpj no schema atual representa o doc)
  let entrepreneurId: string | undefined;
  if (body.entrepreneurCpf) {
    const ent = await db.entrepreneurProfile.findUnique({
      where: { cnpj: body.entrepreneurCpf },
      select: { id: true },
    });
    entrepreneurId = ent?.id;
  }

  const code = await generateUniqueCode();

  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId,
      entrepreneurId,
      amount: BigInt(body.amount),
      items: body.items,
      prazo: body.prazo,
      source,
      expiresAt: expirationFromNow(),
      marketplaceId: body.marketplaceId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      webhookUrl: body.webhookUrl,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3010";
  const payUrl = `${baseUrl}/pay/${formatCode(code)}`;

  return NextResponse.json({
    id: session.id,
    code: formatCode(code),
    payUrl,
    expiresAt: session.expiresAt.toISOString(),
    status: session.status,
  });
}
