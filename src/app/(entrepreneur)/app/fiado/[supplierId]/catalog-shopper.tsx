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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

type TermOption = {
  days: number;
  interestBps: number;
  captureBps: number;
};

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

  function getQty(productId: string): number {
    return cart.find((i) => i.productId === productId)?.qty ?? 0;
  }

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
  const platformFeeCents = customerPayCents - supplierReceiveCents;

  const availableLimit = Number(availableLimitCents);
  const approvedLimit = Number(approvedLimitCents);
  const overLimit = supplierReceiveCents > availableLimit;

  const cartItemCount = cart.reduce((acc, i) => acc + i.qty, 0);

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("Adicione produtos antes de confirmar.");
      return;
    }
    if (overLimit) {
      toast.error("Pedido ultrapassa seu limite disponível.");
      return;
    }
    startTransition(async () => {
      const result = await submitOrderAction({
        supplierId,
        termDays: term.days,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.qty })),
      });
      if (!result.ok) {
        toast.error(result.error ?? "Não conseguimos enviar o pedido.");
        return;
      }
      toast.success("Pedido enviado pro fornecedor", {
        description: `Você será notificada quando ${supplierName} confirmar.`,
      });
      router.push(`/app/fiado/op/${result.orderId}`);
    });
  }

  return (
    <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1.6fr_1fr]">
      {/* Catálogo */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Catálogo</h2>
          <p className="text-xs text-muted-foreground">
            {products.length} produtos · desconto fornecedor{" "}
            <span className="font-mono">{formatBps(supplierDiscountBps)}</span>
          </p>
        </div>
        <div className="grid gap-3">
          {products.map((p) => {
            const qty = getQty(p.id);
            return (
              <Card
                key={p.id}
                className={cn(
                  "flex items-center gap-4 border-border/60 p-4 shadow-soft transition-all",
                  qty > 0 && "border-primary/50 bg-primary/[0.02]",
                )}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Package className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                      {formatBRL(BigInt(p.priceCents))}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{p.unit}
                      </span>
                    </p>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>SKU {p.sku}</span>
                    <span>·</span>
                    <span>{p.stock} em estoque</span>
                    {p.minQuantity > 1 && (
                      <>
                        <span>·</span>
                        <span>mínimo {p.minQuantity}</span>
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
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sidebar — carrinho */}
      <aside className="sticky top-4 self-start">
        <Card className="border-border/60 shadow-soft-lg">
          <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
            <h3 className="font-display text-lg font-medium">
              Seu pedido
            </h3>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <ShoppingCart className="size-3" />
              {cartItemCount}
            </Badge>
          </div>
          <Separator />
          <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
            {cart.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Toque em <Plus className="inline size-3.5" /> nos produtos pra
                começar.
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
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground tabular-nums">
                        {item.qty} {p.unit} ×{" "}
                        {formatBRL(BigInt(p.priceCents))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium tabular-nums">
                        {formatBRL(total)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setQty(p.id, 0)}
                        className="text-[10px] text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="inline size-3" /> remover
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Prazos */}
          <div className="px-5 pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Prazo de pagamento
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TERM_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setTerm(opt)}
                  className={cn(
                    "flex flex-col items-center rounded-lg border px-2 py-2.5 text-xs transition-colors",
                    term.days === opt.days
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span className="font-semibold">{opt.days} dias</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    +{formatBps(opt.interestBps)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="mt-4" />

          {/* Resumo */}
          <div className="space-y-1.5 px-5 py-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                {formatBRL(subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                Custo do prazo ({term.days}d ·{" "}
                {formatBps(term.interestBps)})
              </span>
              <span className="font-mono tabular-nums">
                +{formatBRL(customerPayCents - subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-foreground">
              <span className="font-medium">Você paga em {term.days} dias</span>
              <span className="font-display text-lg font-semibold tabular-nums">
                {formatBRL(customerPayCents)}
              </span>
            </div>
            <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
              {formatBps(term.captureBps)} do seu Pix será direcionado
              automaticamente pra liquidar a duplicata.
            </p>
          </div>

          {/* Aviso limite */}
          {cart.length > 0 && (
            <div
              className={cn(
                "mx-5 mb-4 flex items-start gap-2 rounded-lg border p-3 text-xs",
                overLimit
                  ? "border-destructive/30 bg-destructive/5 text-destructive"
                  : "border-success/30 bg-success/5 text-success-foreground",
              )}
            >
              {overLimit ? (
                <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
              ) : (
                <CircleCheck className="size-3.5 shrink-0 mt-0.5" />
              )}
              <p className={cn(overLimit ? "" : "text-foreground")}>
                {overLimit
                  ? `Pedido excede seu limite disponível em ${formatBRL(supplierReceiveCents - availableLimit)}.`
                  : `Dentro do seu limite — depois desse pedido, sobram ${formatBRL(availableLimit - supplierReceiveCents)} disponíveis.`}
              </p>
            </div>
          )}

          <div className="px-5 pb-5">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={pending || cart.length === 0 || overLimit}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Enviar pedido <ChevronRight className="size-4" />
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              O fornecedor confirma em até algumas horas. Sua compra só vira
              fiado depois disso.
            </p>
          </div>
        </Card>

        <p className="mt-3 px-2 text-center text-[11px] text-muted-foreground">
          <Sparkles className="inline size-3 text-primary" /> Limite total
          aprovado{" "}
          <span className="font-mono">{formatBRL(approvedLimit)}</span>
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
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={() => onChange(Math.max(1, min))}
      >
        <Plus className="size-3.5" /> Adicionar
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-lg border border-primary/60 bg-primary/5 px-1 py-1">
      <Button
        size="icon"
        variant="ghost"
        className="size-7 text-primary hover:bg-primary/10"
        onClick={() => onChange(qty - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-8 text-center font-mono text-sm font-medium tabular-nums">
        {qty}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 text-primary hover:bg-primary/10"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
