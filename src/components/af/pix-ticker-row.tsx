import { Money } from "./money";
import { PulseDot } from "./motion";

export type PixTickerRowProps = {
  payer: string;
  total: number | bigint;
  toSupplier: number | bigint;
  channel: string;
  time: string;
  isNew?: boolean;
  supplier?: string;
  dark?: boolean;
};

export function PixTickerRow({
  payer,
  total,
  toSupplier,
  channel,
  time,
  isNew = false,
  supplier,
  dark = false,
}: PixTickerRowProps) {
  const t = typeof total === "bigint" ? Number(total) : total;
  const tr = typeof toSupplier === "bigint" ? Number(toSupplier) : toSupplier;
  const supplierPct = t === 0 ? 0 : tr / t;
  const sub = dark ? "oklch(0.972 0.008 75 / 0.55)" : "var(--af-ink-soft)";
  const txt = dark ? "var(--af-paper)" : "var(--af-ink)";
  const sep = dark ? "oklch(0.972 0.008 75 / 0.08)" : "var(--af-ink-08)";
  return (
    <div
      style={{
        padding: "13px 16px",
        borderBottom: `1px solid ${sep}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        animation: isNew
          ? "af-tick-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)"
          : undefined,
        background: isNew ? "oklch(0.795 0.130 85 / 0.07)" : "transparent",
        transition: "background 1.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <PulseDot color="var(--af-mata-2)" size={6} />
          <div style={{ minWidth: 0 }}>
            <div
              className="af-body"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: txt,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {payer}
            </div>
            <div className="af-mono" style={{ fontSize: 10, color: sub }}>
              {channel} · {time}
            </div>
          </div>
        </div>
        <Money cents={total} size={14} weight={600} color={txt} />
      </div>
      <div
        style={{
          display: "flex",
          height: 4,
          borderRadius: 99,
          overflow: "hidden",
          background: dark
            ? "oklch(0.972 0.008 75 / 0.08)"
            : "var(--af-paper-3)",
        }}
      >
        <div
          style={{ width: `${supplierPct * 100}%`, background: "var(--af-terra)" }}
        />
        <div
          style={{
            width: `${(1 - supplierPct) * 100}%`,
            background: "var(--af-mata-2)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          className="af-mono"
          style={{ fontSize: 10, color: "var(--af-terra-2)" }}
        >
          {(supplierPct * 100).toFixed(0)}% → {supplier || "fornecedor"}
        </span>
        <span
          className="af-mono"
          style={{ fontSize: 10, color: "var(--af-mata-2)" }}
        >
          R$ {((t - tr) / 100).toFixed(2).replace(".", ",")} → você
        </span>
      </div>
    </div>
  );
}
