// src/lib/checkout.ts
// Helpers pra CheckoutSession: geração de código curto, validação de prazo,
// cálculo de expiração e taxa AceitoFiado.

import "server-only";

import { db } from "@/lib/db";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTVWXYZ23456789"; // sem I, O, U, 0, 1
const CODE_BLOCK_SIZE = 4;
const CODE_BLOCKS = 3;
const PRAZO_OPTIONS = [15, 30, 45, 60] as const;
const CHECKOUT_TTL_MINUTES = 30;
const FEE_BPS = 500; // 5% — taxa AceitoFiado padrão

export type PrazoOption = (typeof PRAZO_OPTIONS)[number];

export function isValidPrazo(value: number): value is PrazoOption {
  return PRAZO_OPTIONS.includes(value as PrazoOption);
}

/**
 * Gera código curto formato AF7K-9M2C-X1 (12 chars + 2 hífens).
 * Prefixa "AF" só no display — armazenamos sem hífens uppercase.
 */
function randomCode(): string {
  let raw = "";
  for (let i = 0; i < CODE_BLOCK_SIZE * CODE_BLOCKS; i++) {
    raw += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return raw;
}

export function formatCode(raw: string): string {
  // AFXKQ9M2CX1Z → AFXK-Q9M2-CX1Z
  const blocks: string[] = [];
  for (let i = 0; i < raw.length; i += CODE_BLOCK_SIZE) {
    blocks.push(raw.slice(i, i + CODE_BLOCK_SIZE));
  }
  return blocks.join("-");
}

export function parseCode(formatted: string): string {
  return formatted.replace(/-/g, "").toUpperCase();
}

/**
 * Tenta gerar um código único (até 5 tentativas). Lança se colidir.
 */
export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await db.checkoutSession.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("não conseguiu gerar code único em 5 tentativas");
}

export function expirationFromNow(): Date {
  return new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000);
}

export interface CheckoutPricing {
  amount: number; // centavos
  feeBps: number;
  feeCents: number;
  totalCents: number;
}

export function calculatePricing(amountCents: number): CheckoutPricing {
  const feeCents = Math.round((amountCents * FEE_BPS) / 10000);
  return {
    amount: amountCents,
    feeBps: FEE_BPS,
    feeCents,
    totalCents: amountCents + feeCents,
  };
}

export const PRAZO_OPTIONS_LIST = PRAZO_OPTIONS;
export { CODE_ALPHABET, CHECKOUT_TTL_MINUTES, FEE_BPS };
