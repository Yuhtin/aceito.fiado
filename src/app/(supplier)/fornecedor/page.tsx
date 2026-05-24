import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  ChevronRight,
  Inbox,
  Package,
  Zap,
} from "lucide-react";

import { AfCard, Eyebrow, Money } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireSupplier } from "@/lib/auth";
import { formatBRL, formatBps, formatRelativeTime } from "@/lib/format";
import { getSupplierOverview } from "@/lib/queries";

export default async function SupplierDashboard() {
  const user = await requireSupplier();
  const data = await getSupplierOverview(user.supplierId);

  return (
    <>
      <PageHeader
        eyebrow="painel do fornecedor"
        title={data.profile.businessName}
        description={`${data.profile.addressNeighborhood}, ${data.profile.addressCity}/${data.profile.addressState} · ${data.productsCount} produtos no catálogo`}
        actions={
          <Link
            href="/fornecedor/produtos"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--af-preto)",
              color: "var(--af-branco)",
            }}
          >
            <Package className="size-4" /> meus produtos
          </Link>
        }
      />

      {/* Hero strip — Cobrar fiado */}
      <div
        className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10"
        style={{
          background: "var(--af-dourado)",
          borderBottom: "1px solid var(--af-dourado-dark)",
        }}
      >
        <div>
          <p
            className="af-display"
            style={{ fontSize: "clamp(20px, 2.5vw, 28px)", color: "var(--af-preto)" }}
          >
            Cobrar fiado
          </p>
          <p
            className="af-body mt-1"
            style={{ fontSize: 14, color: "var(--af-preto-soft)" }}
          >
            registre uma venda a prazo e receba Pix imediato da AceitoFiado.
          </p>
        </div>
        <Link
          href="/fornecedor/cobrar"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: "var(--af-preto)",
            color: "var(--af-branco)",
            whiteSpace: "nowrap",
          }}
        >
          <Zap className="size-4" /> cobrar agora
        </Link>
      </div>

      <div
        className="px-6 py-7 md:px-10 md:py-8"
        style={{ background: "var(--af-creme)" }}
      >
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <AfCard padding={24} radius={18} style={{ background: "var(--af-branco)" }}>
            <div className="flex items-center justify-between">
              <Eyebrow>recebido (30 dias)</Eyebrow>
              <Banknote
                className="size-4"
                style={{ color: "var(--af-cinza-soft)" }}
              />
            </div>
            <div className="mt-4">
              <Money cents={data.totalReceived30d} size={36} weight={600} />
            </div>
            <p
              className="af-mono mt-2"
              style={{ fontSize: 11, color: "var(--af-mata)" }}
            >
              à vista no Pix
            </p>
          </AfCard>

          <AfCard padding={24} radius={18} style={{ background: "var(--af-branco)" }}>
            <div className="flex items-center justify-between">
              <Eyebrow>pedidos aguardando</Eyebrow>
              <Inbox
                className="size-4"
                style={{ color: "var(--af-cinza-soft)" }}
              />
            </div>
            <p
              className="af-mono mt-3"
              style={{
                fontSize: 38,
                lineHeight: 1,
                color: "var(--af-preto)",
              }}
            >
              {data.awaiting.length}
            </p>
            <Link
              href="/fornecedor/pedidos"
              className="af-mono mt-2 inline-flex items-center gap-1.5"
              style={{ fontSize: 11, color: "var(--af-cinza)" }}
            >
              ver fila <ArrowRight className="size-3" />
            </Link>
          </AfCard>

          <AfCard padding={24} radius={18} style={{ background: "var(--af-branco)" }}>
            <div className="flex items-center justify-between">
              <Eyebrow>desconto padrão</Eyebrow>
              <Banknote
                className="size-4"
                style={{ color: "var(--af-cinza-soft)" }}
              />
            </div>
            <p
              className="af-mono mt-3"
              style={{
                fontSize: 38,
                lineHeight: 1,
                color: "var(--af-preto)",
              }}
            >
              {formatBps(data.profile.defaultDiscountBps)}
            </p>
            <p
              className="af-body mt-2"
              style={{ fontSize: 11.5, color: "var(--af-cinza)" }}
            >
              cobrado da AceitoFiado pra liquidar à vista
            </p>
          </AfCard>
        </div>

        {/* PEDIDOS AGUARDANDO + ATIVAS */}
        <div className="mt-6 grid gap-5 md:grid-cols-[1.6fr_1fr]">
          <AfCard padding={0} radius={20} className="overflow-hidden" style={{ background: "var(--af-branco)" }}>
            <div className="flex items-end justify-between px-7 pt-6 pb-3">
              <div>
                <Eyebrow>pedidos aguardando você</Eyebrow>
                <h2
                  className="af-display mt-2"
                  style={{ fontSize: 22, color: "var(--af-preto)" }}
                >
                  confirme pra receber Pix
                </h2>
              </div>
              {data.awaiting.length > 0 && (
                <span
                  className="af-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    fontSize: 11,
                    background: "var(--af-dourado-soft)",
                    color: "var(--af-dourado-dark)",
                    border: "1px solid oklch(from var(--af-dourado) l c h / 0.3)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                  }}
                >
                  {data.awaiting.length} pendente
                  {data.awaiting.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              {data.awaiting.length === 0 && (
                <p
                  className="px-7 py-12 text-center text-sm"
                  style={{ color: "var(--af-cinza)" }}
                >
                  nenhum pedido pendente. quando uma empreendedora comprar
                  fiado, ele aparece aqui.
                </p>
              )}
              <div
                className="divide-y"
                style={{ borderColor: "var(--af-borda)" }}
              >
                {data.awaiting.map((o) => (
                  <Link
                    key={o.id}
                    href={`/fornecedor/pedidos/${o.id}`}
                    className="flex items-start gap-4 px-7 py-4 transition-colors hover:bg-[var(--af-creme)]"
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "var(--af-dourado-soft)",
                        color: "var(--af-dourado-dark)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Inbox className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="af-body truncate"
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
                        {o.entrepreneur.addressCity}/
                        {o.entrepreneur.addressState} · {o.items.length} item
                        {o.items.length === 1 ? "" : "s"} ·{" "}
                        {formatRelativeTime(o.requestedAt)}
                      </p>
                      <p
                        className="af-body mt-2 line-clamp-1"
                        style={{
                          fontSize: 12,
                          color: "var(--af-cinza)",
                          margin: "6px 0 0",
                        }}
                      >
                        {o.items
                          .map((i) => `${i.quantity}× ${i.product.name}`)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Money cents={o.supplierReceiveCents} size={15} />
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10,
                          color: "var(--af-cinza)",
                          margin: "4px 0 0",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        você recebe
                      </p>
                    </div>
                    <ChevronRight
                      className="size-4 mt-1"
                      style={{ color: "var(--af-cinza-soft)" }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </AfCard>

          <AfCard padding={0} radius={20} className="overflow-hidden" style={{ background: "var(--af-branco)" }}>
            <div className="px-6 pt-6 pb-3">
              <Eyebrow>duplicatas vivas</Eyebrow>
              <h3
                className="af-display mt-2"
                style={{ fontSize: 18, color: "var(--af-preto)" }}
              >
                já paguei, AceitoFiado cobra
              </h3>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              {data.active.length === 0 && (
                <p
                  className="px-6 py-10 text-center text-sm"
                  style={{ color: "var(--af-cinza)" }}
                >
                  sem duplicatas vivas.
                </p>
              )}
              <div
                className="divide-y"
                style={{ borderColor: "var(--af-borda)" }}
              >
                {data.active.map((o) => (
                  <div key={o.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className="af-body truncate"
                        style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                      >
                        {o.entrepreneur.businessName}
                      </p>
                      <span
                        className="af-mono"
                        style={{ fontSize: 10.5, color: "var(--af-cinza)" }}
                      >
                        {o.duplicata?.numero ?? "—"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <Money cents={o.supplierReceiveCents} size={13} />
                      <span
                        className="af-mono"
                        style={{ fontSize: 10.5, color: "var(--af-cinza)" }}
                      >
                        pago{" "}
                        {o.fundedAt ? formatRelativeTime(o.fundedAt) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AfCard>
        </div>
      </div>
    </>
  );
}
