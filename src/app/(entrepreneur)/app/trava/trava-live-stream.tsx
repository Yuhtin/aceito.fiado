"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, Lock, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBRL, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  entrepreneurId,
  initialReceivables,
  initialPix,
}: {
  entrepreneurId: string;
  initialReceivables: Receivable[];
  initialPix: PixTx[];
}) {
  const router = useRouter();
  const [receivables, setReceivables] = useState(initialReceivables);
  const [pix, setPix] = useState(initialPix);
  const [pending, startTransition] = useTransition();

  // Auto-refresh a cada 6s pra pegar novos Pix
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => router.refresh());
    }, 6000);
    return () => clearInterval(interval);
  }, [router]);

  // Sync com props quando server re-renderiza
  useEffect(() => {
    setReceivables(initialReceivables);
    setPix(initialPix);
  }, [initialReceivables, initialPix]);

  return (
    <div className="grid divide-y divide-border/60 md:grid-cols-2 md:divide-x md:divide-y-0">
      <div>
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Smartphone className="size-3" /> Pix recebidos
        </div>
        <ul className="max-h-[420px] divide-y divide-border/60 overflow-y-auto">
          <AnimatePresence initial={false}>
            {pix.map((p) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ArrowDownRight className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.payerName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.channelLabel} · {formatRelativeTime(p.receivedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums">
                    {formatBRL(BigInt(p.valueCents))}
                  </p>
                  {p.captured && (
                    <p className="font-mono text-[10px] text-primary tabular-nums">
                      → {formatBRL(BigInt(p.capturedAmountCents))} travados
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div>
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Lock className="size-3" /> Capturas pra duplicata
        </div>
        <ul className="max-h-[420px] divide-y divide-border/60 overflow-y-auto">
          <AnimatePresence initial={false}>
            {receivables.map((r) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, type: "spring", damping: 18 }}
                className="px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">
                    {r.supplierName}
                  </p>
                  <p className="font-mono text-sm font-semibold tabular-nums text-success">
                    +{formatBRL(BigInt(r.amountCapturedCents))}
                  </p>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="truncate">
                    Origem Pix de {r.payerName} ·{" "}
                    <span className="font-mono">{formatBRL(BigInt(r.pixValueCents))}</span>
                  </span>
                  <span>{formatRelativeTime(r.capturedAt)}</span>
                </div>
                {r.duplicata && (
                  <Badge
                    variant="outline"
                    className="mt-1.5 font-mono text-[10px]"
                  >
                    {r.duplicata}
                  </Badge>
                )}
              </motion.li>
            ))}
            {receivables.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                Nenhuma captura ainda.
              </p>
            )}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
