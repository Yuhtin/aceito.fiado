// src/components/checkout/qr-display.tsx
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  payUrl: string;
  code: string;
  amountCents: number;
  prazoDays: number;
  entrepreneurName?: string;
  onConfirmed?: () => void;
  pollFor?: string; // code raw (sem hífens) pra GET status
}

export function QrDisplay({
  payUrl,
  code,
  amountCents,
  prazoDays,
  entrepreneurName,
  onConfirmed,
  pollFor,
}: Props) {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    QRCode.toString(payUrl, {
      type: "svg",
      color: { dark: "#0a0a0a", light: "#fafafa" },
      margin: 1,
      width: 220,
    }).then(setQrSvg);
  }, [payUrl]);

  useEffect(() => {
    if (!pollFor || confirmed) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/v1/checkout/${pollFor}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "CONFIRMED") {
        setConfirmed(true);
        clearInterval(id);
        onConfirmed?.();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [pollFor, confirmed, onConfirmed]);

  const amountFmt = `R$ ${(amountCents / 100)
    .toFixed(2)
    .replace(".", ",")}`;

  return (
    <div className="flex flex-col items-center text-center w-full">
      <p
        className="af-eb"
        style={{ color: "var(--af-dourado)" }}
      >
        {confirmed ? "fiado confirmado ✓" : "aguardando escaneio"}
      </p>
      <h2 className="af-display text-[24px] my-3 text-[var(--af-branco)]">
        {confirmed
          ? "Pode entregar a venda"
          : "Peça pra cliente apontar a câmera"}
      </h2>
      <div
        className="rounded-[14px] bg-[var(--af-branco)] p-4 mt-2 mb-5"
        style={{ width: 240, height: 240 }}
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p
        className="af-display text-[36px]"
        style={{ color: "var(--af-dourado)" }}
      >
        {amountFmt}
      </p>
      <p className="text-[13px] text-[var(--af-branco)]/80 mt-1.5">
        {entrepreneurName ? `${entrepreneurName} · ` : ""}prazo {prazoDays}d
      </p>
      <p
        className="font-mono text-[11px] mt-5"
        style={{ color: "rgba(250,250,250,0.5)" }}
      >
        aceitofiado.com/pay/{code}
      </p>
      <p
        className="font-mono text-[11px] mt-1"
        style={{ color: "var(--af-dourado)" }}
      >
        ▸ compartilhar no whatsapp
      </p>
    </div>
  );
}
