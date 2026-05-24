// src/components/marketing/numbers-grid.tsx
const NUMBERS = [
  {
    label: "girados na rede",
    value: "R$ 4,2",
    unit: "M",
    gold: true,
  },
  { label: "MEIs afro aceitas", value: "1.847", unit: "" },
  { label: "lojistas parceiros", value: "312", unit: "" },
  { label: "consultas serasa", value: "0", unit: "" },
];

export function NumbersGrid() {
  return (
    <div className="bg-[var(--af-preto)] px-9 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5">
      {NUMBERS.map((n) => (
        <div key={n.label}>
          <div className="font-mono text-[10.5px] tracking-wider text-white/50 uppercase">
            {n.label}
          </div>
          <div
            className="af-display text-[48px] leading-none mt-3"
            style={{ color: n.gold ? "var(--af-dourado)" : "var(--af-branco)" }}
          >
            {n.value}
            {n.unit && (
              <span className="text-[22px] text-white/50 ml-1">{n.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
