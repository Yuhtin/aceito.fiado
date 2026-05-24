import { Banknote } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { AfCard, Eyebrow, Money } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function OperacoesPage() {
  const user = await requireSupplier();
  const operations = await db.order.findMany({
    where: {
      supplierId: user.supplierId,
      status: { in: ["ACTIVE", "FUNDED", "REPAID"] },
    },
    include: {
      entrepreneur: { select: { businessName: true } },
      duplicata: true,
    },
    orderBy: { fundedAt: "desc" },
  });

  const total30d = operations
    .filter((o) => o.fundedAt && o.fundedAt >= daysAgo(30))
    .reduce((acc, o) => acc + o.supplierReceiveCents, 0n);

  return (
    <>
      <PageHeader
        eyebrow="recebido"
        title="suas operações pagas"
        description="cada confirmação vira um Pix imediato pra sua chave. a cobrança fica com a AceitoFiado."
      />

      <div
        className="px-6 py-7 md:px-10 md:py-8"
        style={{ background: "var(--af-creme)" }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AfCard padding={24} radius={18} style={{ background: "var(--af-branco)" }}>
            <Eyebrow>recebido (30 dias)</Eyebrow>
            <div className="mt-3">
              <Money cents={total30d} size={36} weight={600} />
            </div>
            <p
              className="af-mono mt-2"
              style={{ fontSize: 11, color: "var(--af-mata)" }}
            >
              à vista, sem risco
            </p>
          </AfCard>

          <AfCard padding={24} radius={18} style={{ background: "var(--af-branco)" }}>
            <Eyebrow>total de operações</Eyebrow>
            <p
              className="af-mono mt-3"
              style={{
                fontSize: 38,
                lineHeight: 1,
                color: "var(--af-preto)",
              }}
            >
              {operations.length}
            </p>
            <p
              className="af-mono mt-2"
              style={{ fontSize: 11, color: "var(--af-cinza)" }}
            >
              com a AceitoFiado
            </p>
          </AfCard>
        </div>

        <AfCard
          padding={0}
          radius={20}
          className="mt-6 overflow-hidden"
          style={{ background: "var(--af-branco)" }}
        >
          <div
            className="divide-y"
            style={{ borderColor: "var(--af-borda)" }}
          >
            {operations.length === 0 && (
              <p
                className="px-7 py-10 text-center text-sm"
                style={{ color: "var(--af-cinza)" }}
              >
                sem operações pagas ainda.
              </p>
            )}
            {operations.map((o) => (
              <div
                key={o.id}
                className="grid items-center gap-3 px-7 py-4 md:grid-cols-[auto_2fr_1fr_auto]"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "oklch(from var(--af-mata) l c h / 0.1)",
                    color: "var(--af-mata)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Banknote className="size-4" />
                </div>
                <div>
                  <p
                    className="af-body"
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
                    {o.duplicata?.numero ?? "—"} · {o.termDays}d
                  </p>
                </div>
                <div>
                  <Money cents={o.supplierReceiveCents} size={14} />
                  <p
                    className="af-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--af-cinza)",
                      margin: "2px 0 0",
                    }}
                  >
                    {o.fundedAt ? formatDate(o.fundedAt) : "—"}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </AfCard>
      </div>
    </>
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
