import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { AfCard, Money } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format";

export default async function HistoricoPage() {
  const user = await requireEntrepreneur();

  const orders = await db.order.findMany({
    where: { entrepreneurId: user.entrepreneurId },
    include: {
      supplier: { select: { businessName: true } },
      duplicata: { select: { numero: true } },
      receivables: { select: { amountCapturedCents: true } },
      _count: { select: { items: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="histórico"
        title="todas as suas operações"
        description="pedidos enviados, duplicatas vivas, capturas e liquidações."
      />
      <div
        className="px-6 py-7 md:px-10 md:py-8"
        style={{ background: "var(--af-paper-2)" }}
      >
        <AfCard padding={0} radius={20} className="overflow-hidden">
          <div
            className="divide-y"
            style={{ borderColor: "var(--af-ink-08)" }}
          >
            {orders.length === 0 && (
              <p
                className="px-7 py-10 text-center text-sm"
                style={{ color: "var(--af-ink-soft)" }}
              >
                nenhuma operação ainda.
              </p>
            )}
            {orders.map((o) => {
              const paid = o.receivables.reduce(
                (a, r) => a + r.amountCapturedCents,
                0n,
              );
              return (
                <Link
                  key={o.id}
                  href={`/app/fiado/op/${o.id}`}
                  className="grid items-center gap-4 px-7 py-4 transition-colors hover:bg-[oklch(0.985_0.005_75_/_0.5)] md:grid-cols-[auto_2fr_1fr_1fr_auto]"
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--af-ink)",
                      color: "var(--af-paper)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--af-sans)",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {o.supplier.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="af-body truncate"
                      style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                    >
                      {o.supplier.businessName}
                    </p>
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 11,
                        color: "var(--af-ink-soft)",
                        margin: "3px 0 0",
                      }}
                    >
                      {o.duplicata?.numero ?? "—"} · {o._count.items} item
                      {o._count.items === 1 ? "" : "s"} · {o.termDays}d
                    </p>
                  </div>
                  <div>
                    <Money cents={o.customerPayCents} size={14} />
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--af-ink-soft)",
                        margin: "2px 0 0",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      você paga
                    </p>
                  </div>
                  <div>
                    <Money cents={paid} size={14} color="var(--af-mata)" />
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--af-ink-soft)",
                        margin: "2px 0 0",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      capturado
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <OrderStatusBadge status={o.status} />
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10,
                          color: "var(--af-ink-soft)",
                          margin: "3px 0 0",
                        }}
                      >
                        {o.dueDate
                          ? `vence ${formatRelativeTime(o.dueDate)}`
                          : `criado ${formatRelativeTime(o.requestedAt)}`}
                      </p>
                    </div>
                    <ChevronRight
                      className="size-4"
                      style={{ color: "var(--af-ink-soft)" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </AfCard>
      </div>
    </>
  );
}
