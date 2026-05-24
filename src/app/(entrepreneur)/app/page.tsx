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
} from "lucide-react";

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
import { RevenueByChannelChart } from "@/components/charts/revenue-by-channel";
import { PageHeader } from "@/components/shell/page-header";
import { requireEntrepreneur } from "@/lib/auth";
import { formatBRL, formatRelativeTime } from "@/lib/format";
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

  const availableLimit = Number(data.availableLimit);
  const inUseLimit = Number(data.inUseCents);
  const approvedLimit = Number(data.approvedLimit);
  const usePercent =
    approvedLimit > 0 ? (inUseLimit / approvedLimit) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow={`quarta · ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`}
        title={
          <>
            bom dia,{" "}
            <span style={{ color: "var(--af-dourado)" }}>
              {user.name.split(" ")[0]}.
            </span>
          </>
        }
        description={`${data.profile.businessName} · ${data.profile.addressNeighborhood}, ${data.profile.addressCity}/${data.profile.addressState}`}
        actions={
          <>
            <AfButton variant="outline" size="lg" href="/app/saude" icon={false}>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-4" /> saúde financeira
              </span>
            </AfButton>
            <AfButton variant="accent" size="lg" href="/app/fiado">
              comprar fiado
            </AfButton>
          </>
        }
      />

      <div
        className="grid gap-5 px-6 py-7 md:px-10 md:py-8 lg:grid-cols-[1.45fr_1fr]"
        style={{ background: "var(--af-creme-2)" }}
      >
        <div className="space-y-5">
          {/* HERO LIMITE */}
          <AfCard padding={28} radius={20} className="overflow-hidden">
            <Eyebrow>limite agora · disponível</Eyebrow>
            <div style={{ marginTop: 14 }}>
              <Money cents={availableLimit} size={56} weight={600} />
            </div>
            <p
              className="af-mono"
              style={{
                fontSize: 12,
                color: "var(--af-cinza)",
                marginTop: 8,
              }}
            >
              de R$ {(approvedLimit / 100).toLocaleString("pt-BR")} aprovados ·{" "}
              <Link
                href="/app/saude"
                className="underline-offset-2 hover:underline"
              >
                como calculamos
              </Link>
            </p>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  height: 6,
                  borderRadius: 99,
                  overflow: "hidden",
                  background: "var(--af-borda)",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, usePercent)}%`,
                    background: "var(--af-dourado)",
                    transition: "width 1.2s ease",
                  }}
                />
                <div
                  style={{
                    width: `${Math.max(0, 100 - usePercent)}%`,
                    background: "var(--af-sucesso)",
                    opacity: 0.25,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
                className="af-mono"
              >
                <span style={{ fontSize: 11.5, color: "var(--af-dourado-dark)" }}>
                  <span style={{ fontWeight: 600 }}>
                    {formatBRL(inUseLimit, { withSymbol: true })}
                  </span>{" "}
                  comprometido
                </span>
                <span style={{ fontSize: 11.5, color: "var(--af-sucesso)" }}>
                  <span style={{ fontWeight: 600 }}>
                    {formatBRL(availableLimit, { withSymbol: true })}
                  </span>{" "}
                  livre
                </span>
              </div>
            </div>
          </AfCard>

          {/* FLUXO DE CANAIS */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "24px 28px 8px",
              }}
            >
              <div>
                <Eyebrow>fluxo dos seus canais</Eyebrow>
                <h2
                  className="af-display"
                  style={{
                    fontSize: 22,
                    margin: "8px 0 0",
                    color: "var(--af-preto)",
                  }}
                >
                  últimos 30 dias
                </h2>
              </div>
              <div className="hidden md:flex flex-wrap items-center gap-3">
                {data.channels.map((c, i) => {
                  const colors = [
                    "var(--af-terra)",
                    "var(--af-acafrao)",
                    "var(--af-mata-2)",
                    "var(--af-cobre)",
                  ];
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{
                          background: colors[i % colors.length],
                        }}
                      />
                      <span style={{ color: "var(--af-cinza)" }}>
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-4 pb-4">
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
          </AfCard>

          {/* OPERAÇÕES ATIVAS */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div
              style={{
                padding: "24px 28px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <Eyebrow>operações ativas · {data.activeOrders.length}</Eyebrow>
                <h2
                  className="af-display"
                  style={{
                    fontSize: 22,
                    margin: "8px 0 0",
                    color: "var(--af-preto)",
                  }}
                >
                  duplicatas em circulação
                </h2>
              </div>
              <Link
                href="/app/historico"
                className="text-sm font-medium inline-flex items-center gap-1"
                style={{ color: "var(--af-cinza)" }}
              >
                histórico <ChevronRight className="size-4" />
              </Link>
            </div>
            <div style={{ borderTop: "1px solid var(--af-borda)" }}>
              {data.activeOrders.length === 0 ? (
                <div className="px-7 py-14 text-center">
                  <p
                    className="af-body"
                    style={{ fontSize: 14, color: "var(--af-cinza)" }}
                  >
                    nenhuma operação ativa. que tal abrir uma agora?
                  </p>
                  <div className="mt-4 inline-block">
                    <AfButton variant="accent" size="md" href="/app/fiado">
                      comprar fiado
                    </AfButton>
                  </div>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--af-borda)" }}>
                  {data.activeOrders.map((order) => {
                    const paid = order.receivables.reduce(
                      (a, r) => a + r.amountCapturedCents,
                      0n,
                    );
                    const t = Number(order.customerPayCents);
                    const p = Number(paid);
                    const remaining = t - p;
                    const pct = t === 0 ? 0 : (p / t) * 100;
                    return (
                      <Link
                        key={order.id}
                        href={`/app/fiado/op/${order.id}`}
                        className="grid items-center gap-4 px-7 py-4 transition-colors hover:bg-[var(--af-creme)]"
                        style={{
                          gridTemplateColumns: "auto 1fr auto auto",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            background: "var(--af-preto)",
                            color: "var(--af-creme)",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--af-display)",
                            fontSize: 16,
                            fontWeight: 400,
                          }}
                        >
                          {order.supplier.businessName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="af-body truncate"
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                margin: 0,
                                color: "var(--af-preto)",
                              }}
                            >
                              {order.supplier.businessName}
                            </p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p
                            className="af-mono"
                            style={{
                              fontSize: 11,
                              color: "var(--af-cinza)",
                              margin: "3px 0 0",
                            }}
                          >
                            {order.items.length} item
                            {order.items.length === 1 ? "" : "s"}
                            {order.duplicata && (
                              <> · {order.duplicata.numero}</>
                            )}
                            {order.dueDate && (
                              <>
                                {" · "}vence {formatRelativeTime(order.dueDate)}
                              </>
                            )}
                          </p>
                          <div
                            style={{
                              marginTop: 8,
                              height: 3,
                              background: "var(--af-borda)",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: "var(--af-sucesso)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <Money cents={remaining > 0 ? remaining : 0} size={15} />
                          <p
                            className="af-mono"
                            style={{
                              fontSize: 10,
                              color: "var(--af-cinza)",
                              margin: "3px 0 0",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            restante
                          </p>
                        </div>
                        <ChevronRight
                          className="size-4"
                          style={{ color: "var(--af-cinza)" }}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </AfCard>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-5">
          {/* TRAVA DARK CARD */}
          <GradientMesh
            dark
            style={{
              borderRadius: 20,
              padding: 22,
              color: "var(--af-paper)",
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
                  <Lock className="size-3" />
                  trava · hoje
                </span>
              </Eyebrow>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SoundBars
                  count={4}
                  color="var(--af-acafrao)"
                  height={12}
                  width={2}
                />
                <PulseDot color="var(--af-acafrao)" label="ao vivo" />
              </div>
            </div>
            <div
              className="af-n"
              style={{ fontSize: 44, lineHeight: 0.95, color: "var(--af-paper)" }}
            >
              <span
                style={{
                  fontSize: 18,
                  opacity: 0.4,
                  marginRight: 4,
                  verticalAlign: "0.5em",
                }}
              >
                R$
              </span>
              <BRLLive
                initial={Number(data.capturedThisMonth) / 100}
                ratePerSec={0.21}
                jitter={0.55}
              />
            </div>
            <div
              className="af-mono"
              style={{
                fontSize: 11.5,
                color: "oklch(0.972 0.008 75 / 0.55)",
                marginTop: 6,
              }}
            >
              capturado este mês · últimos 14 dias abaixo
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "oklch(0.972 0.008 75 / 0.05)",
                borderRadius: 12,
                border: "1px solid oklch(0.972 0.008 75 / 0.08)",
              }}
            >
              <CaptureProgressChart
                captures={data.receivables90d.map((r) => ({
                  capturedAt: r.capturedAt,
                  amountCapturedCents: r.amountCapturedCents,
                }))}
              />
            </div>
            <Link
              href="/app/trava"
              className="mt-4 inline-flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-opacity"
              style={{
                border: "1px solid oklch(0.972 0.008 75 / 0.18)",
                color: "var(--af-paper)",
              }}
            >
              <span>abrir liquidação ao vivo</span>
              <ArrowUpRight className="size-4" style={{ opacity: 0.7 }} />
            </Link>
          </GradientMesh>

          {/* CANAIS CONECTADOS */}
          <AfCard padding={0} radius={18} className="overflow-hidden">
            <div style={{ padding: "20px 22px 12px" }}>
              <p className="af-eb">canais conectados · {data.channels.length}</p>
              <h3
                className="af-display"
                style={{
                  fontSize: 18,
                  margin: "6px 0 0",
                  color: "var(--af-preto)",
                }}
              >
                onde o dinheiro entra
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--af-borda)" }}>
              {data.channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.type] ?? Sparkles;
                return (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "var(--af-preto)",
                        color: "var(--af-creme)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="af-body truncate"
                        style={{ fontSize: 13.5, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                      >
                        {channel.label}
                      </p>
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--af-cinza)",
                          margin: "2px 0 0",
                        }}
                      >
                        contribui {formatBRL(channel.monthlyRevenueCents, { compact: true })}/mês
                      </p>
                    </div>
                    <PulseDot color="var(--af-sucesso)" size={5} />
                  </div>
                );
              })}
            </div>
          </AfCard>

          {/* FORNECEDORES */}
          <AfCard padding={0} radius={18} className="overflow-hidden">
            <div style={{ padding: "20px 22px 12px" }}>
              <p className="af-eb">fornecedores na rede</p>
              <h3
                className="af-display"
                style={{
                  fontSize: 18,
                  margin: "6px 0 0",
                  color: "var(--af-preto)",
                }}
              >
                curados na cadeia afro
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--af-borda)" }}>
              {featuredSuppliers.map((s) => (
                <Link
                  key={s.id}
                  href="/app/fiado"
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[var(--af-creme)]"
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "var(--af-dourado-soft)",
                      color: "var(--af-dourado-dark)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--af-display)",
                      fontSize: 16,
                      fontWeight: 400,
                    }}
                  >
                    {s.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="af-body truncate"
                      style={{ fontSize: 13.5, fontWeight: 500, margin: 0, color: "var(--af-preto)" }}
                    >
                      {s.businessName}
                    </p>
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 10.5,
                        color: "var(--af-cinza)",
                        margin: "2px 0 0",
                      }}
                    >
                      {s._count.products} produtos · {s.addressNeighborhood}
                    </p>
                  </div>
                  <ArrowRight
                    className="size-4"
                    style={{ color: "var(--af-cinza)" }}
                  />
                </Link>
              ))}
            </div>
          </AfCard>
        </div>
      </div>
    </>
  );
}
