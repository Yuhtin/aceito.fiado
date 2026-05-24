import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "mono";
  size?: "sm" | "md" | "lg";
};

export function Logo({
  className,
  variant = "default",
  size = "md",
}: LogoProps) {
  const sizeClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <span
      className={cn(
        "font-display font-semibold tracking-tight inline-flex items-baseline gap-[0.06em]",
        sizeClass,
        className,
      )}
    >
      <span className={variant === "mono" ? "" : "text-foreground"}>
        Aceito
      </span>
      <span
        className={cn(
          "italic font-medium",
          variant === "mono" ? "" : "text-primary",
        )}
      >
        Fiado
      </span>
      <span
        aria-hidden
        className={cn(
          "h-[0.35em] w-[0.35em] rounded-full mb-[0.18em]",
          variant === "mono" ? "bg-current" : "bg-primary",
        )}
      />
    </span>
  );
}

export function LogoMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="M11 27V13.5C11 11 13 9 15.5 9H24.5C27 9 29 11 29 13.5V27"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="20" r="2.5" fill="white" />
      <path
        d="M11 24H29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
