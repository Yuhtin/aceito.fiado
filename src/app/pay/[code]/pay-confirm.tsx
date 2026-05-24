"use client";

import { useState } from "react";

interface Props {
  data: {
    code: string;
    amount: number;
    feeCents: number;
    totalCents: number;
    prazo: number;
    items: Array<{ name: string; qty: number; priceCents: number }>;
    supplier: {
      businessName: string;
      addressNeighborhood: string;
      addressCity: string;
      addressState: string;
    } | null;
  };
  loggedIn: boolean;
}

export function PayConfirm({ data, loggedIn }: Props) {
  const [_step, _setStep] = useState<"confirm" | "auth" | "done">(
    loggedIn ? "confirm" : "auth",
  );
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-6 shadow-[var(--af-shadow-lift)]">
        <p className="af-eb">você vai comprar fiado</p>
        <h1 className="af-display text-[24px] mt-2 mb-4">
          Confirma a compra na {data.supplier?.businessName}?
        </h1>
        <p className="text-center af-display text-[56px] text-[var(--af-preto)]">
          R$ {(data.amount / 100).toFixed(2).replace(".", ",")}
        </p>
        <p className="text-center text-[var(--af-cinza)] text-sm mt-2">
          prazo {data.prazo} dias
        </p>
      </div>
    </div>
  );
}
