// Auth simples baseada em sessão no Postgres + cookie httpOnly.
//
// Por que não NextAuth/Auth.js?
//   Compat com Next 16 ainda em estabilização — pra demo, manter simples
//   e auditável vale mais.

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";

import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "af_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 dias

// ─────────────────────── Sessions ──────────────────────

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { token, userId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  entrepreneurId?: string;
  supplierId?: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          entrepreneur: { select: { id: true } },
          supplier: { select: { id: true } },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    entrepreneurId: session.user.entrepreneur?.id,
    supplierId: session.user.supplier?.id,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireEntrepreneur(): Promise<
  AuthUser & { entrepreneurId: string }
> {
  const user = await requireUser();
  if (user.role !== "ENTREPRENEUR" || !user.entrepreneurId) {
    redirect("/entrar");
  }
  return user as AuthUser & { entrepreneurId: string };
}

export async function requireSupplier(): Promise<
  AuthUser & { supplierId: string }
> {
  const user = await requireUser();
  if (user.role !== "SUPPLIER" || !user.supplierId) {
    redirect("/entrar");
  }
  return user as AuthUser & { supplierId: string };
}
