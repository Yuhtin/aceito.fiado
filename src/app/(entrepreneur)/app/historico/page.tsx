import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatDate, formatRelativeTime } from "@/lib/format";

export default async function HistoricoPage() {
  const user = await requireEntrepreneur();

  const orders = await db.order.findMany({
    where: { entrepreneurId: user.entrepreneurId },
    include: {
      supplier: { select: { businessName: true, addressNeighborhood: true } },
      duplicata: { select: { numero: true } },
      receivables: { select: { amountCapturedCents: true } },
      _count: { select: { items: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Histórico"
        title="Todas as suas operações"
        description="Pedidos enviados, duplicatas vivas, capturas e liquidações."
      />
      <div className="px-6 py-6 md:px-10 md:py-8">
        <Card className="border-border/60 shadow-soft">
          <div className="divide-y divide-border/60">
            {orders.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma operação ainda.
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
                  className="grid items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[auto_2fr_1fr_1fr_auto] md:gap-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Store className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {o.supplier.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.duplicata?.numero ?? "—"} · {o._count.items} item
                      {o._count.items === 1 ? "" : "s"} · {o.termDays}d
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {formatBRL(o.customerPayCents)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      você paga
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-sm tabular-nums text-success">
                      {formatBRL(paid)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      capturado
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <OrderStatusBadge status={o.status} />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {o.dueDate
                          ? `vence ${formatRelativeTime(o.dueDate)}`
                          : `criado ${formatRelativeTime(o.requestedAt)}`}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
