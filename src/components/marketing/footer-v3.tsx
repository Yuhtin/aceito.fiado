// src/components/marketing/footer-v3.tsx
import { Logo } from "@/components/brand/logo";

const COLS = [
  ["produto", ["Checkout presencial", "API marketplace", "Documentação", "Mudanças recentes"]],
  ["empresa", ["Manifesto", "Imprensa", "Carreira", "Contato"]],
  ["recursos", ["Documentação", "Status", "Termos", "Privacidade"]],
  ["social", ["Instagram", "LinkedIn", "Newsletter", "GitHub"]],
] as const;

export function FooterV3() {
  return (
    <footer className="bg-[var(--af-preto)] text-[var(--af-branco)] px-9 py-20 border-t border-white/8">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-[1.5fr_repeat(4,1fr)] gap-12">
          <div>
            <Logo color="var(--af-branco)" />
            <p
              className="text-[13.5px] text-white/60 mt-4 leading-[1.5]"
              style={{ maxWidth: 320 }}
            >
              Checkout pra MEI afro comprar fiado em lojistas parceiros e em
              marketplaces que integram nossa API. Construído de Heliópolis,
              Capão Redondo e Brasilândia.
            </p>
          </div>
          {COLS.map(([title, items]) => (
            <div key={title}>
              <div className="font-mono text-[11px] tracking-wider uppercase text-white/50">
                {title}
              </div>
              <div className="flex flex-col gap-2.5 mt-4">
                {items.map((it) => (
                  <span
                    key={it}
                    className="text-[14px] text-white/85 hover:text-[var(--af-dourado)] cursor-pointer"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-7 border-t border-white/10 flex justify-between items-center flex-wrap gap-3 font-mono text-[11px] text-white/50">
          <span>
            aceito.fiado · Tecnologia LTDA · CNPJ XX.XXX.XXX/0001-XX · v0.5
          </span>
          <span>© 2026 · São Paulo</span>
        </div>
      </div>
    </footer>
  );
}
