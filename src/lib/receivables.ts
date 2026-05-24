// Engine de trava de recebíveis.
//
// Quando entra um Pix na conta da empreendedora, parte do valor é direcionado
// pra liquidar as duplicatas ativas no AceitoFiado.
//
// Regras:
//   1. Pega operações ACTIVE em ordem de vencimento (mais antigo primeiro).
//   2. Aplica captureRateBps sobre o valor do Pix.
//   3. Distribui esse valor entre as operações até zerar ou cobrir tudo.
//   4. Cria Receivable por captura.
//
// Em produção real, isso seria uma instrução à registradora B3 via API.

import type { Order } from "@/generated/prisma/client";

export type AllocationPlan = {
  pixValueCents: bigint;
  totalCapturedCents: bigint;
  allocations: Array<{
    orderId: string;
    appliedCents: bigint;
    remainingDebtCents: bigint;
  }>;
};

export function planAllocation(
  pixValueCents: bigint,
  activeOrders: Array<
    Pick<Order, "id" | "customerPayCents" | "captureRateBps"> & {
      paidCents: bigint;
    }
  >,
): AllocationPlan {
  // Usa o maior captureRate entre operações ativas — modelo conservador.
  const captureRate = activeOrders.reduce(
    (acc, o) => Math.max(acc, o.captureRateBps),
    0,
  );

  const toCapture =
    (pixValueCents * BigInt(captureRate)) / 10000n;

  let remaining = toCapture;
  const allocations: AllocationPlan["allocations"] = [];

  // Ordena por vencimento → assumimos que activeOrders já vem ordenado
  for (const order of activeOrders) {
    if (remaining <= 0n) break;
    const debt = order.customerPayCents - order.paidCents;
    if (debt <= 0n) continue;
    const apply = remaining < debt ? remaining : debt;
    allocations.push({
      orderId: order.id,
      appliedCents: apply,
      remainingDebtCents: debt - apply,
    });
    remaining -= apply;
  }

  const totalCaptured = toCapture - remaining;
  return {
    pixValueCents,
    totalCapturedCents: totalCaptured,
    allocations,
  };
}
