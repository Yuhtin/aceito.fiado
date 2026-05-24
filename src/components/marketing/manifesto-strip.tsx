// src/components/marketing/manifesto-strip.tsx
export function ManifestoStrip() {
  return (
    <div className="bg-[var(--af-dourado)] text-[var(--af-preto)] px-9 py-7 flex items-center justify-between gap-9 flex-wrap">
      <div
        className="af-display text-[24px] leading-[1.05]"
        style={{ maxWidth: 720 }}
      >
        Empreendedor preto recebe não 3x mais que branco no banco. Aqui a
        porta começa aberta.
      </div>
      <span className="af-display text-[28px]">→</span>
    </div>
  );
}
