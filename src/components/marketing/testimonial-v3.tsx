// src/components/marketing/testimonial-v3.tsx
export function TestimonialV3() {
  return (
    <div className="bg-[var(--af-creme)] px-9 py-24">
      <div className="max-w-[1080px] mx-auto">
        <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--af-cinza)]">
          vozes
        </span>
        <blockquote
          className="af-display mt-5"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.15 }}
        >
          "Banco me disse não três vezes em 2024 sem motivo. Mês passado fechei
          o{" "}
          <span style={{ color: "var(--af-dourado)" }}>
            maior pedido da loja
          </span>{" "}
          e a AceitoFiado liquidou em 11 dias sem eu ter que ligar pra
          ninguém. É a primeira vez que crédito serviu pra mim."
        </blockquote>
        <div className="flex items-center gap-4 mt-8">
          <div
            className="w-12 h-12 rounded-full af-placeholder"
            aria-hidden
          />
          <div>
            <div className="font-semibold">Joice Oliveira</div>
            <div className="font-mono text-[12px] text-[var(--af-cinza)] mt-0.5">
              moda joice · capão redondo · sp · cliente desde out/2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
