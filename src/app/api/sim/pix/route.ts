// Simula um Pix entrando na conta da empreendedora.
//
// Usado pra demo: a empreendedora aperta "simular Pix" e a gente
// gera uma transação realista + aplica a trava automaticamente.
// Em produção, isso viria do webhook do banco parceiro.

import { NextResponse } from "next/server";

import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { planAllocation } from "@/lib/receivables";
import { randomTxid } from "@/lib/utils";

const PAYER_NAMES = [
  "Mariana Souza",
  "Carla Pereira",
  "Juliana Ribeiro",
  "Renata Lima",
  "Fernanda Costa",
  "Patrícia Almeida",
  "Aline Martins",
  "Camila Rocha",
];

function randomCpf(): string {
  return Array.from({ length: 11 }, () =>
    Math.floor(Math.random() * 10),
  )
    .join("")
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export async function POST(request: Request) {
  const user = await requireEntrepreneur();

  // Pega 1 canal aleatório ativo
  const channel = await db.channel.findFirst({
    where: { entrepreneurId: user.entrepreneurId, status: "ACTIVE" },
    orderBy: { connectedAt: "desc" },
  });

  // Gera Pix com valor entre R$ 80 e R$ 350
  const valueCents = BigInt(
    Math.round(8_000 + Math.random() * 27_000),
  );

  const pix = await db.pixTransaction.create({
    data: {
      entrepreneurId: user.entrepreneurId,
      channelId: channel?.id,
      valueCents,
      payerName:
        PAYER_NAMES[Math.floor(Math.random() * PAYER_NAMES.length)],
      payerDocument: randomCpf(),
      txid: randomTxid(),
      receivedAt: new Date(),
    },
  });

  // Aplica trava: busca operações ativas, decide alocação
  const activeOrders = await db.order.findMany({
    where: {
      entrepreneurId: user.entrepreneurId,
      status: { in: ["ACTIVE", "FUNDED"] },
    },
    include: {
      receivables: { select: { amountCapturedCents: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const plan = planAllocation(
    valueCents,
    activeOrders.map((o) => ({
      id: o.id,
      customerPayCents: o.customerPayCents,
      captureRateBps: o.captureRateBps,
      paidCents: o.receivables.reduce(
        (acc, r) => acc + r.amountCapturedCents,
        0n,
      ),
    })),
  );

  if (plan.allocations.length > 0) {
    // Pix pode ir pra uma única ordem? Sim — pegamos a primeira alocação
    // (a duplicata mais próxima do vencimento). Em produção real, dá pra
    // dividir entre N — pra demo, simplificamos pra primeira.
    const allocation = plan.allocations[0];
    await db.receivable.create({
      data: {
        orderId: allocation.orderId,
        pixTransactionId: pix.id,
        amountCapturedCents: allocation.appliedCents,
        capturedAt: new Date(),
      },
    });
    await db.pixTransaction.update({
      where: { id: pix.id },
      data: {
        captured: true,
        capturedAmountCents: allocation.appliedCents,
      },
    });

    // Se cobriu o pedido, marca REPAID
    const totalPaidAfter = activeOrders
      .find((o) => o.id === allocation.orderId)!
      .receivables.reduce((acc, r) => acc + r.amountCapturedCents, 0n) +
      allocation.appliedCents;

    const order = activeOrders.find((o) => o.id === allocation.orderId)!;
    if (totalPaidAfter >= order.customerPayCents) {
      await db.order.update({
        where: { id: order.id },
        data: { status: "REPAID", repaidAt: new Date() },
      });
      await db.duplicata.updateMany({
        where: { orderId: order.id },
        data: { status: "LIQUIDATED" },
      });
    }
  }

  return NextResponse.redirect(new URL("/app/trava", request.url));
}
