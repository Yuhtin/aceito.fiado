import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
}

export function Logo({
  size = 22,
  color = "var(--af-preto)",
  accent = "var(--af-dourado)",
  className,
}: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      style={{
        fontFamily: "var(--af-sans), system-ui, sans-serif",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.035em",
        color,
      }}
    >
      aceito<span style={{ color: accent }}>.</span>fiado
    </span>
  );
}

export { Logo as AfLogo };
