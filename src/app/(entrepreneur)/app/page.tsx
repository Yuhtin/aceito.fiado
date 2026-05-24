import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Banknote,
  ChevronRight,
  Lock,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

import { CaptureProgressChart } from "@/components/charts/capture-progress";
import { RevenueByChannelChart } from "@/components/charts/revenue-by-channel";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { formatBRL, formatDate, formatRelativeTime } from "@/lib/format";
import { getEntrepreneurOverview } from "@/lib/queries";
import { db } from "@/lib/db";

import { OrderStatusBadge } from "./_components/order-status-badge";

const CHANNEL_ICONS = {
  PIX: Smartphone,
  SHOPEE: ShoppingBag,
  MERCADO_LIVRE: ShoppingBag,
  INSTAGRAM: AtSign,
  FEIRA: Store,
  MAQUININHA: Banknote,
  OUTRO: Sparkles,
} as const;

export default async function CockpitPage() {
  const user = await requireEntrepreneur();
  const data = await getEntrepreneurOverview(user.entrepreneurId);
  const featuredSuppliers = await db.supplierProfile.findMany({
    orderBy: { businessName: "asc" },
    take: 3,
    include: { _count: { select: { products: true } } },
  });

  const usePercent =
    data.approvedLimit > 0n
      ? Number((data.inUseCents * 1000n) / data.approvedLimit) / 10
      : 0;

  const firstName = data.profile.businessName.split(" ")[0] ?? user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Cockpit"
        title={`Oi, ${user.name.split(" ")[0]} ✦`}
        description={`${data.profile.businessName} · ${data.profile.addressNeighborhood}, ${data.profile.addressCity}/${data.profile.addressState}`}
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link href="/app/score">
                <Sparkles className="size-4" /> Meu score
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/app/fiado">
                Comprar fiado <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 md:px-10 md:py-8 lg:grid-cols-[1.4fr_1fr]">
        {/* COLUNA 1 */}
        <div className="space-y-5">
          {/* LIMITE */}
          <Card className="overflow-hidden border-border/60 shadow-soft">
            <div className="grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Limite disponível
                </p>
                <p className="mt-2 font-display text-5xl font-medium tabular-nums leading-none">
                  {formatBRL(data.availableLimit)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  De um total de{" "}
                  <span className="font-mono text-foreground">
                    {formatBRL(data.approvedLimit)}
                  </span>{" "}
                  aprovados ·{" "}
                  <Link href="/app/score" className="underline-offset-2 hover:underline">
                    como calculamos
                  </Link>
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                  Score {data.score ? `${Math.round(data.score.score * 100)}%` : "—"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Calculado{" "}
                  {data.score
                    ? formatRelativeTime(data.score.calculatedAt)
                    : ""}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Em uso
                </p>
                <p className="mt-1 text-xl font-medium tabular-nums">
                  {formatBRL(data.inUseCents)}
                </p>
                <Progress value={usePercent} className="mt-2.5 h-1.5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Capturado este mês
                </p>
                <p className="mt-1 text-xl font-medium tabular-nums text-success">
                  {formatBRL(data.capturedThisMonth)}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  Direto do Pix, automático
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pix recebido (mês)
                </p>
                <p className="mt-1 text-xl font-medium tabular-nums">
                  {formatBRL(data.pixThisMonth)}
                </p>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  Soma de todos os canais
                </p>
              </div>
            </div>
          </Card>

          {/* FLUXO DE CAIXA */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-end justify-between gap-3 px-6 pt-6 pb-2">
              <div>
                <h2 className="font-display text-xl font-medium">
                  Fluxo dos seus canais
                </h2>
                <p className="text-sm text-muted-foreground">
                  Últimos 30 dias · soma diária por canal
                </p>
              </div>
              <div className="hidden flex-wrap items-center gap-3 md:flex">
                {data.channels.map((c, i) => {
                  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4"];
                  return (
                    <div key={c.id} className="flex items-center gap-1.5 text-xs">
                      <span className={`size-2 rounded-full ${colors[i % colors.length]}`} />
                      <span className="text-muted-foreground">{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-3 pb-4">
              <RevenueByChannelChart
                transactions={data.pixLast30d.map((tx) => ({
                  receivedAt: tx.receivedAt,
                  valueCents: tx.valueCents,
                  channelLabel: tx.channel?.label ?? "Direto",
                }))}
                days={30}
                height={260}
              />
            </div>
          </Card>

          {/* OPERAÇÕES ATIVAS */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div>
                <h2 className="font-display text-xl font-medium">
                  Operações em andamento
                </h2>
                <p className="text-sm text-muted-foreground">
                  Duplicatas vivas e pedidos em processamento
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/app/historico">
                  Histórico <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {data.activeOrders.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma operação ativa. Que tal abrir uma agora?
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/app/fiado">Comprar fiado</Link>
                  </Button>
                </div>
              )}
              {data.activeOrders.map((order) => {
                const paid = order.receivables.reduce(
                  (a, r) => a + r.amountCapturedCents,
                  0n,
                );
                const totalPay = order.customerPayCents;
                const pct = totalPay > 0n ? Number((paid * 1000n) / totalPay) / 10 : 0;
                const remaining = totalPay - paid;
                return (
                  <Link
                    key={order.id}
                    href={`/app/fiado/${order.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Store className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {order.supplier.businessName}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        {order.duplicata && (
                          <>
                            {" · "}
                            <span className="font-mono">{order.duplicata.numero}</span>
                          </>
                        )}
                        {order.dueDate && (
                          <>
                            {" · "}vence {formatRelativeTime(order.dueDate)}
                          </>
                        )}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={pct} className="h-1 flex-1" />
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatBRL(remaining)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        restante
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* COLUNA 2 */}
        <div className="space-y-5">
          {/* TRAVA */}
          <Card className="overflow-hidden border-border/60 bg-sidebar text-sidebar-foreground shadow-soft-lg">
            <div className="flex items-center gap-2 px-5 pt-5 pb-2 text-xs uppercase tracking-widest text-sidebar-foreground/60">
              <Lock className="size-3.5" />
              Trava de recebíveis
            </div>
            <div className="px-5 pb-5">
              <p className="font-display text-3xl font-medium tabular-nums">
                {formatBRL(data.capturedThisMonth)}
              </p>
              <p className="mt-1 text-xs text-sidebar-foreground/60">
                capturado este mês · últimos 14 dias abaixo
              </p>
              <div className="mt-3 rounded-xl bg-sidebar-accent/40 p-3">
                <CaptureProgressChart
                  captures={data.receivables90d.map((r) => ({
                    capturedAt: r.capturedAt,
                    amountCapturedCents: r.amountCapturedCents,
                  }))}
                />
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-3 w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
              >
                <Link href="/app/trava">
                  Ver trava ao vivo <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* CANAIS CONECTADOS */}
          <Card className="border-border/60 shadow-soft">
            <div className="px-5 pt-5 pb-3">
              <h3 className="font-display text-lg font-medium">
                Canais conectados
              </h3>
              <p className="text-xs text-muted-foreground">
                Quanto mais canais, mais sinal pro score
              </p>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {data.channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.type] ?? Sparkles;
                return (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {channel.label}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatBRL(channel.monthlyRevenueCents, { compact: true })}
                        /mês
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-success/30 bg-success/5 text-success text-[10px]"
                    >
                      conectado
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* SUGESTÃO: fornecedores */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="font-display text-lg font-medium">
                  Fornecedores na rede
                </h3>
                <p className="text-xs text-muted-foreground">
                  Curados na cadeia afro
                </p>
              </div>
              <TrendingUp className="size-4 text-muted-foreground" />
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {featuredSuppliers.map((s) => (
                <Link
                  key={s.id}
                  href={`/app/fiado?fornecedor=${s.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Store className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s._count.products} produtos · {s.addressNeighborhood}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
