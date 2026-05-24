import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  Lock,
} from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { AfCard, Eyebrow, Money, Tag } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
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
    { label: "pedido enviado", at: order.requestedAt, done: true },
    {
      label: "fornecedor confirmou",
      at: order.confirmedAt,
      done: !!order.confirmedAt,
    },
    {
      label: "fornecedor recebeu à vista",
      at: order.fundedAt,
      done: !!order.fundedAt,
    },
    {
      label: "duplicata na trava B3",
      at: order.fundedAt,
      done: !!order.duplicata,
    },
    { label: "quitada", at: order.repaidAt, done: !!order.repaidAt },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            href="/app"
            className="inline-flex items-center gap-1 transition-opacity hover:opacity-100 opacity-70"
            style={{ color: "var(--af-ink-soft)" }}
          >
            <ArrowLeft className="size-3" /> cockpit
          </Link>
        }
        title={
          <span className="inline-flex items-center gap-3 flex-wrap">
            operação{" "}
            <span
              className="af-mono"
              style={{ fontSize: 20, color: "var(--af-ink-soft)" }}
            >
              {order.duplicata?.numero ?? `#${order.id.slice(0, 8)}`}
            </span>
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={
          <span>
            fornecedor:{" "}
            <Link
              href={`/app/fiado/${order.supplier.id}`}
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: "var(--af-terra)" }}
            >
              {order.supplier.businessName}
            </Link>
            {" · "}
            {order.duplicata
              ? `duplicata registrada em ${order.duplicata.registradoraCode}`
              : "aguardando emissão da duplicata"}
          </span>
        }
      />

      <div
        className="grid gap-6 px-6 py-7 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]"
        style={{ background: "var(--af-paper-2)" }}
      >
        <div className="space-y-5">
          {/* PROGRESSO */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div className="grid gap-5 p-7 md:grid-cols-3">
              <div>
                <Eyebrow>liquidado</Eyebrow>
                <div style={{ marginTop: 10 }}>
                  <Money cents={paidCents} size={32} weight={600} />
                </div>
                <p
                  className="af-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--af-ink-soft)",
                    margin: "5px 0 0",
                  }}
                >
                  de {formatBRL(order.customerPayCents)}
                </p>
              </div>
              <div>
                <Eyebrow>restante</Eyebrow>
                <div style={{ marginTop: 10 }}>
                  <Money
                    cents={remainingCents > 0n ? remainingCents : 0n}
                    size={32}
                    weight={600}
                  />
                </div>
                <p
                  className="af-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--af-ink-soft)",
                    margin: "5px 0 0",
                  }}
                >
                  {order.dueDate
                    ? `vence ${formatRelativeTime(order.dueDate)}`
                    : "—"}
                </p>
              </div>
              <div>
                <Eyebrow>captura ativa</Eyebrow>
                <p
                  className="af-n"
                  style={{
                    fontSize: 32,
                    margin: "10px 0 0",
                    color: "var(--af-terra)",
                    fontWeight: 600,
                  }}
                >
                  {formatBps(order.captureRateBps)}
                </p>
                <p
                  className="af-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--af-ink-soft)",
                    margin: "5px 0 0",
                  }}
                >
                  do seu Pix vai pra cá
                </p>
              </div>
            </div>
            <div className="px-7 pb-7">
              <div
                style={{
                  height: 8,
                  background: "var(--af-paper-3)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: "100%",
                    background:
                      "linear-gradient(to right, var(--af-terra), var(--af-mata-2))",
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
              <div className="mt-3 flex justify-between">
                <span
                  className="af-mono"
                  style={{ fontSize: 11.5, color: "var(--af-ink-soft)" }}
                >
                  <span style={{ color: "var(--af-mata)", fontWeight: 600 }}>
                    {progressPct.toFixed(0)}%
                  </span>{" "}
                  liquidado
                </span>
                {order.dueDate && (
                  <span
                    className="af-mono"
                    style={{ fontSize: 11.5, color: "var(--af-ink-soft)" }}
                  >
                    vencimento: {formatDate(order.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </AfCard>

          {/* TIMELINE */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div className="px-7 pt-6 pb-3">
              <Eyebrow>linha do tempo</Eyebrow>
              <h2
                className="af-h"
                style={{
                  fontSize: 18,
                  margin: "6px 0 0",
                  color: "var(--af-ink-deep)",
                }}
              >
                onde a operação está agora
              </h2>
            </div>
            <div
              style={{ borderTop: "1px solid var(--af-ink-08)" }}
              className="px-7 py-5"
            >
              <ol className="space-y-3.5">
                {timeline.map((step, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <div
                      className="grid size-6 shrink-0 place-items-center rounded-full mt-0.5"
                      style={{
                        background: step.done
                          ? "oklch(0.420 0.085 155 / 0.15)"
                          : "var(--af-paper-3)",
                        color: step.done
                          ? "var(--af-mata)"
                          : "var(--af-ink-soft)",
                      }}
                    >
                      {step.done ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Clock className="size-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className="af-body"
                        style={{
                          fontSize: 13.5,
                          fontWeight: step.done ? 500 : 400,
                          color: step.done
                            ? "var(--af-ink)"
                            : "var(--af-ink-soft)",
                          margin: 0,
                        }}
                      >
                        {step.label}
                      </p>
                      {step.at && (
                        <p
                          className="af-mono"
                          style={{
                            fontSize: 10.5,
                            color: "var(--af-ink-soft)",
                            margin: "2px 0 0",
                          }}
                        >
                          {formatDate(step.at, true)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </AfCard>

          {/* ITENS */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div className="px-7 pt-6 pb-3">
              <Eyebrow>
                itens · {order.items.length} produto
                {order.items.length === 1 ? "" : "s"}
              </Eyebrow>
            </div>
            <div style={{ borderTop: "1px solid var(--af-ink-08)" }}>
              <div
                className="divide-y"
                style={{ borderColor: "var(--af-ink-08)" }}
              >
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-7 py-3.5"
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        background: "var(--af-paper-3)",
                        color: "var(--af-ink-soft)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircleDollarSign className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="af-body truncate"
                        style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--af-ink-soft)",
                          margin: "2px 0 0",
                        }}
                      >
                        {item.quantity} {item.product.unit} ×{" "}
                        {formatBRL(item.unitPriceCents)}
                      </p>
                    </div>
                    <Money cents={item.totalCents} size={14} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--af-ink-08)" }} />
            <div className="space-y-2 px-7 py-5 text-sm">
              <Row label="subtotal" value={formatBRL(order.subtotalCents)} />
              <Row
                label={`desconto fornecedor (${formatBps(order.supplierDiscountBps)})`}
                value={`−${formatBRL(order.subtotalCents - order.supplierReceiveCents)}`}
                muted
              />
              <Row
                label={`custo do prazo (${order.termDays}d · ${formatBps(order.customerInterestBps)})`}
                value={`+${formatBRL(order.customerPayCents - order.subtotalCents)}`}
                muted
              />
              <div style={{ borderTop: "1px solid var(--af-ink-08)" }} />
              <Row
                label="você paga até o vencimento"
                value={formatBRL(order.customerPayCents)}
                strong
              />
            </div>
          </AfCard>
        </div>

        {/* DIREITA */}
        <div className="space-y-5">
          {/* DUPLICATA */}
          {order.duplicata ? (
            <AfCard padding={0} radius={20} className="overflow-hidden">
              <div
                className="px-6 py-4"
                style={{
                  background: "var(--af-paper-2)",
                  borderBottom: "1px solid var(--af-ink-08)",
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5"
                  style={{ color: "var(--af-terra)" }}
                >
                  <FileText className="size-3.5" />
                  <Eyebrow color="var(--af-terra)">
                    duplicata escritural
                  </Eyebrow>
                </div>
                <p
                  className="af-n"
                  style={{
                    fontSize: 22,
                    margin: "6px 0 0",
                    color: "var(--af-ink-deep)",
                  }}
                >
                  {order.duplicata.numero}
                </p>
              </div>
              <div className="px-6 py-5 space-y-3 text-xs">
                <KV
                  k="sacado"
                  v={
                    <span>
                      <span style={{ fontWeight: 500 }}>
                        {order.duplicata.sacadoNome}
                      </span>
                      <br />
                      <span
                        className="af-mono"
                        style={{ color: "var(--af-ink-soft)" }}
                      >
                        {formatCNPJ(order.duplicata.sacadoCnpj)}
                      </span>
                    </span>
                  }
                />
                <KV
                  k="sacador"
                  v={
                    <span>
                      <span style={{ fontWeight: 500 }}>
                        {order.duplicata.sacadorNome}
                      </span>
                      <br />
                      <span
                        className="af-mono"
                        style={{ color: "var(--af-ink-soft)" }}
                      >
                        {formatCNPJ(order.duplicata.sacadorCnpj)}
                      </span>
                    </span>
                  }
                />
                <KV
                  k="valor"
                  v={formatBRL(order.duplicata.valorCents)}
                />
                <KV
                  k="vencimento"
                  v={formatDate(order.duplicata.vencimento)}
                />
                <KV
                  k="registradora"
                  v={`${order.duplicata.registradoraCode} · ${order.duplicata.registradoraTxid?.slice(0, 14) ?? "—"}`}
                />
                <KV
                  k="status"
                  v={<Tag color="var(--af-ink)">{order.duplicata.status}</Tag>}
                />
              </div>
            </AfCard>
          ) : (
            <AfCard
              padding={22}
              radius={20}
              style={{ border: "1px dashed var(--af-ink-12)" }}
            >
              <FileText
                className="mb-2 size-5"
                style={{ color: "var(--af-ink-soft)" }}
              />
              <p
                className="af-body"
                style={{ fontSize: 13.5, color: "var(--af-ink-soft)" }}
              >
                duplicata será emitida assim que o fornecedor confirmar o
                pedido.
              </p>
            </AfCard>
          )}

          {/* CAPTURAS RECENTES */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <div>
                <Eyebrow>capturas via Pix</Eyebrow>
                <h3
                  className="af-h"
                  style={{
                    fontSize: 16,
                    margin: "4px 0 0",
                    color: "var(--af-ink-deep)",
                  }}
                >
                  cada captura zera um pedaço
                </h3>
              </div>
              <Tag color="var(--af-terra)">
                <Lock className="inline size-3" /> trava B3
              </Tag>
            </div>
            <div style={{ borderTop: "1px solid var(--af-ink-08)" }}>
              <div
                className="max-h-80 overflow-y-auto divide-y"
                style={{ borderColor: "var(--af-ink-08)" }}
              >
                {order.receivables.length === 0 && (
                  <p
                    className="px-6 py-6 text-center text-sm"
                    style={{ color: "var(--af-ink-soft)" }}
                  >
                    nenhuma captura ainda. assim que entrar um Pix, aparece
                    aqui.
                  </p>
                )}
                {order.receivables.map((r) => (
                  <div key={r.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <p
                        className="af-body"
                        style={{ fontSize: 13, fontWeight: 500, margin: 0 }}
                      >
                        {r.pixTransaction.payerName}
                      </p>
                      <Money
                        cents={r.amountCapturedCents}
                        size={13}
                        weight={600}
                        color="var(--af-mata)"
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--af-ink-soft)",
                          margin: 0,
                        }}
                      >
                        txid {r.pixTransaction.txid.slice(0, 10)}…
                      </p>
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--af-ink-soft)",
                          margin: 0,
                        }}
                      >
                        {formatRelativeTime(r.capturedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AfCard>

          <Link
            href="/app/trava"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors"
            style={{
              border: "1px solid var(--af-ink-20)",
              color: "var(--af-ink)",
              fontFamily: "var(--af-sans)",
            }}
          >
            <Lock className="size-4" />
            ver trava de recebíveis ao vivo
          </Link>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span
        style={{
          color: strong
            ? "var(--af-ink-deep)"
            : muted
              ? "var(--af-ink-soft)"
              : "var(--af-ink-2)",
          fontWeight: strong ? 500 : 400,
        }}
      >
        {label}
      </span>
      <span
        className={strong ? "af-n" : "af-mono"}
        style={{
          color: strong ? "var(--af-ink-deep)" : "var(--af-ink-2)",
          fontSize: strong ? 18 : 13,
          fontWeight: strong ? 600 : 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-3">
      <dt style={{ color: "var(--af-ink-soft)" }}>{k}</dt>
      <dd style={{ color: "var(--af-ink)", textAlign: "right" }}>{v}</dd>
    </div>
  );
}
