import { AfLogo } from "@/components/af";
import { cn } from "@/lib/utils";

const SIZE_MAP = { sm: 18, md: 22, lg: 30 } as const;

export function Logo({
  className,
  variant = "default",
  size = "md",
}: {
  className?: string;
  variant?: "default" | "mono";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <AfLogo
      size={SIZE_MAP[size]}
      color={variant === "mono" ? "currentColor" : "var(--af-ink)"}
      accent={variant === "mono" ? "currentColor" : "var(--af-terra)"}
      className={cn(className)}
    />
  );
}

// LogoMark — placeholder pequeno (mantém API antiga, mas usa dot+letra)
export function LogoMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "var(--af-terra)",
        color: "var(--af-paper)",
        fontFamily: "var(--af-sans)",
        fontSize: size * 0.42,
        letterSpacing: "-0.04em",
      }}
      aria-hidden
    >
      af
    </div>
  );
}
