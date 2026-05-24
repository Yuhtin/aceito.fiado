import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleDollarSign,
  HandCoins,
  MapPin,
  Package,
} from "lucide-react";

import { OrderStatusBadge } from "@/app/(entrepreneur)/app/_components/order-status-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Pedidos
          </Link>
        }
        title={
          <span className="inline-flex items-center gap-3">
            {order.entrepreneur.businessName}
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={
          <span className="inline-flex items-center gap-3 text-sm">
            <Badge variant="outline" className="bg-muted text-foreground">
              {order.duplicata?.numero ?? `Pedido #${order.id.slice(0, 8)}`}
            </Badge>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-3.5" /> {order.entrepreneur.addressCity}/
              {order.entrepreneur.addressState}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              CNPJ {formatCNPJ(order.entrepreneur.cnpj)}
            </span>
          </span>
        }
      />

      <div className="grid gap-6 px-6 py-6 md:px-10 md:py-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* AÇÃO */}
          {isAwaiting && (
            <Card className="overflow-hidden border-primary/40 bg-warm-gradient shadow-soft-lg">
              <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    Aguarda sua confirmação
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium leading-tight">
                    Confirme o pedido e receba{" "}
                    <span className="text-primary">
                      {formatBRL(order.supplierReceiveCents)}
                    </span>{" "}
                    à vista
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AceitoFiado faz o Pix pra sua chave{" "}
                    <span className="font-mono">
                      {formatCNPJ(user.supplierId.slice(0, 14).padStart(14, "0"))}
                    </span>{" "}
                    em até alguns minutos. Após confirmar, a duplicata é emitida
                    em nome da empreendedora.
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <ConfirmOrderButton orderId={order.id} />
                </div>
              </div>
            </Card>
          )}

          {/* ITENS */}
          <Card className="border-border/60 shadow-soft">
            <div className="px-6 pt-6 pb-3">
              <h2 className="font-display text-lg font-medium">
                Pedido — {order.items.length} item
                {order.items.length === 1 ? "" : "s"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Solicitado {formatRelativeTime(order.requestedAt)} ·{" "}
                {formatDate(order.requestedAt, true)}
              </p>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Package className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      SKU {item.product.sku} · {item.quantity}{" "}
                      {item.product.unit} ×{" "}
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
              <Row label="Subtotal" value={formatBRL(order.subtotalCents)} />
              <Row
                label={`Desconto AceitoFiado (${formatBps(order.supplierDiscountBps)})`}
                value={`−${formatBRL(order.subtotalCents - order.supplierReceiveCents)}`}
                muted
              />
              <Separator />
              <Row
                label="Você recebe à vista"
                value={formatBRL(order.supplierReceiveCents)}
                strong
              />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* RESUMO */}
          <Card className="border-border/60 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <HandCoins className="size-3.5" /> O que acontece quando você confirma
            </div>
            <ol className="mt-3 space-y-2.5 text-sm">
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  1
                </span>
                <span className="text-muted-foreground">
                  AceitoFiado faz Pix de{" "}
                  <span className="font-mono text-foreground">
                    {formatBRL(order.supplierReceiveCents)}
                  </span>{" "}
                  pra sua chave.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  2
                </span>
                <span className="text-muted-foreground">
                  Duplicata escritural é emitida em nome da empreendedora e
                  registrada em CERC.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                  3
                </span>
                <span className="text-muted-foreground">
                  A AceitoFiado assume o risco: você não tem mais nada a cobrar.
                </span>
              </li>
            </ol>
          </Card>

          {/* EMPREENDEDORA */}
          <Card className="border-border/60 p-5 shadow-soft">
            <h3 className="font-display text-base font-medium">
              Sobre a empreendedora
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <KV
                k="Razão social"
                v={order.entrepreneur.businessName}
              />
              <KV
                k="CNPJ"
                v={
                  <span className="font-mono">
                    {formatCNPJ(order.entrepreneur.cnpj)}
                  </span>
                }
              />
              <KV
                k="Endereço"
                v={`${order.entrepreneur.addressNeighborhood}, ${order.entrepreneur.addressCity}/${order.entrepreneur.addressState}`}
              />
              <KV
                k="No AceitoFiado desde"
                v={formatDate(order.entrepreneur.createdAt)}
              />
            </dl>
          </Card>
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
    <div
      className={
        strong
          ? "flex justify-between text-foreground"
          : muted
            ? "flex justify-between text-muted-foreground"
            : "flex justify-between"
      }
    >
      <span className={strong ? "font-medium" : ""}>{label}</span>
      <span
        className={
          strong
            ? "font-display text-lg font-semibold tabular-nums"
            : "font-mono tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr] gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}
