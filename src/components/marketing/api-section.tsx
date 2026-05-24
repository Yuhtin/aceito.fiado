// src/components/marketing/api-section.tsx
import Link from "next/link";

const CODE = `import { aceitofiado } from "@aceito/sdk";

const checkout = await aceitofiado.checkout({
  amount: 18900,         // R$ 189,00
  items: [{ name: "Turbante Imbondeiro", qty: 1, priceCents: 18900 }],
  prazo: 30,             // dias
  cliente_cpf: cpf,
  success_url: "/obrigado",
  webhook_url: "/api/webhook",
});

// → marketplace redireciona pra checkout.payUrl
// → recebe webhook em "/api/webhook" quando MEI confirma`;

export function ApiSection() {
  return (
    <div id="api" className="bg-[var(--af-preto)] text-[var(--af-branco)] px-9 py-24">
      <div className="max-w-[1280px] mx-auto grid md:grid-cols-[1fr_1.2fr] gap-14 items-center">
        <div>
          <span
            className="font-mono text-[11px] tracking-wider uppercase"
            style={{ color: "var(--af-dourado)" }}
          >
            pra marketplaces
          </span>
          <h2
            className="af-display mt-3.5"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Pluga "Pagar com{" "}
            <span style={{ letterSpacing: "-0.04em" }}>
              aceito
              <span style={{ color: "var(--af-dourado)" }}>.</span>
              fiado
            </span>
            " no seu checkout.
          </h2>
          <p className="text-white/70 text-[15.5px] mt-5 leading-[1.55] max-w-md">
            SDK leve, ZDR (zero data retention), retorno via webhook. Compatível
            com qualquer stack — Node, Python, Ruby, Go.
          </p>
          <div className="flex gap-3.5 mt-7">
            <Link
              href="/demo-marketplace"
              className="px-5 py-3 rounded-[8px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[13.5px]"
            >
              ver demo viva →
            </Link>
            <Link
              href="/docs/api"
              className="px-5 py-3 rounded-[8px] border border-white/25 text-[13.5px] font-semibold"
            >
              docs da API
            </Link>
          </div>
        </div>
        <pre
          className="font-mono text-[12.5px] leading-[1.6] rounded-[14px] p-7 overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <code className="text-white/85">{CODE}</code>
        </pre>
      </div>
    </div>
  );
}
