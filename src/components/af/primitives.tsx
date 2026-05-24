import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Eyebrow ──────────────────────────────────────────────────────────
export function Eyebrow({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("af-eb", className)}
      style={{
        fontFamily: "var(--af-mono), ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: color ?? "var(--af-cinza)",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

// ─── Tag (pill colorida) ──────────────────────────────────────────────
export function Tag({
  children,
  color = "var(--af-dourado)",
  bg,
  light = true,
  className,
  style,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  light?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const background = bg || color;
  const bgStyle = light
    ? `color-mix(in oklch, ${background} 12%, transparent)`
    : background;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[12px] font-medium tracking-[-0.005em]",
        className,
      )}
      style={{
        background: bgStyle,
        color: light ? color : "var(--af-paper)",
        fontFamily: "var(--af-sans)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Card · Stripe-style ──────────────────────────────────────────────
export function AfCard({
  children,
  className,
  padding = 24,
  radius = 16,
  style,
}: {
  children: ReactNode;
  className?: string;
  padding?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("shadow-af-card transition-shadow", className)}
      style={{
        background: "var(--af-paper)",
        border: "1px solid var(--af-ink-08)",
        borderRadius: radius,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── AfButton — pill Stripe-style ─────────────────────────────────────
type Variant = "primary" | "accent" | "paper" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "xl" | "block";

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--af-dourado)",
    color: "var(--af-preto)",
    fontFamily: "var(--af-display), system-ui, sans-serif",
    textTransform: "uppercase" as const,
    letterSpacing: "0.01em",
    fontWeight: 400,
  },
  accent: {
    background: "var(--af-terra)",
    color: "var(--af-paper)",
    border: "1px solid var(--af-terra)",
  },
  paper: {
    background: "var(--af-paper)",
    color: "var(--af-ink)",
    border: "1px solid var(--af-paper)",
    boxShadow: "var(--af-shadow-button)",
  },
  ghost: {
    background: "transparent",
    color: "var(--af-ink)",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--af-ink)",
    border: "1px solid var(--af-ink-20)",
  },
};

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: "8px 14px", fontSize: 13, borderRadius: 99 },
  md: { padding: "10px 18px", fontSize: 14, borderRadius: 99 },
  lg: { padding: "14px 22px", fontSize: 15, borderRadius: 99 },
  xl: { padding: "16px 26px", fontSize: 16, borderRadius: 99 },
  block: {
    padding: "15px 22px",
    fontSize: 15,
    borderRadius: 12,
    width: "100%",
  },
};

export function AfButton({
  children,
  variant = "primary",
  size = "md",
  icon = "→",
  href,
  onClick,
  disabled,
  type = "button",
  className,
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode | false;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  style?: CSSProperties;
}) {
  const composed: CSSProperties = {
    ...VARIANTS[variant],
    ...SIZES[size],
    fontFamily: "var(--af-sans)",
    fontWeight: 500,
    letterSpacing: "-0.005em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: size === "block" ? "center" : "space-between",
    gap: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    ...style,
  };

  const inner = (
    <>
      <span>{children}</span>
      {icon && (
        <span style={{ opacity: 0.85, fontSize: "0.95em" }}>{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className} style={composed}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={composed}
    >
      {inner}
    </button>
  );
}

// ─── CodeBlock — terminal window faked como UI ────────────────────────
export function CodeBlock({
  title = "aceito.fiado",
  children,
  color = "var(--af-ink-deep)",
  className,
  style,
}: {
  title?: string;
  children: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("shadow-af-lift", className)}
      style={{
        background: color,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid oklch(0.972 0.008 75 / 0.06)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          borderBottom: "1px solid oklch(0.972 0.008 75 / 0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[
            "var(--af-brasa)",
            "var(--af-dende)",
            "var(--af-mata-2)",
          ].map((c) => (
            <span
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: c,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <span
          className="af-mono"
          style={{
            fontSize: 11,
            color: "oklch(0.972 0.008 75 / 0.55)",
            marginLeft: 6,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          padding: "16px 18px",
          fontFamily: "var(--af-mono)",
          fontSize: 12.5,
          lineHeight: 1.7,
          color: "oklch(0.972 0.008 75 / 0.85)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
