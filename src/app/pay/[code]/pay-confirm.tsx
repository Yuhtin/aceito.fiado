"use client";

import { useState } from "react";
import { toast } from "sonner";

import { confirmCheckoutAction } from "./_actions";

interface Item {
  name: string;
  qty: number;
  priceCents: number;
}

interface Props {
  data: {
    code: string;
    amount: number;
    feeCents: number;
    totalCents: number;
    prazo: number;
    items: Item[];
    supplier: {
      businessName: string;
      addressNeighborhood: string;
      addressCity: string;
      addressState: string;
    } | null;
  };
  loggedIn: boolean;
}

const BRL = (cents: number) =>
  `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

export function PayConfirm({ data, loggedIn }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ dueDate: string; total: number } | null>(
    null,
  );

  async function handleConfirm() {
    if (!loggedIn) {
      window.location.href = `/entrar?next=/pay/${data.code}`;
      return;
    }
    setSubmitting(true);
    const res = await confirmCheckoutAction(data.code);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDone({ dueDate: res.data.dueDate, total: res.data.totalCents });
  }

  if (done) {
    return <PaySuccess
      total={done.total}
      dueDate={done.dueDate}
      supplierName={data.supplier?.businessName ?? ""}
    />;
  }

  const dueDate = new Date(Date.now() + data.prazo * 86400000);
  const dueLabel = dueDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-6 shadow-[var(--af-shadow-lift)]">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-1.5 text-[14px] af-display">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ background: "var(--af-dourado)" }}
            />
            <span>AceitoFiado</span>
          </div>
          <span className="text-[var(--af-cinza)] text-lg">×</span>
        </div>

        <p className="af-eb">você vai comprar fiado</p>
        <h1 className="af-display text-[22px] leading-[1.05] mt-2 mb-5">
          Confirma a compra<br />
          na <span style={{ color: "var(--af-dourado)" }}>
            {data.supplier?.businessName ?? "loja"}
          </span>?
        </h1>

        <p className="text-center af-display text-[56px] text-[var(--af-preto)] leading-none">
          {BRL(data.amount).split(",")[0]}
          <span
            className="af-display"
            style={{ fontSize: 22, color: "var(--af-cinza)" }}
          >
            ,{BRL(data.amount).split(",")[1]}
          </span>
        </p>

        {data.supplier && (
          <div className="flex items-center gap-3 p-3 mt-4 bg-[var(--af-creme)] rounded-[10px]">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center af-display text-[16px]"
              style={{
                background: "var(--af-preto)",
                color: "var(--af-dourado)",
              }}
            >
              {data.supplier.businessName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-[12px]">
              <div className="font-semibold">
                {data.supplier.businessName}
              </div>
              <div className="text-[var(--af-cinza)] font-mono text-[10px] mt-0.5">
                {data.supplier.addressNeighborhood} ·{" "}
                {data.supplier.addressState.toLowerCase()} · {data.items.length}{" "}
                {data.items.length === 1 ? "item" : "itens"}
              </div>
            </div>
          </div>
        )}

        <div className="border border-[var(--af-borda)] rounded-[10px] p-3 mt-4 text-[12px]">
          {[
            ["Total da compra", BRL(data.amount)],
            ["Prazo", `${data.prazo} dias · ${dueLabel}`],
            ["Taxa AceitoFiado", BRL(data.feeCents)],
            ["Você paga", BRL(data.totalCents), true],
          ].map(([label, value, bold], i) => (
            <div
              key={i}
              className={`flex justify-between py-1.5 ${
                i < 3 ? "border-b border-dashed border-[var(--af-borda)]" : ""
              } ${bold ? "font-semibold" : ""}`}
            >
              <span>{label}</span>
              <span className="font-mono">{value}</span>
            </div>
          ))}
        </div>

        <button
          disabled={submitting}
          onClick={handleConfirm}
          className="w-full mt-4 py-3.5 bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[12px] font-semibold text-[14px] disabled:opacity-50"
        >
          {submitting
            ? "confirmando..."
            : loggedIn
            ? `confirmar e pagar em ${data.prazo}d`
            : "entrar pra confirmar"}
        </button>
        <p className="text-center font-mono text-[10px] text-[var(--af-cinza)] mt-3">
          não precisa cartão · sem consulta a bureau
        </p>
      </div>
    </div>
  );
}

function PaySuccess({
  total,
  dueDate,
  supplierName,
}: {
  total: number;
  dueDate: string;
  supplierName: string;
}) {
  const due = new Date(dueDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-8 shadow-[var(--af-shadow-lift)] text-center">
        <div
          className="w-[72px] h-[72px] rounded-full mx-auto mb-4 flex items-center justify-center af-display text-[36px]"
          style={{
            background: "var(--af-dourado)",
            color: "var(--af-preto)",
          }}
        >
          ✓
        </div>
        <h1 className="af-display text-[26px] mb-2">
          Fiado<br />aprovado.
        </h1>
        <p className="text-[var(--af-cinza)] text-sm max-w-[220px] mx-auto mb-5">
          A {supplierName} recebeu o valor agora. Você paga{" "}
          {BRL(total)} até {due}.
        </p>
        <div className="bg-[var(--af-creme)] rounded-[10px] p-3.5 text-left">
          <div className="af-eb">próximo passo</div>
          <div className="text-[13px] mt-1.5 leading-[1.4]">
            Acompanhe seus fiados em aberto em{" "}
            <a
              href="/app"
              style={{ color: "var(--af-dourado-dark)" }}
              className="font-semibold"
            >
              app.aceitofiado.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
