"use client";

import { LiveCounter } from "./motion";

// Wrapper client component que encapsula formatação BRL com Live ticking.
// Usado em Server Components que não podem passar a callback `format`.
export function BRLLive({
  initial,
  ratePerSec,
  jitter = 0.5,
}: {
  initial: number;
  ratePerSec: number;
  jitter?: number;
}) {
  return (
    <LiveCounter
      initial={initial}
      ratePerSec={ratePerSec}
      jitter={jitter}
      format={(v) => {
        const r = Math.floor(v);
        const c = Math.floor((v - r) * 100);
        return (
          <>
            {r.toLocaleString("pt-BR")}
            <span style={{ opacity: 0.4 }}>
              ,{String(c).padStart(2, "0")}
            </span>
          </>
        );
      }}
    />
  );
}
