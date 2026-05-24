import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatRelativeTime } from "@/lib/format";

export default async function FornecedorPedidos() {
  const user = await requireSupplier();
  const orders = await db.order.findMany({
    where: { supplierId: user.supplierId },
    include: {
      entrepreneur: { select: { businessName: true, addressCity: true } },
      duplicata: { select: { numero: true } },
      _count: { select: { items: true } },
    },
    orderBy: [
      { status: "asc" },
      { requestedAt: "desc" },
    ],
  });

  return (
    <>
      <PageHeader
        eyebrow="Pedidos"
        title="Todos os pedidos recebidos"
        description="Confirme rápido pra receber à vista. AceitoFiado cobra a empreendedora."
      />
      <div className="px-6 py-6 md:px-10 md:py-8">
        <Card className="border-border/60 shadow-soft">
          <div className="divide-y divide-border/60">
            {orders.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhum pedido recebido ainda.
              </p>
            )}
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/fornecedor/pedidos/${o.id}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {o.entrepreneur.businessName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.duplicata?.numero ?? "—"} · {o._count.items} item
                    {o._count.items === 1 ? "" : "s"} · {o.termDays}d ·{" "}
                    {formatRelativeTime(o.requestedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatBRL(o.supplierReceiveCents)}
                  </p>
                  <OrderStatusBadge status={o.status} className="mt-1" />
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
