import Link from "next/link";
import { ArrowRight, Lock, Sparkles, TrendingUp } from "lucide-react";

import { CaptureProgressChart } from "@/components/charts/capture-progress";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatBps, formatRelativeTime } from "@/lib/format";

import { TravaLiveStream } from "./trava-live-stream";

export default async function TravaPage() {
  const user = await requireEntrepreneur();

  const [activeOrders, recentReceivables, recentPix] = await Promise.all([
    db.order.findMany({
      where: {
        entrepreneurId: user.entrepreneurId,
        status: { in: ["ACTIVE", "FUNDED"] },
      },
      include: {
        supplier: { select: { businessName: true } },
        duplicata: { select: { numero: true } },
        receivables: { select: { amountCapturedCents: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.receivable.findMany({
      where: { order: { entrepreneurId: user.entrepreneurId } },
      orderBy: { capturedAt: "desc" },
      take: 14,
      include: {
        order: {
          select: {
            duplicata: { select: { numero: true } },
            supplier: { select: { businessName: true } },
          },
        },
        pixTransaction: {
          select: { payerName: true, valueCents: true, txid: true },
        },
      },
    }),
    db.pixTransaction.findMany({
      where: { entrepreneurId: user.entrepreneurId },
      orderBy: { receivedAt: "desc" },
      take: 14,
      include: { channel: { select: { label: true } } },
    }),
  ]);

  const totalCapturedAllTime = activeOrders.reduce((acc, o) => {
    return acc + o.receivables.reduce((a, r) => a + r.amountCapturedCents, 0n);
  }, 0n);
  const totalDueAllTime = activeOrders.reduce(
    (acc, o) => acc + o.customerPayCents,
    0n,
  );

  // Para o gráfico: pega últimas capturas (qualquer pedido)
  const allReceivables90 = await db.receivable.findMany({
    where: {
      order: { entrepreneurId: user.entrepreneurId },
      capturedAt: { gte: daysAgo(30) },
    },
    select: { capturedAt: true, amountCapturedCents: true },
  });

  const activeOrdersData = activeOrders.map((o) => {
    const paid = o.receivables.reduce(
      (a, r) => a + r.amountCapturedCents,
      0n,
    );
    return {
      id: o.id,
      duplicata: o.duplicata?.numero ?? null,
      supplierName: o.supplier.businessName,
      customerPayCents: o.customerPayCents.toString(),
      paidCents: paid.toString(),
      captureRateBps: o.captureRateBps,
      dueDate: o.dueDate?.toISOString() ?? null,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Trava de recebíveis"
        title="Seu Pix liquida sua dívida — no automático"
        description={
          <span>
            Cada Pix recebido direciona uma fatia pra liquidar as duplicatas
            ativas. Registrado em B3, instrução irrevogável durante o prazo da
            operação.
          </span>
        }
        actions={
          <SimulatePixButton entrepreneurId={user.entrepreneurId} />
        }
      />

      <div className="grid gap-5 px-6 py-6 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* OPERAÇÕES ATIVAS COM PROGRESSO */}
          <Card className="border-border/60 shadow-soft">
            <div className="px-6 pt-6 pb-3">
              <h2 className="font-display text-xl font-medium">
                Operações sob trava
              </h2>
              <p className="text-sm text-muted-foreground">
                Ordenadas por proximidade de vencimento. O Pix vai sendo
                aplicado em cascata.
              </p>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {activeOrdersData.map((o) => {
                const paid = BigInt(o.paidCents);
                const total = BigInt(o.customerPayCents);
                const pct = total > 0n ? Number((paid * 1000n) / total) / 10 : 0;
                const remaining = total - paid;
                return (
                  <div key={o.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{o.supplierName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {o.duplicata ?? "—"}
                          {o.dueDate && (
                            <>
                              {" · vence "}
                              {formatRelativeTime(new Date(o.dueDate))}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-primary text-[10px]"
                      >
                        Captura {formatBps(o.captureRateBps)}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.17_45)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>
                          <span className="font-mono text-success">
                            {formatBRL(paid)}
                          </span>{" "}
                          capturado
                        </span>
                        <span>
                          <span className="font-mono">
                            {formatBRL(remaining > 0n ? remaining : 0n)}
                          </span>{" "}
                          restante de{" "}
                          <span className="font-mono">{formatBRL(total)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <Button asChild variant="ghost" size="sm" className="gap-1">
                        <Link href={`/app/fiado/op/${o.id}`}>
                          Ver detalhes <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {activeOrdersData.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma operação ativa. Sem operação, não há captura.
                </div>
              )}
            </div>
          </Card>

          {/* CAPTURAS AO VIVO */}
          <Card className="border-border/60 shadow-soft">
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div>
                <h2 className="font-display text-xl font-medium">
                  Capturas dos últimos dias
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atualiza sozinho a cada Pix recebido
                </p>
              </div>
              <Badge
                variant="outline"
                className="gap-1.5 border-success/30 bg-success/10 text-success"
              >
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                Ao vivo
              </Badge>
            </div>
            <Separator />
            <TravaLiveStream
              entrepreneurId={user.entrepreneurId}
              initialReceivables={recentReceivables.map((r) => ({
                id: r.id,
                amountCapturedCents: r.amountCapturedCents.toString(),
                capturedAt: r.capturedAt.toISOString(),
                payerName: r.pixTransaction.payerName,
                pixValueCents: r.pixTransaction.valueCents.toString(),
                txid: r.pixTransaction.txid,
                supplierName: r.order.supplier.businessName,
                duplicata: r.order.duplicata?.numero ?? null,
              }))}
              initialPix={recentPix.map((p) => ({
                id: p.id,
                payerName: p.payerName,
                valueCents: p.valueCents.toString(),
                channelLabel: p.channel?.label ?? "Direto",
                receivedAt: p.receivedAt.toISOString(),
                captured: p.captured,
                capturedAmountCents: p.capturedAmountCents.toString(),
              }))}
            />
          </Card>
        </div>

        <div className="space-y-5">
          {/* RESUMO DA TRAVA */}
          <Card className="overflow-hidden border-border/60 bg-sidebar text-sidebar-foreground shadow-soft-lg">
            <div className="flex items-center gap-2 px-5 pt-5 pb-2 text-xs uppercase tracking-widest text-sidebar-foreground/60">
              <Lock className="size-3.5" />
              Captura sob trava (todo histórico)
            </div>
            <div className="px-5 pb-5">
              <p className="font-display text-3xl font-medium tabular-nums">
                {formatBRL(totalCapturedAllTime)}
              </p>
              <p className="mt-0.5 text-xs text-sidebar-foreground/60">
                de {formatBRL(totalDueAllTime)} totais
              </p>
              <div className="mt-3 rounded-xl bg-sidebar-accent/40 p-3">
                <CaptureProgressChart
                  captures={allReceivables90.map((r) => ({
                    capturedAt: r.capturedAt,
                    amountCapturedCents: r.amountCapturedCents,
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* COMO FUNCIONA */}
          <Card className="border-border/60 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" /> Como a trava funciona
            </div>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  1
                </span>
                <span className="text-muted-foreground">
                  Quando o fornecedor é pago à vista, a duplicata é registrada
                  em B3 com instrução de domicílio bancário.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  2
                </span>
                <span className="text-muted-foreground">
                  Cada Pix que entra na sua conta é interceptado: parte é
                  redirecionada pra liquidar a duplicata ativa mais próxima.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  3
                </span>
                <span className="text-muted-foreground">
                  Você não precisa abrir nenhum app: o saldo da operação cai
                  sozinho.
                </span>
              </li>
            </ol>
            <p className="mt-4 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
              <strong className="text-foreground">Base regulatória:</strong> Res.
              BC 4.734/2019 (registradoras de recebíveis), Lei 13.775/2018
              (duplicata escritural).
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function SimulatePixButton({ entrepreneurId }: { entrepreneurId: string }) {
  return (
    <form action={`/api/sim/pix`} method="POST">
      <input type="hidden" name="entrepreneurId" value={entrepreneurId} />
      <Button type="submit" className="gap-2">
        <TrendingUp className="size-4" />
        Simular Pix entrando
      </Button>
    </form>
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
