import { PulseDot } from "./motion";

export function ChannelChip({
  name,
  value,
  on = true,
  code,
  sub,
}: {
  name: string;
  value?: string;
  on?: boolean;
  code: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: on ? "var(--af-paper)" : "var(--af-paper-3)",
        border: `1px solid ${on ? "var(--af-ink-12)" : "var(--af-ink-08)"}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: on ? "var(--af-ink)" : "var(--af-ink-08)",
          color: on ? "var(--af-paper)" : "var(--af-ink-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--af-mono)",
          fontSize: 10.5,
          fontWeight: 600,
        }}
      >
        {code}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="af-body"
            style={{ fontSize: 13.5, fontWeight: 500 }}
          >
            {name}
          </span>
          {on && <PulseDot color="var(--af-mata-2)" size={5} />}
        </div>
        <div
          className="af-mono"
          style={{
            fontSize: 10.5,
            color: "var(--af-ink-soft)",
            marginTop: 2,
          }}
        >
          {sub || (on ? `contribui R$ ${value}` : "tocar para conectar")}
        </div>
      </div>
      {on ? (
        <span
          className="af-n"
          style={{
            fontSize: 13,
            color: "var(--af-mata)",
            fontWeight: 600,
          }}
        >
          +{value}
        </span>
      ) : (
        <span
          style={{ fontSize: 13, color: "var(--af-ink-soft)", fontWeight: 500 }}
        >
          conectar →
        </span>
      )}
    </div>
  );
}
