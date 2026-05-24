import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { AfCard, Eyebrow, Money } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format";

export default async function FornecedorPedidos() {
  const user = await requireSupplier();
  const orders = await db.order.findMany({
    where: { supplierId: user.supplierId },
    include: {
      entrepreneur: { select: { businessName: true, addressCity: true } },
      duplicata: { select: { numero: true } },
      _count: { select: { items: true } },
    },
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        eyebrow="pedidos"
        title="todos os pedidos recebidos"
        description="confirme rápido pra receber à vista. AceitoFiado cobra a empreendedora."
      />
      <div
        className="px-6 py-7 md:px-10 md:py-8"
        style={{ background: "var(--af-creme)" }}
      >
        <AfCard padding={0} radius={20} className="overflow-hidden" style={{ background: "var(--af-branco)" }}>
          {orders.length === 0 && (
            <p
              className="px-7 py-12 text-center text-sm"
              style={{ color: "var(--af-cinza)" }}
            >
              nenhum pedido recebido ainda.
            </p>
          )}
          <div
            className="divide-y"
            style={{ borderColor: "var(--af-borda)" }}
          >
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/fornecedor/pedidos/${o.id}`}
                className="flex items-center gap-4 px-7 py-4 transition-colors hover:bg-[var(--af-creme)]"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "var(--af-preto)",
                    color: "var(--af-branco)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--af-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {o.entrepreneur.businessName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="af-body truncate"
                    style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                  >
                    {o.entrepreneur.businessName}
                  </p>
                  <p
                    className="af-mono"
                    style={{
                      fontSize: 11,
                      color: "var(--af-cinza)",
                      margin: "3px 0 0",
                    }}
                  >
                    {o.duplicata?.numero ?? "—"} · {o._count.items} item
                    {o._count.items === 1 ? "" : "s"} · {o.termDays}d ·{" "}
                    {formatRelativeTime(o.requestedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <Money cents={o.supplierReceiveCents} size={14} />
                  <div className="mt-1.5">
                    <OrderStatusBadge status={o.status} />
                  </div>
                </div>
                <ChevronRight
                  className="size-4"
                  style={{ color: "var(--af-cinza-soft)" }}
                />
              </Link>
            ))}
          </div>
        </AfCard>
      </div>
    </>
  );
}
