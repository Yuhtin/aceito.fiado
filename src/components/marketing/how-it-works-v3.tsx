// src/components/marketing/how-it-works-v3.tsx
const COLS = [
  {
    tag: "você · lojista",
    tagBg: "var(--af-mata)",
    title: "Cobre fiado em 3 toques",
    steps: [
      "Cliente afro MEI chega na loja. Quer pagar fiado.",
      "Você abre o aceito.fiado, digita produtos e valor.",
      "Gera o QrCode. Cliente escaneia. Você recebe à vista.",
    ],
  },
  {
    tag: "cliente · MEI afro",
    tagBg: "var(--af-laranja)",
    title: "Pague no tempo da sua loja",
    steps: [
      "Achou a loja pelo nosso chatbot do WhatsApp.",
      "Escaneia o QrCode do lojista. Vê parcelas claras.",
      "Paga no vencimento. Sem cartão. Sem dívida-banco.",
    ],
  },
];

export function HowItWorksV3() {
  return (
    <div
      id="como"
      className="bg-[var(--af-creme)] px-9 py-20"
    >
      <div className="max-w-[1280px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-wider uppercase"
          style={{ color: "var(--af-laranja)" }}
        >
          como funciona
        </span>
        <h2
          className="af-display mt-3.5"
          style={{ fontSize: "clamp(36px, 5vw, 56px)", maxWidth: 720 }}
        >
          Dois lados,{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "var(--af-mata)",
              fontWeight: 800,
            }}
          >
            um fluxo
          </span>{" "}
          que cabe na palma da mão.
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-9">
          {COLS.map((col) => (
            <div
              key={col.title}
              className="bg-[var(--af-creme-2)] rounded-[14px] p-7 border border-[var(--af-borda)]"
            >
              <span
                className="inline-block px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase text-[var(--af-branco)]"
                style={{ background: col.tagBg }}
              >
                {col.tag}
              </span>
              <h3 className="af-display text-[22px] my-4">{col.title}</h3>
              {col.steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex gap-3 py-3 text-sm ${
                    i > 0 ? "border-t border-[var(--af-borda)]" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] text-[var(--af-cinza)] min-w-[22px]">
                    0{i + 1}
                  </span>
                  <span className="leading-[1.45]">{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
