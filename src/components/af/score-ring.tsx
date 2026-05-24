"use client";

import { Money } from "./money";
import { PulseDot } from "./motion";

export function ScoreRing({
  value,
  max,
  size = 200,
  stroke = 6,
  label = "limite aprovado",
  sub,
  status = "aprovado",
  accent = "var(--af-terra)",
  textColor = "var(--af-ink)",
  muted = "var(--af-ink-08)",
  subColor = "var(--af-ink-soft)",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  status?: string;
  accent?: string;
  textColor?: string;
  muted?: string;
  subColor?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = c * 0.78;
  const gap = c * 0.22;
  const pct = Math.min(1, Math.max(0, value / max));
  const filled = arc * pct;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-block",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(126deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={muted}
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${gap}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${c - filled}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        <span className="af-eb" style={{ marginBottom: 10, color: subColor }}>
          {label}
        </span>
        <Money cents={value * 100} size={size * 0.18} weight={600} color={textColor} />
        {sub && (
          <div
            className="af-mono"
            style={{
              fontSize: 10.5,
              color: subColor,
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        )}
        {status && (
          <div style={{ marginTop: 12 }}>
            <PulseDot color={accent} label={status} />
          </div>
        )}
      </div>
    </div>
  );
}
