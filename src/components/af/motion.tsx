"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ─── Counter — animação ease-out até `to` ────────────────────────────
export function Counter({
  to,
  duration = 1600,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => ReactNode;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setV(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  if (format) return <>{format(v)}</>;
  const display = decimals
    ? Number(v.toFixed(decimals)).toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
      })
    : Math.round(v).toLocaleString("pt-BR");
  return (
    <>
      {prefix}
      {display}
      {suffix}
    </>
  );
}

// ─── LiveCounter — acumula em tempo real ─────────────────────────────
export function LiveCounter({
  initial,
  ratePerSec,
  format,
  jitter = 0.5,
}: {
  initial: number;
  ratePerSec: number;
  format?: (v: number) => ReactNode;
  jitter?: number;
}) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    let last = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const noisy = ratePerSec * (1 + (Math.random() - 0.5) * jitter);
      setV((prev) => prev + noisy * dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ratePerSec, jitter]);
  return <>{format ? format(v) : Math.round(v)}</>;
}

// ─── PulseDot ─────────────────────────────────────────────────────────
export function PulseDot({
  color = "var(--af-mata-2)",
  size = 8,
  label,
  labelColor,
  className,
}: {
  color?: string;
  size?: number;
  label?: string;
  labelColor?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[7px]", className)}>
      <span
        className="relative inline-flex"
        style={{ width: size, height: size }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: color,
            opacity: 0.4,
            animation: "af-pulse 1.6s ease-in-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
        />
      </span>
      {label && (
        <span
          className="af-mono"
          style={{
            fontSize: 10,
            color: labelColor || color,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

// ─── SoundBars — equalizer ────────────────────────────────────────────
export function SoundBars({
  count = 5,
  color = "var(--af-acafrao)",
  height = 22,
  width = 3,
}: {
  count?: number;
  color?: string;
  height?: number;
  width?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-[2px]"
      style={{ height }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            width,
            background: color,
            borderRadius: 1,
            height: "100%",
            animation: `af-bar-grow ${0.6 + ((i * 7) % 5) * 0.1}s ease-in-out ${i * 0.13}s infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}

// ─── GradientMesh — wrapper com blobs que flutuam ────────────────────
type Blob = { c: string; x: string; y: string; anim: string; dur: number };

const LIGHT_BLOBS: Blob[] = [
  { c: "var(--af-acafrao)", x: "18%", y: "28%", anim: "af-drift-a", dur: 22 },
  { c: "var(--af-terra)",   x: "76%", y: "20%", anim: "af-drift-b", dur: 26 },
  { c: "var(--af-mata-2)",  x: "52%", y: "82%", anim: "af-drift-c", dur: 24 },
  { c: "var(--af-dende)",   x: "88%", y: "70%", anim: "af-drift-d", dur: 28 },
  { c: "var(--af-cobre)",   x: "10%", y: "78%", anim: "af-drift-e", dur: 30 },
];
const DARK_BLOBS: Blob[] = [
  { c: "var(--af-acafrao)", x: "18%", y: "30%", anim: "af-drift-a", dur: 22 },
  { c: "var(--af-terra)",   x: "78%", y: "22%", anim: "af-drift-b", dur: 26 },
  { c: "var(--af-mata-2)",  x: "52%", y: "78%", anim: "af-drift-c", dur: 24 },
  { c: "var(--af-dende)",   x: "88%", y: "75%", anim: "af-drift-d", dur: 28 },
  { c: "var(--af-cobre)",   x: "12%", y: "75%", anim: "af-drift-e", dur: 30 },
];

export function GradientMesh({
  children,
  dark = false,
  className,
  style,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const blobs = dark ? DARK_BLOBS : LIGHT_BLOBS;
  return (
    <div
      className={cn("af-mesh", dark && "af-mesh-dark", className)}
      style={style}
    >
      <div className="af-mesh-bg">
        {blobs.map((b, i) => (
          <span
            key={i}
            className="af-blob"
            style={{
              left: b.x,
              top: b.y,
              background: b.c,
              animation: `${b.anim} ${b.dur}s ease-in-out infinite alternate`,
              animationDelay: `${-i * 3}s`,
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

// ─── Ticker — barra horizontal infinita ──────────────────────────────
export function Ticker({
  items,
  speed = 50,
  separator = "·",
  color,
  sepColor,
  className,
}: {
  items: ReactNode[];
  speed?: number;
  separator?: string;
  color?: string;
  sepColor?: string;
  className?: string;
}) {
  const all = [...items, ...items];
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        className="inline-flex whitespace-nowrap gap-7"
        style={{
          animation: `af-ticker 60s linear infinite`,
          willChange: "transform",
          color,
        }}
      >
        {all.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-7">
            <span>{it}</span>
            <span style={{ color: sepColor || "currentColor", opacity: 0.35 }}>
              {separator}
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes af-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
