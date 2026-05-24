// Pricing da operação de fiado.
//
// Subtotal: soma dos itens.
// Fornecedor recebe à vista: subtotal × (1 − supplierDiscountBps/10000).
// Empreendedora paga no vencimento: subtotal × (1 + customerInterestBps/10000).
// Spread da plataforma: (customerPay − subtotal) + (subtotal − supplierReceive).

import type { Prisma } from "@/generated/prisma/client";

export type PricingInputs = {
  subtotalCents: bigint;
  supplierDiscountBps: number; // 300 = 3%
  customerInterestBps: number; // 500 = 5%
  termDays: number;
};

export type PricingResult = {
  subtotalCents: bigint;
  supplierReceiveCents: bigint;
  customerPayCents: bigint;
  platformFeeCents: bigint;
  termDays: number;
  supplierDiscountBps: number;
  customerInterestBps: number;
  totalInterestRateBps: number;
  monthlyInterestRate: number;
  yearlyInterestRate: number;
};

function applyBps(value: bigint, bps: number, signedAdd: boolean): bigint {
  // bps positivo: signedAdd=false → subtrai (desconto); true → soma (juros)
  const factor = BigInt(Math.round(bps));
  const delta = (value * factor) / 10000n;
  return signedAdd ? value + delta : value - delta;
}

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const { subtotalCents, supplierDiscountBps, customerInterestBps, termDays } =
    inputs;

  const supplierReceiveCents = applyBps(
    subtotalCents,
    supplierDiscountBps,
    false,
  );
  const customerPayCents = applyBps(
    subtotalCents,
    customerInterestBps,
    true,
  );
  const platformFeeCents = customerPayCents - supplierReceiveCents;

  const monthlyFactor = termDays > 0 ? 30 / termDays : 1;
  const periodRate = customerInterestBps / 10000;
  const monthlyInterestRate = periodRate * monthlyFactor;
  // Aproximação composta: (1 + period) ^ (365/term) − 1
  const yearlyInterestRate =
    termDays > 0
      ? Math.pow(1 + periodRate, 365 / termDays) - 1
      : periodRate;

  return {
    subtotalCents,
    supplierReceiveCents,
    customerPayCents,
    platformFeeCents,
    termDays,
    supplierDiscountBps,
    customerInterestBps,
    totalInterestRateBps: customerInterestBps,
    monthlyInterestRate,
    yearlyInterestRate,
  };
}

// Ajusta a taxa de juros ao prazo: prazos maiores cobram mais.
export function getInterestBpsForTerm(termDays: number): number {
  if (termDays <= 30) return 400; // 4%
  if (termDays <= 45) return 500; // 5%
  if (termDays <= 60) return 650; // 6.5%
  return 800;
}

export function getCaptureRateBpsForTerm(termDays: number): number {
  // Quanto maior o prazo, maior a fatia do Pix capturada (pra liquidar antes do vencimento)
  if (termDays <= 30) return 2500; // 25%
  if (termDays <= 45) return 3000; // 30%
  return 3500; // 35%
}

export function calcDueDate(fundedAt: Date, termDays: number): Date {
  const due = new Date(fundedAt);
  due.setDate(due.getDate() + termDays);
  return due;
}

export type PricingForDB = Pick<
  Prisma.OrderUncheckedCreateInput,
  | "subtotalCents"
  | "supplierReceiveCents"
  | "customerPayCents"
  | "platformFeeCents"
  | "supplierDiscountBps"
  | "customerInterestBps"
  | "termDays"
  | "captureRateBps"
>;
