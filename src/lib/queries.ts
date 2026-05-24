// Queries reutilizadas em várias páginas.

import "server-only";

import { db } from "@/lib/db";

export type EntrepreneurOverview = Awaited<
  ReturnType<typeof getEntrepreneurOverview>
>;

export async function getEntrepreneurOverview(entrepreneurId: string) {
  const [profile, latestScore, channels, activeOrders, pastOrders, receivables90d, pixLast30d] = await Promise.all([
    db.entrepreneurProfile.findUniqueOrThrow({
      where: { id: entrepreneurId },
    }),
    db.scoreSnapshot.findFirst({
      where: { entrepreneurId },
      orderBy: { calculatedAt: "desc" },
    }),
    db.channel.findMany({
      where: { entrepreneurId, status: "ACTIVE" },
      orderBy: { monthlyRevenueCents: "desc" },
    }),
    db.order.findMany({
      where: {
        entrepreneurId,
        status: { in: ["ACTIVE", "FUNDED", "SUPPLIER_CONFIRMED", "AWAITING_SUPPLIER"] },
      },
      include: {
        supplier: { select: { businessName: true, category: true } },
        receivables: { select: { amountCapturedCents: true } },
        duplicata: { select: { numero: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.order.findMany({
      where: { entrepreneurId, status: { in: ["REPAID", "OVERDUE"] } },
      include: {
        supplier: { select: { businessName: true } },
      },
      orderBy: { repaidAt: "desc" },
      take: 8,
    }),
    db.receivable.findMany({
      where: {
        order: { entrepreneurId },
        capturedAt: { gte: daysAgo(90) },
      },
      orderBy: { capturedAt: "desc" },
    }),
    db.pixTransaction.findMany({
      where: {
        entrepreneurId,
        receivedAt: { gte: daysAgo(30) },
      },
      orderBy: { receivedAt: "desc" },
      include: { channel: { select: { type: true, label: true } } },
    }),
  ]);

  // Limite em uso = soma do principal (supplierReceive) das operações não-quitadas.
  // O capital tá comprometido com a operação enquanto ela não chega em REPAID.
  const inUseCents = activeOrders.reduce(
    (sum, o) => sum + o.supplierReceiveCents,
    0n,
  );

  // Quanto ainda falta a empreendedora pagar (visão de dívida)
  const outstandingCents = activeOrders.reduce((sum, o) => {
    const paid = o.receivables.reduce(
      (acc, r) => acc + r.amountCapturedCents,
      0n,
    );
    const remaining = o.customerPayCents - paid;
    return sum + (remaining > 0n ? remaining : 0n);
  }, 0n);

  const approvedLimit = latestScore?.approvedLimitCents ?? 0n;
  const availableLimit = approvedLimit - inUseCents;

  // Captura mensal
  const capturedThisMonth = receivables90d
    .filter((r) => r.capturedAt >= startOfMonth())
    .reduce((acc, r) => acc + r.amountCapturedCents, 0n);

  // Pix recebido este mês
  const pixThisMonth = pixLast30d
    .filter((p) => p.receivedAt >= startOfMonth())
    .reduce((acc, p) => acc + p.valueCents, 0n);

  return {
    profile,
    score: latestScore,
    channels,
    activeOrders,
    pastOrders,
    receivables90d,
    pixLast30d,
    approvedLimit,
    inUseCents,
    availableLimit: availableLimit > 0n ? availableLimit : 0n,
    outstandingCents,
    capturedThisMonth,
    pixThisMonth,
  };
}

export type SupplierOverview = Awaited<ReturnType<typeof getSupplierOverview>>;

export async function getSupplierOverview(supplierId: string) {
  const [profile, productsCount, awaiting, active, recentlyFunded] = await Promise.all([
    db.supplierProfile.findUniqueOrThrow({ where: { id: supplierId } }),
    db.product.count({ where: { supplierId, active: true } }),
    db.order.findMany({
      where: { supplierId, status: "AWAITING_SUPPLIER" },
      include: {
        entrepreneur: { select: { businessName: true, addressCity: true, addressState: true } },
        items: { include: { product: { select: { name: true, unit: true } } } },
      },
      orderBy: { requestedAt: "desc" },
    }),
    db.order.findMany({
      where: { supplierId, status: { in: ["FUNDED", "ACTIVE"] } },
      include: {
        entrepreneur: { select: { businessName: true } },
        duplicata: true,
      },
      orderBy: { fundedAt: "desc" },
      take: 8,
    }),
    db.order.findMany({
      where: { supplierId, status: { in: ["FUNDED", "ACTIVE", "REPAID"] } },
      orderBy: { fundedAt: "desc" },
      take: 50,
    }),
  ]);

  const totalReceived30d = recentlyFunded
    .filter((o) => o.fundedAt && o.fundedAt >= daysAgo(30))
    .reduce((acc, o) => acc + o.supplierReceiveCents, 0n);

  const totalReceivedAllTime = recentlyFunded.reduce(
    (acc, o) => acc + o.supplierReceiveCents,
    0n,
  );

  return {
    profile,
    productsCount,
    awaiting,
    active,
    totalReceived30d,
    totalReceivedAllTime,
  };
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}
