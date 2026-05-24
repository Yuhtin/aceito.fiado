// src/app/docs/api/page.tsx
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/checkout",
    desc: "Cria uma sessão de checkout fiado.",
    req: `{
  "amount": 18900,
  "items": [{ "name": "Turbante", "qty": 1, "priceCents": 18900 }],
  "prazo": 30,
  "supplierId": "<seu-id>",
  "marketplaceId": "feirapreta",
  "entrepreneurCpf": "13245678990",
  "successUrl": "https://loja.com/ok",
  "cancelUrl": "https://loja.com/cancel",
  "webhookUrl": "https://loja.com/api/webhook"
}`,
    res: `{
  "code": "AFXK-Q9M2-CX1Z",
  "payUrl": "https://aceitofiado.com/pay/AFXK-Q9M2-CX1Z",
  "expiresAt": "2026-05-24T15:30:00Z",
  "status": "PENDING"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/checkout/{code}",
    desc: "Consulta status e dados de uma sessão. Público (qualquer um com o code).",
    res: `{
  "code": "AFXK-Q9M2-CX1Z",
  "status": "PENDING",
  "amount": 18900,
  "feeCents": 945,
  "totalCents": 19845,
  "prazo": 30,
  "items": [...],
  "supplier": { "businessName": "Atelier Aruanda", ... }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/checkout/{code}/confirm",
    desc: "Confirma fiado. Requer MEI logada (cookie httpOnly).",
    res: `{
  "orderId": "ord_...",
  "status": "CONFIRMED",
  "dueDate": "2026-06-23T...",
  "totalCents": 19845,
  "successUrl": "https://loja.com/ok"
}`,
  },
];

export default function DocsApiPage() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)]">
      <div className="px-9 py-5 border-b border-[var(--af-borda)] flex justify-between items-center">
        <Logo />
        <Link
          href="/"
          className="font-mono text-[12px] text-[var(--af-cinza)]"
        >
          ← voltar pro site
        </Link>
      </div>
      <div className="max-w-[920px] mx-auto px-7 py-14">
        <span className="af-eb">docs · api v1</span>
        <h1 className="af-display text-[48px] mt-3 mb-3">
          AceitoFiado API
        </h1>
        <p className="text-[var(--af-cinza)] text-[15.5px] leading-[1.6] max-w-xl">
          Integre "Pagar com AceitoFiado" no seu marketplace. 3 endpoints,
          autenticação Bearer, retorno via webhook. Pt-BR. ZDR.
        </p>

        <h2 className="af-display text-[24px] mt-12 mb-3">autenticação</h2>
        <p className="text-sm leading-[1.6] mb-3">
          Todo request usa header{" "}
          <code className="bg-[var(--af-creme-2)] px-1.5 py-0.5 rounded font-mono text-[12px]">
            Authorization: Bearer &lt;sua-chave&gt;
          </code>
          . Chaves emitidas após cadastro em{" "}
          <Link href="/cadastro" className="underline">
            /cadastro
          </Link>
          .
        </p>

        <h2 className="af-display text-[24px] mt-12 mb-3">endpoints</h2>
        <div className="flex flex-col gap-7 mt-5">
          {ENDPOINTS.map((e) => (
            <div
              key={e.path}
              className="bg-[var(--af-branco)] border border-[var(--af-borda)] rounded-[12px] p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10.5px] px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    background:
                      e.method === "POST" ? "var(--af-dourado)" : "var(--af-mata)",
                    color:
                      e.method === "POST" ? "var(--af-preto)" : "var(--af-branco)",
                  }}
                >
                  {e.method}
                </span>
                <code className="font-mono text-[14px]">{e.path}</code>
              </div>
              <p className="text-sm text-[var(--af-cinza)] mt-3">{e.desc}</p>
              {e.req && (
                <>
                  <div className="font-mono text-[10.5px] tracking-wider uppercase text-[var(--af-cinza)] mt-4 mb-1">
                    request
                  </div>
                  <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
                    {e.req}
                  </pre>
                </>
              )}
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-[var(--af-cinza)] mt-4 mb-1">
                response 200
              </div>
              <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
                {e.res}
              </pre>
            </div>
          ))}
        </div>

        <h2 className="af-display text-[24px] mt-12 mb-3">webhook</h2>
        <p className="text-sm leading-[1.6] mb-3">
          Quando MEI confirma, fazemos{" "}
          <code className="bg-[var(--af-creme-2)] px-1.5 py-0.5 rounded font-mono text-[12px]">
            POST {`{webhookUrl}`}
          </code>{" "}
          com payload:
        </p>
        <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
{`{
  "code": "AFXK-Q9M2-CX1Z",
  "status": "CONFIRMED",
  "amount": 18900,
  "orderId": "ord_...",
  "confirmedAt": "2026-05-24T15:32:00Z"
}`}
        </pre>
      </div>
    </div>
  );
}
