"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, Lock, Smartphone } from "lucide-react";

import { Money, PulseDot } from "@/components/af";
import { formatRelativeTime } from "@/lib/format";

type Receivable = {
  id: string;
  amountCapturedCents: string;
  capturedAt: string;
  payerName: string;
  pixValueCents: string;
  txid: string;
  supplierName: string;
  duplicata: string | null;
};

type PixTx = {
  id: string;
  payerName: string;
  valueCents: string;
  channelLabel: string;
  receivedAt: string;
  captured: boolean;
  capturedAmountCents: string;
};

export function TravaLiveStream({
  initialReceivables,
  initialPix,
}: {
  initialReceivables: Receivable[];
  initialPix: PixTx[];
}) {
  const router = useRouter();
  const [receivables, setReceivables] = useState(initialReceivables);
  const [pix, setPix] = useState(initialPix);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => router.refresh());
    }, 6000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    setReceivables(initialReceivables);
    setPix(initialPix);
  }, [initialReceivables, initialPix]);

  return (
    <div className="grid md:grid-cols-2">
      <div
        style={{
          borderRight: "1px solid var(--af-borda)",
        }}
        className="md:border-r"
      >
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            background: "var(--af-borda)",
            borderBottom: "1px solid var(--af-borda)",
          }}
        >
          <Smartphone
            className="size-3"
            style={{ color: "var(--af-cinza)" }}
          />
          <span
            className="af-mono"
            style={{
              fontSize: 10,
              color: "var(--af-cinza)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            pix recebidos
          </span>
          <span className="ml-auto">
            <PulseDot color="var(--af-sucesso)" size={5} />
          </span>
        </div>
        <ul className="max-h-[440px] overflow-y-auto divide-y" style={{ borderColor: "var(--af-borda)" }}>
          <AnimatePresence initial={false}>
            {pix.map((p) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "var(--af-borda)",
                    color: "var(--af-sucesso)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowDownRight className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="af-body truncate"
                    style={{ fontSize: 13, fontWeight: 500, margin: 0 }}
                  >
                    {p.payerName}
                  </p>
                  <p
                    className="af-mono truncate"
                    style={{
                      fontSize: 10,
                      color: "var(--af-cinza)",
                      margin: "2px 0 0",
                    }}
                  >
                    {p.channelLabel} · {formatRelativeTime(p.receivedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <Money cents={BigInt(p.valueCents)} size={13} weight={600} />
                  {p.captured && (
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--af-dourado)",
                        margin: "2px 0 0",
                      }}
                    >
                      → R${" "}
                      {(Number(p.capturedAmountCents) / 100)
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      travados
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div>
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            background: "var(--af-borda)",
            borderBottom: "1px solid var(--af-borda)",
          }}
        >
          <Lock
            className="size-3"
            style={{ color: "var(--af-cinza)" }}
          />
          <span
            className="af-mono"
            style={{
              fontSize: 10,
              color: "var(--af-cinza)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            capturas pra duplicata
          </span>
          <span className="ml-auto">
            <PulseDot color="var(--af-dourado)" size={5} />
          </span>
        </div>
        <ul className="max-h-[440px] overflow-y-auto divide-y" style={{ borderColor: "var(--af-borda)" }}>
          <AnimatePresence initial={false}>
            {receivables.map((r) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, type: "spring", damping: 18 }}
                className="px-5 py-3"
              >
                <div className="flex items-center justify-between">
                  <p
                    className="af-body truncate"
                    style={{ fontSize: 13, fontWeight: 500, margin: 0 }}
                  >
                    {r.supplierName}
                  </p>
                  <span
                    className="af-n"
                    style={{
                      fontSize: 13,
                      color: "var(--af-sucesso)",
                      fontWeight: 600,
                    }}
                  >
                    +R${" "}
                    {(Number(r.amountCapturedCents) / 100)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
                <div
                  className="mt-1 flex items-center justify-between gap-2"
                  style={{ color: "var(--af-cinza)" }}
                >
                  <span className="truncate text-[10.5px]">
                    origem Pix de {r.payerName} ·{" "}
                    <span className="af-mono">
                      R${" "}
                      {(Number(r.pixValueCents) / 100)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </span>
                  <span className="af-mono text-[10.5px]">
                    {formatRelativeTime(r.capturedAt)}
                  </span>
                </div>
                {r.duplicata && (
                  <span
                    className="af-mono mt-2 inline-block rounded-full px-2 py-0.5"
                    style={{
                      fontSize: 9.5,
                      background: "var(--af-borda)",
                      color: "var(--af-cinza)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {r.duplicata}
                  </span>
                )}
              </motion.li>
            ))}
            {receivables.length === 0 && (
              <p
                className="px-5 py-7 text-center text-xs"
                style={{ color: "var(--af-cinza)" }}
              >
                nenhuma captura ainda.
              </p>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
