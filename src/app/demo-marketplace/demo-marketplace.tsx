// src/app/demo-marketplace/demo-marketplace.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { createDemoCheckout } from "./_actions";

type PayMethod = "fiado" | "pix" | "card";

export function DemoMarketplace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PayMethod>("fiado");

  async function handlePagar() {
    if (method !== "fiado") return;
    setLoading(true);
    const res = await createDemoCheckout();
    router.push(res.payUrl);
  }

  const subtotal = 18900;
  const frete = 0;
  const total = subtotal + frete;

  return (
    <div className="min-h-screen bg-[var(--af-creme)]">
      {/* faixa "demo" sutil no topo */}
      <div className="bg-[var(--af-preto)] text-white/70 font-mono text-[11px] tracking-wider px-6 py-2 text-center">
        ambiente de demonstração · nenhum valor real é cobrado
      </div>

      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-32px)]">
        {/* ESQUERDA — order summary (estilo Stripe) */}
        <div className="bg-[var(--af-creme)] px-6 lg:px-16 py-10 lg:py-16 border-r border-[var(--af-borda)]">
          <div className="max-w-[440px] lg:ml-auto">
            {/* breadcrumb merchant */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-[13px] text-[var(--af-cinza)] hover:text-[var(--af-preto)] transition-colors"
            >
              <span className="text-[15px]">←</span>
              <span
                className="font-bold tracking-tight"
                style={{ color: "var(--af-preto)" }}
              >
                feira<span style={{ color: "var(--af-laranja)" }}>preta</span>
              </span>
            </button>

            <div className="mt-9">
              <div className="font-mono text-[11px] tracking-wider uppercase text-[var(--af-cinza)]">
                Atelier Aruanda · Salvador/BA
              </div>
              <h1 className="af-display text-[44px] mt-2 leading-none">
                R$ 189
                <span className="text-[20px] text-[var(--af-cinza)]">,00</span>
              </h1>
              <p className="text-[13.5px] text-[var(--af-cinza)] mt-2">
                pague agora ou em 30 dias sem cartão
              </p>
            </div>

            {/* line item */}
            <div className="mt-9 flex gap-4 items-center">
              <div
                className="w-16 h-16 rounded-[10px] flex items-center justify-center af-display text-[11px] text-center px-1 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--af-creme-2) 0%, var(--af-dourado) 100%)",
                  color: "var(--af-preto)",
                  lineHeight: 1.05,
                }}
              >
                Turbante
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] leading-tight">
                  Turbante Imbondeiro · médio
                </div>
                <div className="font-mono text-[11.5px] text-[var(--af-cinza)] mt-1">
                  cera de carnaúba · qty 1
                </div>
              </div>
              <div className="font-semibold text-[14px] tabular-nums">
                R$ 189,00
              </div>
            </div>

            {/* totals */}
            <div className="mt-8 pt-5 border-t border-[var(--af-borda)] space-y-2 text-[13.5px]">
              <Row label="Subtotal" value={formatBRL(subtotal)} />
              <Row
                label="Frete"
                value={frete === 0 ? "grátis" : formatBRL(frete)}
                muted
              />
              <div className="pt-3 mt-2 border-t border-[var(--af-borda)] flex justify-between font-semibold text-[15px]">
                <span>Total devido hoje</span>
                <span className="tabular-nums">
                  {method === "fiado" ? "R$ 0,00" : formatBRL(total)}
                </span>
              </div>
              {method === "fiado" && (
                <div className="flex justify-between text-[12.5px] text-[var(--af-cinza)] font-mono pt-1">
                  <span>em 30 dias</span>
                  <span className="tabular-nums">R$ 198,45</span>
                </div>
              )}
            </div>

            {/* trust strip */}
            <div className="mt-12 flex items-center gap-2 text-[11px] font-mono text-[var(--af-cinza)] tracking-wider uppercase">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--af-sucesso)" }}
              />
              conexão segura · ssl
            </div>
          </div>
        </div>

        {/* DIREITA — payment picker */}
        <div className="bg-[var(--af-branco)] px-6 lg:px-16 py-10 lg:py-16">
          <div className="max-w-[440px]">
            <h2 className="text-[15px] font-semibold">Forma de pagamento</h2>
            <p className="text-[13px] text-[var(--af-cinza)] mt-1">
              Selecione como quer pagar essa compra.
            </p>

            <div className="flex flex-col gap-2.5 mt-6">
              <PayOption
                kind="fiado"
                selected={method === "fiado"}
                onClick={() => setMethod("fiado")}
                title="aceito.fiado"
                subtitle="30 dias · sem cartão · MEI afro"
                badge="novo"
                right="R$ 0,00 hoje"
                rightSub="R$ 198,45 em 30d"
              />
              <PayOption
                kind="pix"
                selected={method === "pix"}
                onClick={() => setMethod("pix")}
                title="Pix"
                subtitle="aprovação imediata"
                right={formatBRL(subtotal)}
                rightSub="à vista"
              />
              <PayOption
                kind="card"
                selected={method === "card"}
                onClick={() => setMethod("card")}
                title="Cartão de crédito"
                subtitle="visa, master, elo, amex"
                right={formatBRL(subtotal)}
                rightSub="até 3x sem juros"
              />
            </div>

            <button
              disabled={loading || method !== "fiado"}
              onClick={handlePagar}
              className="w-full mt-7 py-3.5 bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[10px] font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {loading
                ? "abrindo checkout..."
                : method === "fiado"
                  ? "continuar com aceito.fiado →"
                  : "selecione aceito.fiado pra continuar a demo"}
            </button>

            {method === "fiado" && (
              <p className="text-[11.5px] text-[var(--af-cinza)] text-center mt-3 leading-[1.5]">
                ao continuar você concorda em pagar{" "}
                <span className="font-semibold text-[var(--af-preto)]">
                  R$ 198,45
                </span>{" "}
                até{" "}
                <span className="font-semibold text-[var(--af-preto)]">
                  23/jun/2026
                </span>
                . sem consulta a serasa, sem cartão.
              </p>
            )}

            {/* powered by */}
            <div className="mt-10 pt-6 border-t border-[var(--af-borda)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--af-cinza)] tracking-wider uppercase">
                <span>powered by</span>
                <Logo size={13} color="var(--af-preto)" />
              </div>
              <div className="flex gap-3 text-[10.5px] font-mono text-[var(--af-cinza)] tracking-wider uppercase">
                <span>termos</span>
                <span>privacidade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${muted ? "text-[var(--af-cinza)]" : ""}`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function PayOption({
  kind,
  title,
  subtitle,
  badge,
  right,
  rightSub,
  selected,
  onClick,
}: {
  kind: "fiado" | "pix" | "card";
  title: string;
  subtitle: string;
  badge?: string;
  right: string;
  rightSub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3.5 p-3.5 rounded-[10px] transition-all ${
        selected
          ? "border-2 border-[var(--af-preto)] bg-[var(--af-creme)]"
          : "border border-[var(--af-borda)] bg-[var(--af-branco)] hover:border-[var(--af-cinza-soft)]"
      }`}
      style={{ marginTop: 0 }}
    >
      {/* radio */}
      <span
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? "border-[var(--af-preto)]" : "border-[var(--af-cinza-soft)]"
        }`}
      >
        {selected && (
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--af-preto)" }}
          />
        )}
      </span>

      {/* icon */}
      <span className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0">
        {kind === "fiado" && <FiadoMark />}
        {kind === "pix" && <PixMark />}
        {kind === "card" && <CardMark />}
      </span>

      {/* title block */}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-[13.5px]">{title}</span>
          {badge && (
            <span
              className="px-1.5 py-[2px] rounded text-[9px] font-mono tracking-wider uppercase leading-none"
              style={{
                background: "var(--af-dourado)",
                color: "var(--af-preto)",
              }}
            >
              {badge}
            </span>
          )}
        </span>
        <span className="block font-mono text-[10.5px] text-[var(--af-cinza)] mt-0.5">
          {subtitle}
        </span>
      </span>

      {/* right price */}
      <span className="text-right flex-shrink-0">
        <span className="block text-[13px] font-semibold tabular-nums">
          {right}
        </span>
        {rightSub && (
          <span className="block font-mono text-[10.5px] text-[var(--af-cinza)] mt-0.5 tabular-nums">
            {rightSub}
          </span>
        )}
      </span>
    </button>
  );
}

function FiadoMark() {
  return (
    <span
      className="w-9 h-9 rounded-md flex items-center justify-center text-[15px] font-bold"
      style={{
        background: "var(--af-preto)",
        color: "var(--af-branco)",
        letterSpacing: "-0.05em",
      }}
    >
      a<span style={{ color: "var(--af-dourado)" }}>.</span>f
    </span>
  );
}

function PixMark() {
  return (
    <span
      className="w-9 h-9 rounded-md flex items-center justify-center font-mono text-[10px] font-bold tracking-tight"
      style={{
        background: "var(--af-creme-2)",
        color: "#0c8779",
      }}
    >
      PIX
    </span>
  );
}

function CardMark() {
  return (
    <span
      className="w-9 h-9 rounded-md flex items-center justify-center"
      style={{
        background: "var(--af-creme-2)",
        color: "var(--af-preto)",
      }}
    >
      <svg
        width="18"
        height="14"
        viewBox="0 0 18 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="0.5"
          width="17"
          height="13"
          rx="2"
          stroke="currentColor"
        />
        <rect x="0" y="3" width="18" height="2.5" fill="currentColor" />
        <rect x="2.5" y="8.5" width="5" height="2" rx="0.5" fill="currentColor" />
      </svg>
    </span>
  );
}

function formatBRL(cents: number) {
  return `R$ ${(cents / 100)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
