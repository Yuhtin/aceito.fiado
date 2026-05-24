import Link from "next/link";
import { ArrowRight, Lock, Sparkles, TrendingUp } from "lucide-react";

import {
  AfButton,
  AfCard,
  BRLLive,
  Eyebrow,
  GradientMesh,
  Money,
  PulseDot,
  SoundBars,
} from "@/components/af";
import { CaptureProgressChart } from "@/components/charts/capture-progress";
import { PageHeader } from "@/components/shell/page-header";
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
        eyebrow="trava de recebíveis"
        title={
          <>
            seu Pix liquida sua dívida <span style={{ color: "var(--af-dourado)" }}>— no automático.</span>
          </>
        }
        description="Cada Pix recebido direciona uma fatia pra liquidar as duplicatas ativas. Registrado em B3, instrução irrevogável durante o prazo da operação."
        actions={<SimulatePixButton entrepreneurId={user.entrepreneurId} />}
      />

      <div
        className="grid gap-5 px-6 py-7 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]"
        style={{ background: "var(--af-creme-2)" }}
      >
        <div className="space-y-5">
          {/* OPERAÇÕES SOB TRAVA */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div style={{ padding: "24px 28px 14px" }}>
              <p className="af-eb">operações sob trava · {activeOrdersData.length}</p>
              <h2
                className="af-display"
                style={{
                  fontSize: 22,
                  margin: "8px 0 0",
                  color: "var(--af-preto)",
                }}
              >
                ordenadas por vencimento
              </h2>
              <p
                className="af-body"
                style={{
                  fontSize: 13,
                  color: "var(--af-cinza)",
                  margin: "6px 0 0",
                }}
              >
                o Pix vai sendo aplicado em cascata, mais antigo primeiro.
              </p>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              {activeOrdersData.length === 0 && (
                <p className="px-7 py-10 text-center text-sm" style={{ color: "var(--af-cinza)" }}>
                  nenhuma operação ativa. sem operação, não há captura.
                </p>
              )}
              <div className="divide-y" style={{ borderColor: "var(--af-borda)" }}>
                {activeOrdersData.map((o) => {
                  const paid = BigInt(o.paidCents);
                  const total = BigInt(o.customerPayCents);
                  const pct = total > 0n ? Number((paid * 1000n) / total) / 10 : 0;
                  const remaining = total - paid;
                  return (
                    <div key={o.id} className="px-7 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className="af-body"
                            style={{ fontSize: 14.5, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                          >
                            {o.supplierName}
                          </p>
                          <p
                            className="af-mono"
                            style={{
                              fontSize: 11,
                              color: "var(--af-cinza)",
                              margin: "3px 0 0",
                            }}
                          >
                            {o.duplicata ?? "—"}
                            {o.dueDate && (
                              <>
                                {" · vence "}
                                {formatRelativeTime(new Date(o.dueDate))}
                              </>
                            )}
                          </p>
                        </div>
                        <span
                          className="af-mono"
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            borderRadius: 99,
                            background: "var(--af-dourado-soft)",
                            color: "var(--af-dourado)",
                            fontWeight: 500,
                          }}
                        >
                          captura {formatBps(o.captureRateBps)}
                        </span>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            position: "relative",
                            height: 6,
                            overflow: "hidden",
                            borderRadius: 99,
                            background: "var(--af-borda)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: "0 auto 0 0",
                              borderRadius: 99,
                              width: `${pct}%`,
                              background:
                                "linear-gradient(to right, var(--af-dourado), oklch(0.7 0.17 45))",
                              transition: "width 1.2s ease",
                            }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between text-[11px]" style={{ color: "var(--af-cinza)" }}>
                          <span>
                            <span style={{ color: "var(--af-sucesso)", fontWeight: 600 }} className="font-mono">
                              {formatBRL(paid)}
                            </span>{" "}
                            capturado
                          </span>
                          <span>
                            <span className="font-mono">{formatBRL(remaining > 0n ? remaining : 0n)}</span>{" "}
                            restante de <span className="font-mono">{formatBRL(total)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/app/fiado/op/${o.id}`}
                          className="text-xs font-medium inline-flex items-center gap-1"
                          style={{ color: "var(--af-cinza)" }}
                        >
                          ver detalhes <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AfCard>

          {/* CAPTURAS AO VIVO */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div
              style={{
                padding: "20px 28px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <Eyebrow>capturas dos últimos dias</Eyebrow>
                <h2
                  className="af-display"
                  style={{
                    fontSize: 20,
                    margin: "8px 0 0",
                    color: "var(--af-preto)",
                  }}
                >
                  atualiza sozinho a cada Pix recebido
                </h2>
              </div>
              <span
                className="af-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]"
                style={{
                  background: "var(--af-sucesso)",
                  color: "var(--af-branco)",
                  opacity: 0.9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: "var(--af-branco)",
                    animation: "af-pulse 1.6s ease-in-out infinite",
                  }}
                />
                ao vivo
              </span>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              <TravaLiveStream
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
            </div>
          </AfCard>
        </div>

        {/* DIREITA */}
        <div className="space-y-5">
          {/* TOTAL CAPTURADO · DARK */}
          <GradientMesh
            dark
            style={{
              borderRadius: 20,
              padding: 24,
              color: "var(--af-creme)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Eyebrow color="oklch(0.972 0.008 75 / 0.55)">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3" /> trava · todo histórico
                </span>
              </Eyebrow>
              <SoundBars
                count={5}
                color="var(--af-dourado)"
                height={14}
                width={2}
              />
            </div>
            <div className="af-n" style={{ fontSize: 48, lineHeight: 0.95 }}>
              <span
                style={{
                  fontSize: 20,
                  opacity: 0.4,
                  marginRight: 4,
                  verticalAlign: "0.5em",
                }}
              >
                R$
              </span>
              <BRLLive
                initial={Number(totalCapturedAllTime) / 100}
                ratePerSec={0.27}
                jitter={0.6}
              />
            </div>
            <div
              className="af-mono"
              style={{
                fontSize: 12,
                color: "oklch(0.972 0.008 75 / 0.55)",
                marginTop: 6,
              }}
            >
              de {formatBRL(totalDueAllTime, { withSymbol: true })} totais
            </div>
            {/* split bar */}
            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  display: "flex",
                  height: 50,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "30%",
                    background: "var(--af-dourado)",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="af-mono"
                    style={{
                      fontSize: 9,
                      color: "oklch(0.972 0.008 75 / 0.7)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    30% trava
                  </span>
                  <span className="af-n" style={{ fontSize: 14 }}>
                    → fornecedor
                  </span>
                </div>
                <div
                  style={{
                    width: "70%",
                    background: "var(--af-sucesso)",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="af-mono"
                    style={{
                      fontSize: 9,
                      color: "oklch(0.972 0.008 75 / 0.7)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    70%
                  </span>
                  <span className="af-n" style={{ fontSize: 14 }}>
                    → você
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: "oklch(0.972 0.008 75 / 0.05)",
                borderRadius: 12,
                border: "1px solid oklch(0.972 0.008 75 / 0.08)",
              }}
            >
              <CaptureProgressChart
                captures={allReceivables90.map((r) => ({
                  capturedAt: r.capturedAt,
                  amountCapturedCents: r.amountCapturedCents,
                }))}
              />
            </div>
          </GradientMesh>

          {/* COMO FUNCIONA */}
          <AfCard padding={20} radius={18}>
            <div className="inline-flex items-center gap-1.5" style={{ color: "var(--af-dourado)" }}>
              <Sparkles className="size-3.5" />
              <Eyebrow color="var(--af-dourado)">como a trava funciona</Eyebrow>
            </div>
            <ol className="mt-4 space-y-3">
              {[
                "Quando o fornecedor é pago à vista, a duplicata é registrada em B3 com instrução de domicílio bancário.",
                "Cada Pix que entra na sua conta é interceptado: parte é redirecionada pra liquidar a duplicata mais próxima.",
                "Você não precisa abrir nenhum app: o saldo da operação cai sozinho.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="af-mono flex shrink-0 items-center justify-center font-semibold"
                    style={{
                      width: 22,
                      height: 22,
                      marginTop: 2,
                      borderRadius: 99,
                      background: "var(--af-dourado-soft)",
                      color: "var(--af-dourado)",
                      fontSize: 11,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="af-body"
                    style={{
                      fontSize: 13.5,
                      color: "var(--af-cinza)",
                      margin: 0,
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p
              className="af-mono mt-5 rounded-lg p-3"
              style={{
                fontSize: 10.5,
                background: "var(--af-borda)",
                color: "var(--af-cinza)",
                lineHeight: 1.5,
              }}
            >
              base regulatória · res. BC 4.734/2019 (registradoras) · Lei
              13.775/2018 (duplicata escritural)
            </p>
          </AfCard>
        </div>
      </div>
    </>
  );
}

function SimulatePixButton({ entrepreneurId }: { entrepreneurId: string }) {
  return (
    <form action="/api/sim/pix" method="POST">
      <input type="hidden" name="entrepreneurId" value={entrepreneurId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          background: "var(--af-dourado)",
          color: "var(--af-creme)",
          fontFamily: "var(--af-sans)",
        }}
      >
        <TrendingUp className="size-4" />
        simular Pix entrando
      </button>
    </form>
  );
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
