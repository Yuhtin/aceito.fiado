// src/app/demo-marketplace/demo-marketplace.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createDemoCheckout } from "./_actions";

export function DemoMarketplace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePagar() {
    setLoading(true);
    const res = await createDemoCheckout();
    router.push(res.payUrl);
  }

  return (
    <div className="min-h-screen bg-[var(--af-creme)]">
      <div className="bg-[var(--af-laranja)] text-[var(--af-branco)] px-6 py-2.5 font-mono text-[12px] flex justify-between max-w-[900px] mx-auto md:rounded-b-[12px]">
        <span>feirapreta.com.br · checkout</span>
        <span className="bg-white/20 px-2 py-0.5 rounded">demo</span>
      </div>
      <div className="max-w-[900px] mx-auto p-7 grid md:grid-cols-[1.2fr_1fr] gap-7">
        <div
          className="aspect-[4/3] rounded-[12px] flex items-center justify-center af-display text-[18px] text-center px-5"
          style={{
            background:
              "linear-gradient(135deg, var(--af-creme-2) 0%, var(--af-dourado) 100%)",
            color: "var(--af-preto)",
          }}
        >
          Turbante Imbondeiro<br />em cera de carnaúba
        </div>
        <div>
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--af-cinza)]">
            finalizar compra
          </span>
          <h1 className="af-display text-[28px] mt-2">
            Turbante Imbondeiro · médio
          </h1>
          <p className="font-mono text-[12px] text-[var(--af-cinza)] mt-1">
            vendido por · Atelier Aruanda (Salvador/BA)
          </p>
          <div className="af-display text-[38px] mt-4">
            R$ 189
            <span className="text-[14px] text-[var(--af-cinza)] ml-2 font-mono">
              ,00 à vista no pix
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <PayOption
              icon="P"
              title="Pix à vista"
              right="R$ 189,00"
            />
            <PayOption
              icon="A"
              iconBg="var(--af-preto)"
              iconColor="var(--af-dourado)"
              title="Pagar com AceitoFiado"
              badge="novo"
              right="R$ 198,45 em 30d"
              subtitle="30 dias · sem cartão · só pra MEI afro"
              selected
            />
            <PayOption icon="C" title="Cartão" right="até 3x sem juros" />
          </div>

          <button
            disabled={loading}
            onClick={handlePagar}
            className="w-full mt-4 py-3.5 bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[10px] font-semibold text-[14px]"
          >
            {loading ? "abrindo checkout..." : "continuar com "}
            <span style={{ color: "var(--af-dourado)" }}>AceitoFiado</span> →
          </button>
          <p className="font-mono text-[10.5px] text-[var(--af-cinza)] text-center mt-2.5">
            powered by aceito.fiado · ssl · não consultamos serasa
          </p>
        </div>
      </div>
    </div>
  );
}

function PayOption({
  icon,
  iconBg,
  iconColor,
  title,
  badge,
  right,
  subtitle,
  selected,
}: {
  icon: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  badge?: string;
  right: string;
  subtitle?: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-[10px] cursor-pointer ${
        selected
          ? "border-2 border-[var(--af-dourado)] bg-[var(--af-dourado-soft)]"
          : "border border-[var(--af-borda)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center af-display text-[14px]"
          style={{
            background: iconBg ?? "var(--af-creme-2)",
            color: iconColor ?? "var(--af-preto)",
          }}
        >
          {icon}
        </div>
        <div>
          <div className="font-semibold text-[13px]">
            {title}
            {badge && (
              <span
                className="ml-2 px-1.5 py-[2px] rounded text-[9px] font-mono tracking-wider uppercase"
                style={{
                  background: "var(--af-dourado)",
                  color: "var(--af-preto)",
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="font-mono text-[10.5px] text-[var(--af-cinza)]">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="font-mono text-[11px] text-[var(--af-cinza)]">
        {right}
      </div>
    </div>
  );
}
