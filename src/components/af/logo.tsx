import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function AfLogo({
  size = 22,
  color = "var(--af-ink)",
  accent = "var(--af-terra)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      style={{
        fontFamily: "var(--af-sans)",
        fontWeight: 600,
        fontSize: size,
        color,
        letterSpacing: "-0.025em",
        gap: "0.06em",
        ...style,
      }}
    >
      <span>aceito</span>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 99,
          background: accent,
          margin: "0 1px",
          alignSelf: "flex-end",
          marginBottom: size * 0.18,
        }}
      />
      <span>fiado</span>
    </span>
  );
}
