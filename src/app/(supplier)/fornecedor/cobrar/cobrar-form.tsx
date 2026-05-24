// src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createCheckoutAction, type CobrarItem } from "./_actions";

interface Props {
  supplierId: string;
  supplierName: string;
}

export function CobrarForm({ supplierName }: Props) {
  const [items, setItems] = useState<CobrarItem[]>([]);
  const [cpf, setCpf] = useState("");
  const [prazo, setPrazo] = useState<number>(30);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    payUrl: string;
  } | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    const res = await createCheckoutAction({
      entrepreneurCpf: cpf || undefined,
      items,
      prazo,
    });
    setGenerating(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    toast.success("QrCode gerado");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-0 min-h-[calc(100vh-120px)]">
      <div className="p-8 bg-[var(--af-creme)]">
        <p className="af-eb">nova cobrança · {supplierName}</p>
        <h1 className="af-display text-[28px] mt-2 mb-6 text-[var(--af-preto)]">
          Quem é a cliente?
        </h1>
        <div className="mb-5">
          <label className="af-eb block mb-2">CPF ou nome da MEI (opcional)</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="132.456.789-90 · Joana Bezerra"
            className="w-full bg-[var(--af-branco)] border border-[var(--af-borda)] rounded-[8px] px-3.5 py-3 text-sm text-[var(--af-preto)]"
          />
          <p className="text-[11px] text-[var(--af-cinza)] mt-1.5 font-mono">
            se a cliente ainda não tem cadastro, ela cria no momento de pagar
          </p>
        </div>
        <p className="af-eb mb-2 mt-6">itens da venda</p>
        <div className="bg-[var(--af-branco)] rounded-[10px] overflow-hidden border border-[var(--af-borda)]">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center px-3.5 py-3 border-b border-[var(--af-borda)] last:border-b-0 text-[13.5px]"
            >
              <span className="flex-1">{item.name}</span>
              <span className="font-mono text-[12px] text-[var(--af-cinza)] mr-4">
                ×{item.qty}
              </span>
              <span className="af-display text-[18px]">
                R$ {(item.priceCents / 100).toFixed(2).replace(".", ",")}
              </span>
              <button
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="ml-3.5 text-[var(--af-cinza)]"
                aria-label="remover"
              >
                ×
              </button>
            </div>
          ))}
          <NewItemRow
            onAdd={(item) => setItems((prev) => [...prev, item])}
          />
        </div>
        <p className="af-eb mt-6 mb-2">prazo de pagamento</p>
        <div className="flex gap-2">
          {[15, 30, 45, 60].map((d) => (
            <button
              key={d}
              onClick={() => setPrazo(d)}
              className={`flex-1 text-center py-2.5 rounded-[8px] font-mono text-[13px] border ${
                prazo === d
                  ? "bg-[var(--af-preto)] text-[var(--af-branco)] border-[var(--af-preto)]"
                  : "bg-[var(--af-branco)] text-[var(--af-preto)] border-[var(--af-borda)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[10px] px-3.5 py-4">
          <span className="af-eb text-[var(--af-cinza-soft)]">Total fiado</span>
          <span className="af-display text-[28px]">
            R${" "}
            {(
              items.reduce((s, it) => s + it.priceCents * it.qty, 0) / 100
            )
              .toFixed(2)
              .replace(".", ",")}
          </span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || items.length === 0}
          className="w-full mt-4 p-3 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold disabled:opacity-40"
        >
          {generating ? "gerando..." : "gerar QrCode →"}
        </button>
      </div>
      <div className="bg-[var(--af-preto)] p-9 text-[var(--af-branco)] flex flex-col items-center justify-center text-center">
        {result ? (
          <p className="font-mono text-sm">{result.payUrl}</p>
        ) : (
          <p className="af-eb text-[var(--af-cinza-soft)]">
            preencha e gere o QrCode
          </p>
        )}
      </div>
    </div>
  );
}

function NewItemRow({
  onAdd,
}: {
  onAdd: (item: CobrarItem) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  const priceCents = Math.round(
    Number(price.replace(/[^\d,]/g, "").replace(",", ".")) * 100,
  );
  const canAdd = name.trim().length > 0 && qty > 0 && priceCents > 0;

  return (
    <div className="flex items-center gap-2 px-3.5 py-3 bg-[var(--af-creme)]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="nome do item"
        className="flex-1 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-12 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1 text-right font-mono"
        min={1}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="R$ 0,00"
        className="w-24 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1 text-right font-mono"
      />
      <button
        onClick={() => {
          if (!canAdd) return;
          onAdd({ name: name.trim(), qty, priceCents });
          setName("");
          setQty(1);
          setPrice("");
        }}
        disabled={!canAdd}
        className="text-[13px] font-medium text-[var(--af-dourado-dark)] disabled:opacity-30"
      >
        + add
      </button>
    </div>
  );
}
