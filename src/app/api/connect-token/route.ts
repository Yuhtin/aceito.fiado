// POST /api/connect-token
// Cria um Pluggy Connect Token server-side pra MEI conectar Open Finance
// durante o cadastro. Mantém credenciais Pluggy fora do browser.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PluggyService, PluggyUnavailableError } from "@/lib/credit-engine/pluggy/service";

const ConnectTokenSchema = z.object({
  clientUserId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = ConnectTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const pluggy = new PluggyService();
    const { accessToken } = await pluggy.createConnectToken(
      parsed.data.clientUserId,
    );
    return NextResponse.json({ accessToken });
  } catch (error) {
    const message =
      error instanceof PluggyUnavailableError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unable to create Pluggy connect token";
    return NextResponse.json(
      { error: "PLUGGY_UNAVAILABLE", message },
      { status: 503 },
    );
  }
}
