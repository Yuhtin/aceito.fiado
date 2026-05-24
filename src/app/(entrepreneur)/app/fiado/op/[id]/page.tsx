import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  ExternalLink,
  FileText,
  HandCoins,
  Lock,
  Store,
  TimerReset,
} from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatBRL,
  formatBps,
  formatCNPJ,
  formatDate,
  formatRelativeTime,
} from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function OperationDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireEntrepreneur();

  const order = await db.order.findFirst({
    where: { id, entrepreneurId: user.entrepreneurId },
    include: {
      supplier: true,
      items: { include: { product: true } },
      duplicata: true,
      receivables: {
        orderBy: { capturedAt: "desc" },
        include: {
          pixTransaction: {
            select: { payerName: true, valueCents: true, txid: true },
          },
        },
      },
    },
  });
  if (!order) notFound();

  const paidCents = order.receivables.reduce(
    (a, r) => a + r.amountCapturedCents,
    0n,
  );
  const remainingCents = order.customerPayCents - paidCents;
  const progressPct =
    order.customerPayCents > 0n
      ? Number((paidCents * 1000n) / order.customerPayCents) / 10
      : 0;

  const timeline = [
    {
      label: "Pedido enviado",
      at: order.requestedAt,
      done: true,
    },
    {
      label: "Fornecedor confirmou",
      at: order.confirmedAt,
      done: !!order.confirmedAt,
    },
    {
      label: "Fornecedor recebeu à vista",
      at: order.fundedAt,
      done: !!order.fundedAt,
    },
    {
      label: "Duplicata na trava B3",
      at: order.fundedAt,
      done: !!order.duplicata,
    },
    {
      label: "Quitada",
      at: order.repaidAt,
      done: !!order.repaidAt,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Cockpit
          </Link>
        }
        title={
          <span className="inline-flex items-center gap-3">
            Operação{" "}
            {order.duplicata?.numero ? (
              <span className="font-mono text-2xl font-medium text-muted-foreground">
                {order.duplicata.numero}
              </span>
            ) : (
              <span className="text-2xl text-muted-foreground">
                #{order.id.slice(0, 8)}
              </span>
            )}
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={
          <span>
            Fornecedor:{" "}
            <Link
              href={`/app/fiado/${order.supplier.id}`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {order.supplier.businessName}
            </Link>
            {" · "}
            {order.duplicata
              ? `Duplicata registrada em ${order.duplicata.registradoraCode}`
              : "Aguardando emissão da duplicata"}
          </span>
        }
      />

      <div className="grid gap-6 px-6 py-6 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Esquerda */}
        <div className="space-y-5">
          {/* Progresso */}
          <Card className="border-border/60 shadow-soft">
            <div className="grid gap-5 p-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Liquidado
                </p>
                <p className="mt-2 font-display text-3xl font-medium tabular-nums">
                  {formatBRL(paidCents)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  de {formatBRL(order.customerPayCents)}
                </p>
              </div>
              <div className="md:col-span-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Restante
                </p>
                <p className="mt-2 font-display text-3xl font-medium tabular-nums">
                  {formatBRL(remainingCents > 0n ? remainingCents : 0n)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {order.dueDate
                    ? `vence ${formatRelativeTime(order.dueDate)}`
                    : "—"}
                </p>
              </div>
              <div className="md:col-span-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Captura ativa
                </p>
                <p className="mt-2 font-display text-3xl font-medium tabular-nums">
                  {formatBps(order.captureRateBps)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  do seu Pix vai pra cá
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Progress value={progressPct} className="h-2" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{progressPct.toFixed(0)}% liquidado</span>
                {order.dueDate && (
                  <span>
                    Vencimento: {formatDate(order.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="border-border/60 shadow-soft">
            <div className="px-6 pt-6 pb-3">
              <h2 className="font-display text-lg font-medium">
                Linha do tempo
              </h2>
              <p className="text-xs text-muted-foreground">
                Onde a operação está agora
              </p>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <ol className="space-y-3">
                {timeline.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={
                        step.done
                          ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                          : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      }
                    >
                      {step.done ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <p
                        className={
                          step.done
                            ? "text-sm font-medium"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {step.label}
                      </p>
                      {step.at && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {formatDate(step.at, true)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          {/* Itens */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div>
                <h2 className="font-display text-lg font-medium">Itens</h2>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} produto
                  {order.items.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CircleDollarSign className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {item.quantity} {item.product.unit} ×{" "}
                      {formatBRL(item.unitPriceCents)}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-medium tabular-nums">
                    {formatBRL(item.totalCents)}
                  </p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5 px-6 py-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatBRL(order.subtotalCents)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Desconto fornecedor ({formatBps(order.supplierDiscountBps)})
                </span>
                <span className="font-mono tabular-nums">
                  −{formatBRL(order.subtotalCents - order.supplierReceiveCents)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  Custo do prazo ({order.termDays}d ·{" "}
                  {formatBps(order.customerInterestBps)})
                </span>
                <span className="font-mono tabular-nums">
                  +{formatBRL(order.customerPayCents - order.subtotalCents)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between pt-1 text-foreground">
                <span className="font-medium">Você paga até o vencimento</span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {formatBRL(order.customerPayCents)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Direita */}
        <div className="space-y-5">
          {/* Duplicata */}
          {order.duplicata ? (
            <Card className="overflow-hidden border-border/60 shadow-soft">
              <div className="border-b border-border bg-warm-gradient px-5 py-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                  <FileText className="size-3.5" />
                  Duplicata escritural
                </div>
                <p className="mt-1 font-mono text-lg font-semibold">
                  {order.duplicata.numero}
                </p>
              </div>
              <div className="space-y-2.5 px-5 py-4 text-xs">
                <KV
                  k="Sacado"
                  v={
                    <span>
                      <span className="font-medium">
                        {order.duplicata.sacadoNome}
                      </span>
                      <br />
                      <span className="font-mono text-muted-foreground">
                        {formatCNPJ(order.duplicata.sacadoCnpj)}
                      </span>
                    </span>
                  }
                />
                <KV
                  k="Sacador"
                  v={
                    <span>
                      <span className="font-medium">
                        {order.duplicata.sacadorNome}
                      </span>
                      <br />
                      <span className="font-mono text-muted-foreground">
                        {formatCNPJ(order.duplicata.sacadorCnpj)}
                      </span>
                    </span>
                  }
                />
                <KV k="Valor" v={formatBRL(order.duplicata.valorCents)} />
                <KV k="Vencimento" v={formatDate(order.duplicata.vencimento)} />
                <KV
                  k="Registradora"
                  v={`${order.duplicata.registradoraCode} · ${order.duplicata.registradoraTxid?.slice(0, 14) ?? "—"}`}
                />
                <KV
                  k="Status"
                  v={
                    <Badge variant="outline" className="text-[10px]">
                      {order.duplicata.status}
                    </Badge>
                  }
                />
              </div>
            </Card>
          ) : (
            <Card className="border-dashed border-border p-5 text-sm text-muted-foreground">
              <FileText className="mb-2 size-5 text-muted-foreground" />
              Duplicata será emitida assim que o fornecedor confirmar o pedido.
            </Card>
          )}

          {/* Capturas recentes */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="font-display text-base font-medium">
                  Capturas via Pix
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cada captura zera um pedaço do saldo
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5 text-[10px]">
                <Lock className="size-3" /> Trava B3
              </Badge>
            </div>
            <Separator />
            <div className="max-h-80 divide-y divide-border/60 overflow-y-auto">
              {order.receivables.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma captura ainda. Assim que entrar um Pix na sua conta, a
                  captura aparece aqui.
                </p>
              )}
              {order.receivables.map((r) => (
                <div key={r.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {r.pixTransaction.payerName}
                    </p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-success">
                      +{formatBRL(r.amountCapturedCents)}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <p className="font-mono">
                      txid {r.pixTransaction.txid.slice(0, 10)}…
                    </p>
                    <p>{formatRelativeTime(r.capturedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href="/app/trava">
              <Lock className="size-4" /> Ver trava de recebíveis ao vivo
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function KV({
  k,
  v,
}: {
  k: string;
  v: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right text-foreground">{v}</dd>
    </div>
  );
}
