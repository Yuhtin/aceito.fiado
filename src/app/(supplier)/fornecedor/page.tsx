import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  ChevronRight,
  Inbox,
  Package,
  Store,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireSupplier } from "@/lib/auth";
import { formatBRL, formatBps, formatRelativeTime } from "@/lib/format";
import { getSupplierOverview } from "@/lib/queries";

export default async function SupplierDashboard() {
  const user = await requireSupplier();
  const data = await getSupplierOverview(user.supplierId);

  return (
    <>
      <PageHeader
        eyebrow="Painel do fornecedor"
        title={data.profile.businessName}
        description={`${data.profile.addressNeighborhood}, ${data.profile.addressCity}/${data.profile.addressState} · ${data.productsCount} produtos no catálogo`}
        actions={
          <Button asChild size="lg">
            <Link href="/fornecedor/produtos">
              <Package className="size-4" /> Meus produtos
            </Link>
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-10 md:py-8">
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Recebido (30 dias)
            </p>
            <Banknote className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-3 font-display text-3xl font-medium tabular-nums">
            {formatBRL(data.totalReceived30d)}
          </p>
          <p className="mt-1 text-xs text-success">à vista no Pix</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Pedidos aguardando
            </p>
            <Inbox className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-3 font-display text-3xl font-medium tabular-nums">
            {data.awaiting.length}
          </p>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-1 -ml-2 gap-1"
          >
            <Link href="/fornecedor/pedidos">
              Ver fila <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Desconto padrão
            </p>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-3 font-display text-3xl font-medium tabular-nums">
            {formatBps(data.profile.defaultDiscountBps)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            cobrado da AceitoFiado pra liquidar à vista
          </p>
        </Card>
      </div>

      {/* PEDIDOS PENDENTES */}
      <div className="grid gap-6 px-6 pb-8 md:grid-cols-[1.6fr_1fr] md:px-10">
        <Card className="border-border/60 shadow-soft">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <div>
              <h2 className="font-display text-xl font-medium">
                Pedidos aguardando você
              </h2>
              <p className="text-sm text-muted-foreground">
                Confirme pra receber o Pix imediatamente
              </p>
            </div>
            {data.awaiting.length > 0 && (
              <Badge
                variant="outline"
                className="border-warning/40 bg-warning/15 text-warning-foreground"
              >
                {data.awaiting.length} pendente
                {data.awaiting.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <Separator />
          <div className="divide-y divide-border/60">
            {data.awaiting.length === 0 && (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nenhum pedido pendente. Quando uma empreendedora comprar fiado,
                ele aparece aqui.
              </p>
            )}
            {data.awaiting.map((o) => (
              <Link
                key={o.id}
                href={`/fornecedor/pedidos/${o.id}`}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground">
                  <Inbox className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {o.entrepreneur.businessName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.entrepreneur.addressCity}/{o.entrepreneur.addressState}{" "}
                    · {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                    {formatRelativeTime(o.requestedAt)}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                    {o.items
                      .map((i) => `${i.quantity}× ${i.product.name}`)
                      .join(" · ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatBRL(o.supplierReceiveCents)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    você recebe
                  </p>
                </div>
                <ChevronRight className="mt-1 size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Card>

        {/* OPERAÇÕES ATIVAS */}
        <Card className="border-border/60 shadow-soft">
          <div className="px-5 pt-5 pb-3">
            <h3 className="font-display text-lg font-medium">
              Duplicatas vivas
            </h3>
            <p className="text-xs text-muted-foreground">
              Você já recebeu, AceitoFiado está cobrando
            </p>
          </div>
          <Separator />
          <div className="divide-y divide-border/60">
            {data.active.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                Sem duplicatas vivas.
              </p>
            )}
            {data.active.map((o) => (
              <div key={o.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">
                    {o.entrepreneur.businessName}
                  </p>
                  <p className="font-mono text-xs">
                    {o.duplicata?.numero ?? "—"}
                  </p>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">
                    {formatBRL(o.supplierReceiveCents)}
                  </span>
                  <span>
                    pago{" "}
                    {o.fundedAt ? formatRelativeTime(o.fundedAt) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
