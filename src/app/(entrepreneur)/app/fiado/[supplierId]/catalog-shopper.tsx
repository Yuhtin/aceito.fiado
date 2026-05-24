"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CircleCheck,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AfCard, CodeBlock, Eyebrow, Money } from "@/components/af";
import { formatBRL, formatBps } from "@/lib/format";
import { cn } from "@/lib/utils";

import { submitOrderAction } from "./_actions";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceCents: string;
  unit: string;
  stock: number;
  minQuantity: number;
};

type CartItem = { productId: string; qty: number };

type TermOption = { days: number; interestBps: number; captureBps: number };

const TERM_OPTIONS: TermOption[] = [
  { days: 30, interestBps: 400, captureBps: 2500 },
  { days: 45, interestBps: 500, captureBps: 3000 },
  { days: 60, interestBps: 650, captureBps: 3500 },
];

export function CatalogShopper({
  supplierId,
  supplierName,
  supplierDiscountBps,
  products,
  availableLimitCents,
  approvedLimitCents,
}: {
  supplierId: string;
  supplierName: string;
  supplierDiscountBps: number;
  products: Product[];
  availableLimitCents: string;
  approvedLimitCents: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [term, setTerm] = useState<TermOption>(TERM_OPTIONS[1]);
  const [pending, startTransition] = useTransition();

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const product = productMap.get(productId)!;
      const next = Math.max(0, Math.min(product.stock, qty));
      if (next === 0) return prev.filter((i) => i.productId !== productId);
      if (existing)
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: next } : i,
        );
      return [...prev, { productId, qty: next }];
    });
  }
  const getQty = (id: string) =>
    cart.find((i) => i.productId === id)?.qty ?? 0;

  const subtotalCents = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const p = productMap.get(item.productId);
        if (!p) return acc;
        return acc + Number(p.priceCents) * item.qty;
      }, 0),
    [cart, productMap],
  );

  const supplierReceiveCents = Math.round(
    subtotalCents * (1 - supplierDiscountBps / 10000),
  );
  const customerPayCents = Math.round(
    subtotalCents * (1 + term.interestBps / 10000),
  );
  const availableLimit = Number(availableLimitCents);
  const approvedLimit = Number(approvedLimitCents);
  const overLimit = supplierReceiveCents > availableLimit;
  const cartItemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("adicione produtos antes de confirmar.");
      return;
    }
    if (overLimit) {
      toast.error("pedido ultrapassa seu limite disponível.");
      return;
    }
    startTransition(async () => {
      const result = await submitOrderAction({
        supplierId,
        termDays: term.days,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.qty,
        })),
      });
      if (!result.ok) {
        toast.error(result.error ?? "não conseguimos enviar o pedido.");
        return;
      }
      toast.success("pedido enviado pro fornecedor", {
        description: `você será notificada quando ${supplierName} confirmar.`,
      });
      router.push(`/app/fiado/op/${result.orderId}`);
    });
  }

  return (
    <div
      className="grid gap-6 px-6 py-7 md:px-10 md:py-9 lg:grid-cols-[1.6fr_1fr]"
      style={{ background: "var(--af-paper-2)" }}
    >
      {/* CATÁLOGO */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Eyebrow>catálogo</Eyebrow>
            <h2
              className="af-h"
              style={{
                fontSize: 22,
                margin: "8px 0 0",
                color: "var(--af-ink-deep)",
              }}
            >
              {products.length} produtos
            </h2>
          </div>
          <p
            className="af-mono"
            style={{ fontSize: 11.5, color: "var(--af-ink-soft)" }}
          >
            desconto fornecedor{" "}
            <span style={{ color: "var(--af-ink)" }}>
              {formatBps(supplierDiscountBps)}
            </span>
          </p>
        </div>
        <div className="grid gap-3">
          {products.map((p) => {
            const qty = getQty(p.id);
            return (
              <AfCard
                key={p.id}
                padding={16}
                radius={14}
                className={cn(
                  "flex items-center gap-4 transition-all",
                  qty > 0 && "ring-2 ring-[var(--af-terra)]/40",
                )}
                style={
                  qty > 0
                    ? { background: "oklch(0.92 0.030 45 / 0.4)" }
                    : undefined
                }
              >
                <div
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    background: qty > 0 ? "var(--af-terra)" : "var(--af-paper-3)",
                    color: qty > 0 ? "var(--af-paper)" : "var(--af-ink-soft)",
                    borderRadius: 12,
                  }}
                >
                  <Package className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className="af-body truncate"
                      style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                    >
                      {p.name}
                    </p>
                    <span className="af-n shrink-0" style={{ fontSize: 14 }}>
                      <Money
                        cents={BigInt(p.priceCents)}
                        size={14}
                        weight={600}
                      />
                      <span
                        className="af-mono"
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "var(--af-ink-soft)",
                          marginLeft: 2,
                        }}
                      >
                        /{p.unit}
                      </span>
                    </span>
                  </div>
                  <p
                    className="af-body truncate"
                    style={{
                      fontSize: 12,
                      color: "var(--af-ink-soft)",
                      margin: "3px 0 0",
                    }}
                  >
                    {p.description}
                  </p>
                  <div
                    className="af-mono mt-1 flex items-center gap-2"
                    style={{
                      fontSize: 10,
                      color: "var(--af-ink-soft)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span>SKU {p.sku}</span>
                    <span>·</span>
                    <span>{p.stock} em estoque</span>
                    {p.minQuantity > 1 && (
                      <>
                        <span>·</span>
                        <span>mín {p.minQuantity}</span>
                      </>
                    )}
                  </div>
                </div>
                <QuantityStepper
                  qty={qty}
                  min={p.minQuantity}
                  max={p.stock}
                  onChange={(n) => setQty(p.id, n)}
                />
              </AfCard>
            );
          })}
        </div>
      </div>

      {/* SIDEBAR — carrinho */}
      <aside className="sticky top-4 self-start">
        <AfCard padding={0} radius={18} className="shadow-af-lift overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <Eyebrow>seu pedido</Eyebrow>
              <h3
                className="af-h"
                style={{
                  fontSize: 18,
                  margin: "6px 0 0",
                  color: "var(--af-ink-deep)",
                }}
              >
                {cartItemCount} item{cartItemCount === 1 ? "" : "s"}
              </h3>
            </div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: "var(--af-paper-3)",
                color: "var(--af-ink-soft)",
                fontSize: 11,
              }}
            >
              <ShoppingCart className="size-3" />
              <span className="af-mono">{cartItemCount}</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--af-ink-08)" }} />
          <div
            className="max-h-72 overflow-y-auto divide-y"
            style={{ borderColor: "var(--af-ink-08)" }}
          >
            {cart.length === 0 ? (
              <div
                className="px-5 py-8 text-center"
                style={{ color: "var(--af-ink-soft)", fontSize: 13 }}
              >
                toque em <Plus className="inline size-3.5" /> pra começar.
              </div>
            ) : (
              cart.map((item) => {
                const p = productMap.get(item.productId)!;
                const total = Number(p.priceCents) * item.qty;
                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="af-body truncate"
                        style={{ fontSize: 13, fontWeight: 500, margin: 0 }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="af-mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--af-ink-soft)",
                          margin: "2px 0 0",
                        }}
                      >
                        {item.qty} {p.unit} ×{" "}
                        {formatBRL(BigInt(p.priceCents))}
                      </p>
                    </div>
                    <div className="text-right">
                      <Money cents={total} size={13} weight={600} />
                      <button
                        type="button"
                        onClick={() => setQty(p.id, 0)}
                        className="block mt-1 text-[10px] hover:opacity-100 opacity-70"
                        style={{ color: "var(--af-brasa)" }}
                      >
                        <Trash2 className="inline size-3" /> remover
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* prazos */}
          <div className="px-5 pt-4">
            <Eyebrow>prazo de pagamento</Eyebrow>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TERM_OPTIONS.map((opt) => {
                const selected = term.days === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setTerm(opt)}
                    className="flex flex-col items-center rounded-xl px-2 py-2.5 transition-all"
                    style={{
                      background: selected
                        ? "var(--af-terra)"
                        : "var(--af-paper-2)",
                      color: selected ? "var(--af-paper)" : "var(--af-ink)",
                      border: `1px solid ${selected ? "var(--af-terra)" : "var(--af-ink-08)"}`,
                    }}
                  >
                    <span
                      className="af-n"
                      style={{ fontSize: 16, fontWeight: 600 }}
                    >
                      {opt.days}d
                    </span>
                    <span
                      className="af-mono"
                      style={{
                        fontSize: 10,
                        color: selected
                          ? "oklch(0.972 0.008 75 / 0.7)"
                          : "var(--af-ink-soft)",
                        marginTop: 2,
                      }}
                    >
                      +{formatBps(opt.interestBps)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* breakdown · code-style */}
          {cart.length > 0 && (
            <div className="px-5 pt-4">
              <CodeBlock title="breakdown · transparente" style={{ borderRadius: 12 }}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span style={{ opacity: 0.7 }}>subtotal</span>
                    <span>{formatBRL(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ opacity: 0.7 }}>
                      desconto fornecedor ({formatBps(supplierDiscountBps)})
                    </span>
                    <span style={{ color: "var(--af-mata-2)" }}>
                      −{formatBRL(subtotalCents - supplierReceiveCents)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ opacity: 0.7 }}>
                      custo prazo ({term.days}d · {formatBps(term.interestBps)})
                    </span>
                    <span style={{ color: "var(--af-acafrao)" }}>
                      +{formatBRL(customerPayCents - subtotalCents)}
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid oklch(0.972 0.008 75 / 0.15)",
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                    className="flex justify-between"
                  >
                    <span style={{ color: "var(--af-paper)", fontWeight: 600 }}>
                      você paga
                    </span>
                    <span style={{ color: "var(--af-paper)", fontWeight: 600 }}>
                      {formatBRL(customerPayCents)}
                    </span>
                  </div>
                </div>
              </CodeBlock>
              <p
                className="af-mono mt-2 text-center"
                style={{
                  fontSize: 10.5,
                  color: "var(--af-ink-soft)",
                  lineHeight: 1.5,
                }}
              >
                {formatBps(term.captureBps)} do seu Pix vai direcionar
                automaticamente
              </p>
            </div>
          )}

          {/* aviso limite */}
          {cart.length > 0 && (
            <div
              className="mx-5 mt-4 flex items-start gap-2 rounded-xl p-3"
              style={{
                background: overLimit
                  ? "oklch(0.485 0.175 30 / 0.08)"
                  : "oklch(0.420 0.085 155 / 0.08)",
                border: `1px solid ${overLimit ? "var(--af-brasa)" : "var(--af-mata-2)"}`,
                color: overLimit ? "var(--af-brasa)" : "var(--af-mata)",
                fontSize: 12,
              }}
            >
              {overLimit ? (
                <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
              ) : (
                <CircleCheck className="size-3.5 shrink-0 mt-0.5" />
              )}
              <p className="m-0">
                {overLimit
                  ? `excede seu limite em ${formatBRL(supplierReceiveCents - availableLimit)}.`
                  : `dentro do limite — sobram ${formatBRL(availableLimit - supplierReceiveCents)} disponíveis.`}
              </p>
            </div>
          )}

          <div className="px-5 py-5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending || cart.length === 0 || overLimit}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                background: "var(--af-terra)",
                color: "var(--af-paper)",
                fontFamily: "var(--af-sans)",
              }}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  enviar pedido <ChevronRight className="size-4" />
                </>
              )}
            </button>
            <p
              className="af-mono mt-3 text-center"
              style={{
                fontSize: 10,
                color: "var(--af-ink-soft)",
                lineHeight: 1.5,
              }}
            >
              o fornecedor confirma em até algumas horas
            </p>
          </div>
        </AfCard>

        <p
          className="af-mono mt-3 px-2 text-center"
          style={{ fontSize: 10.5, color: "var(--af-ink-soft)" }}
        >
          <Sparkles
            className="inline size-3"
            style={{ color: "var(--af-terra)" }}
          />{" "}
          limite total aprovado{" "}
          <span style={{ color: "var(--af-ink)", fontWeight: 600 }}>
            {formatBRL(approvedLimit)}
          </span>
        </p>
      </aside>
    </div>
  );
}

function QuantityStepper({
  qty,
  min,
  max,
  onChange,
}: {
  qty: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => onChange(Math.max(1, min))}
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
        style={{
          background: "var(--af-paper-2)",
          color: "var(--af-ink)",
          border: "1px solid var(--af-ink-12)",
        }}
      >
        <Plus className="size-3.5" /> adicionar
      </button>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-1"
      style={{
        background: "var(--af-terra)",
        color: "var(--af-paper)",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        className="grid size-6 place-items-center rounded-full"
        style={{ color: "var(--af-paper)" }}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center font-mono text-xs font-medium tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        className="grid size-6 place-items-center rounded-full disabled:opacity-40"
        style={{ color: "var(--af-paper)" }}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
