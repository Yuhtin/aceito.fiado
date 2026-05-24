import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  HandCoins,
  MapPin,
  Package,
} from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import {
  AfCard,
  Eyebrow,
  Money,
  Tag,
} from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatBRL,
  formatBps,
  formatCNPJ,
  formatDate,
  formatRelativeTime,
} from "@/lib/format";

import { ConfirmOrderButton } from "./confirm-button";

type Props = { params: Promise<{ id: string }> };

export default async function SupplierOrderDetail({ params }: Props) {
  const { id } = await params;
  const user = await requireSupplier();
  const order = await db.order.findFirst({
    where: { id, supplierId: user.supplierId },
    include: {
      entrepreneur: true,
      items: { include: { product: true } },
      duplicata: true,
    },
  });
  if (!order) notFound();

  const isAwaiting = order.status === "AWAITING_SUPPLIER";

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            href="/fornecedor/pedidos"
            className="inline-flex items-center gap-1 transition-opacity hover:opacity-100 opacity-70"
            style={{ color: "var(--af-cinza)" }}
          >
            <ArrowLeft className="size-3" /> pedidos
          </Link>
        }
        title={
          <span className="inline-flex items-center gap-3 flex-wrap">
            {order.entrepreneur.businessName}
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            <Tag color="var(--af-preto)">
              {order.duplicata?.numero ?? `pedido #${order.id.slice(0, 8)}`}
            </Tag>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: "var(--af-cinza)" }}
            >
              <MapPin className="size-3.5" />
              {order.entrepreneur.addressCity}/{order.entrepreneur.addressState}
            </span>
            <span
              className="af-mono"
              style={{ fontSize: 11.5, color: "var(--af-cinza)" }}
            >
              CNPJ {formatCNPJ(order.entrepreneur.cnpj)}
            </span>
          </span>
        }
      />

      <div
        className="grid gap-6 px-6 py-7 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]"
        style={{ background: "var(--af-creme)" }}
      >
        <div className="space-y-5">
          {/* AÇÃO */}
          {isAwaiting && (
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 20,
                border: "1px solid var(--af-dourado)",
                background: "var(--af-dourado-soft)",
              }}
            >
              <div className="grid gap-4 p-7 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <Eyebrow color="var(--af-dourado-dark)">
                    aguarda sua confirmação
                  </Eyebrow>
                  <h2
                    className="af-display mt-3"
                    style={{
                      fontSize: 28,
                      color: "var(--af-preto)",
                    }}
                  >
                    confirme e receba{" "}
                    <span style={{ color: "var(--af-dourado-dark)" }}>
                      {formatBRL(order.supplierReceiveCents)}
                    </span>{" "}
                    à vista
                  </h2>
                  <p
                    className="af-body mt-3"
                    style={{
                      fontSize: 13.5,
                      color: "var(--af-cinza)",
                      maxWidth: 540,
                    }}
                  >
                    AceitoFiado faz o Pix pra sua chave em até alguns minutos.
                    após confirmar, a duplicata é emitida em nome da
                    empreendedora.
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <ConfirmOrderButton orderId={order.id} />
                </div>
              </div>
            </div>
          )}

          {/* ITENS */}
          <AfCard padding={0} radius={20} className="overflow-hidden" style={{ background: "var(--af-branco)" }}>
            <div className="px-7 pt-6 pb-3">
              <Eyebrow>pedido · {order.items.length} item{order.items.length === 1 ? "" : "s"}</Eyebrow>
              <h2
                className="af-display mt-2"
                style={{
                  fontSize: 18,
                  color: "var(--af-preto)",
                }}
              >
                solicitado {formatRelativeTime(order.requestedAt)}
              </h2>
              <p
                className="af-mono mt-1"
                style={{
                  fontSize: 11,
                  color: "var(--af-cinza)",
                }}
              >
                {formatDate(order.requestedAt, true)}
              </p>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              <div
                className="divide-y"
                style={{ borderColor: "var(--af-borda)" }}
              >
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-7 py-3.5"
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "var(--af-creme-2)",
                        color: "var(--af-cinza)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Package className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="af-body truncate"
                        style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--af-cinza)",
                          margin: "2px 0 0",
                        }}
                      >
                        SKU {item.product.sku} · {item.quantity}{" "}
                        {item.product.unit} ×{" "}
                        {formatBRL(item.unitPriceCents)}
                      </p>
                    </div>
                    <Money cents={item.totalCents} size={14} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }} />
            <div className="space-y-2 px-7 py-4 text-sm">
              <Row label="subtotal" value={formatBRL(order.subtotalCents)} />
              <Row
                label={`desconto AceitoFiado (${formatBps(order.supplierDiscountBps)})`}
                value={`−${formatBRL(order.subtotalCents - order.supplierReceiveCents)}`}
                muted
              />
              <div style={{ borderTop: "1px solid var(--af-borda)" }} />
              <Row
                label="você recebe à vista"
                value={formatBRL(order.supplierReceiveCents)}
                strong
              />
            </div>
          </AfCard>
        </div>

        <div className="space-y-5">
          {/* HOW IT WORKS */}
          <AfCard padding={22} radius={18} style={{ background: "var(--af-branco)" }}>
            <div
              className="inline-flex items-center gap-1.5"
              style={{ color: "var(--af-dourado-dark)" }}
            >
              <HandCoins className="size-3.5" />
              <Eyebrow color="var(--af-dourado-dark)">
                o que acontece quando você confirma
              </Eyebrow>
            </div>
            <ol className="mt-3 space-y-2.5">
              {[
                <>
                  AceitoFiado faz Pix de{" "}
                  <span
                    className="af-mono"
                    style={{ color: "var(--af-preto)", fontWeight: 600 }}
                  >
                    {formatBRL(order.supplierReceiveCents)}
                  </span>{" "}
                  pra sua chave.
                </>,
                <>
                  duplicata escritural é emitida em nome da empreendedora e
                  registrada em CERC.
                </>,
                <>
                  AceitoFiado assume o risco — você não tem mais nada a cobrar.
                </>,
              ].map((txt, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="af-mono grid shrink-0 place-items-center"
                    style={{
                      width: 22,
                      height: 22,
                      marginTop: 1,
                      borderRadius: 99,
                      background: "var(--af-dourado-soft)",
                      color: "var(--af-dourado-dark)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="af-body"
                    style={{ fontSize: 13.5, color: "var(--af-cinza)" }}
                  >
                    {txt}
                  </span>
                </li>
              ))}
            </ol>
          </AfCard>

          {/* EMPREENDEDORA */}
          <AfCard padding={22} radius={18} style={{ background: "var(--af-branco)" }}>
            <Eyebrow>sobre a empreendedora</Eyebrow>
            <dl className="mt-4 space-y-2.5 text-sm">
              <KV k="razão social" v={order.entrepreneur.businessName} />
              <KV
                k="CNPJ"
                v={
                  <span className="af-mono">
                    {formatCNPJ(order.entrepreneur.cnpj)}
                  </span>
                }
              />
              <KV
                k="endereço"
                v={`${order.entrepreneur.addressNeighborhood}, ${order.entrepreneur.addressCity}/${order.entrepreneur.addressState}`}
              />
              <KV
                k="no AceitoFiado desde"
                v={formatDate(order.entrepreneur.createdAt)}
              />
            </dl>
          </AfCard>
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
            ? "var(--af-preto)"
            : muted
              ? "var(--af-cinza-soft)"
              : "var(--af-cinza)",
          fontWeight: strong ? 500 : 400,
        }}
      >
        {label}
      </span>
      <span
        className={strong ? "af-mono" : "af-mono"}
        style={{
          color: strong ? "var(--af-preto)" : "var(--af-cinza)",
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
    <div className="grid grid-cols-[1fr_1.5fr] gap-3">
      <dt style={{ color: "var(--af-cinza)" }}>{k}</dt>
      <dd style={{ color: "var(--af-preto)" }}>{v}</dd>
    </div>
  );
}
