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
