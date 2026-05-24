import { Banknote } from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatDate } from "@/lib/format";

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
        eyebrow="Recebido"
        title="Suas operações pagas"
        description="Cada confirmação vira um Pix imediato pra sua chave. A cobrança fica com a AceitoFiado."
      />

      <div className="grid gap-4 px-6 py-6 md:grid-cols-2 md:px-10 md:py-8">
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Recebido (30 dias)
          </p>
          <p className="mt-2 font-display text-3xl font-medium tabular-nums">
            {formatBRL(total30d)}
          </p>
          <p className="mt-1 text-xs text-success">à vista, sem risco</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Total de operações
          </p>
          <p className="mt-2 font-display text-3xl font-medium tabular-nums">
            {operations.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">com a AceitoFiado</p>
        </Card>
      </div>

      <div className="px-6 pb-8 md:px-10">
        <Card className="border-border/60 shadow-soft">
          <div className="divide-y divide-border/60">
            {operations.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Sem operações pagas ainda.
              </p>
            )}
            {operations.map((o) => (
              <div
                key={o.id}
                className="grid items-center gap-3 px-6 py-4 md:grid-cols-[auto_2fr_1fr_auto]"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                  <Banknote className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {o.entrepreneur.businessName}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {o.duplicata?.numero ?? "—"} · {o.termDays}d
                  </p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatBRL(o.supplierReceiveCents)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {o.fundedAt ? formatDate(o.fundedAt) : "—"}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
