import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
  showText?: boolean;
}

export function Logo({
  size = 28,
  color = "var(--af-preto)",
  accent = "var(--af-dourado)",
  className,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        style={{
          width: size,
          height: size,
          background: accent,
          borderRadius: size * 0.22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--af-preto)",
          fontFamily: "var(--af-display), system-ui, sans-serif",
          fontSize: size * 0.62,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        A
      </div>
      {showText && (
        <span
          className="af-display"
          style={{
            color,
            fontSize: size * 0.78,
            lineHeight: 1,
          }}
        >
          AceitoFiado
        </span>
      )}
    </div>
  );
}

export { Logo as AfLogo };
