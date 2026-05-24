import { Money } from "./money";

export function OperationCard({
  supplier,
  supplierType,
  amount,
  dueIn,
  pct,
  paid,
  total,
}: {
  supplier: string;
  supplierType: string;
  amount: number | bigint;
  dueIn: number;
  pct: number;
  paid: number | bigint;
  total: number | bigint;
}) {
  const p = typeof paid === "bigint" ? Number(paid) : paid;
  const t = typeof total === "bigint" ? Number(total) : total;
  const progress = t === 0 ? 0 : Math.min(1, p / t);
  return (
    <div
      style={{
        padding: 16,
        background: "var(--af-paper)",
        border: "1px solid var(--af-ink-08)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 11,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              background: "var(--af-ink)",
              color: "var(--af-paper)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--af-sans)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {supplier.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              className="af-body"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              {supplier}
            </div>
            <div
              className="af-mono"
              style={{
                fontSize: 10.5,
                color: "var(--af-ink-soft)",
                marginTop: 2,
              }}
            >
              {supplierType}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <Money cents={amount} size={15} weight={600} />
          <div
            className="af-mono"
            style={{
              fontSize: 10,
              color: "var(--af-ink-soft)",
              marginTop: 2,
            }}
          >
            vence em {dueIn}d
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            height: 4,
            background: "var(--af-ink-08)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "var(--af-mata-2)",
              borderRadius: 99,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 7,
          }}
        >
          <span
            className="af-mono"
            style={{ fontSize: 10.5, color: "var(--af-ink-soft)" }}
          >
            <span style={{ color: "var(--af-mata)", fontWeight: 600 }}>
              {(progress * 100).toFixed(0)}%
            </span>{" "}
            liquidado · trava {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
