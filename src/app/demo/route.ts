// GET /demo — login automático como a Joana (seed) e redirect pra /app.
// Pro botão "ver demo" da landing — entra direto no dashboard sem cadastrar.

import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  // Pega Joana (primeira MEI do seed). Se não existir, joga pro cadastro.
  const joana = await db.user.findFirst({
    where: { role: "ENTREPRENEUR", email: "joana@ondapreta.com.br" },
    select: { id: true },
  });

  const target = new URL(joana ? "/app" : "/cadastro", request.url);

  if (joana) {
    await createSession(joana.id);
  }

  return NextResponse.redirect(target);
}
