import { cn } from "@/lib/utils";

// Money — formato BRL com centavos atenuados, sufixo "R$" pequeno acima.
//
// Aceita centavos em number ou bigint pra evitar bug de precisão financeira.
export function Money({
  cents,
  size = 24,
  weight = 600,
  color,
  currency = true,
  opacity = 1,
  centsOpacity = 0.4,
  className,
}: {
  cents: number | bigint;
  size?: number;
  weight?: number;
  color?: string;
  currency?: boolean;
  opacity?: number;
  centsOpacity?: number;
  className?: string;
}) {
  const n = typeof cents === "bigint" ? cents : BigInt(Math.round(cents));
  const negative = n < 0n;
  const abs = negative ? -n : n;
  const reais = abs / 100n;
  const c = String(abs % 100n).padStart(2, "0");
  return (
    <span
      className={cn("af-n", className)}
      style={{ fontSize: size, color, fontWeight: weight, lineHeight: 0.98, opacity }}
    >
      {currency && (
        <span
          style={{
            fontSize: size * 0.48,
            marginRight: 4,
            verticalAlign: "0.22em",
            opacity: 0.55,
            fontWeight: 500,
            letterSpacing: 0,
          }}
        >
          R$
        </span>
      )}
      {negative && "−"}
      {reais.toLocaleString("pt-BR")}
      <span style={{ opacity: centsOpacity }}>,{c}</span>
    </span>
  );
}
