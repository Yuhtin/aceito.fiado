// src/components/marketing/hero-v3.tsx
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const PHOTO_URL =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=85&auto=format&fit=crop";

export function HeroV3() {
  return (
    <div className="bg-[var(--af-preto)] text-[var(--af-branco)]">
      {/* nav */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-white/5">
        <Logo color="var(--af-branco)" />
        <div className="hidden md:flex gap-7 text-[13.5px] text-white/70">
          <a href="#como">como funciona</a>
          <a href="#lojista">pra lojista</a>
          <a href="#mei">pra MEI</a>
          <a href="#api">API</a>
        </div>
        <Link
          href="/cadastro"
          className="text-[12px] px-4 py-2.5 rounded-[8px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold"
        >
          criar conta →
        </Link>
      </div>

      {/* hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
        <div className="p-12 lg:p-16 flex flex-col justify-between gap-9">
          <div>
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-wider border"
              style={{
                background: "rgba(212, 160, 23, 0.12)",
                borderColor: "rgba(212, 160, 23, 0.3)",
                color: "var(--af-dourado)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--af-dourado)" }}
              />
              aberto · 1.847 mei aceitos
            </span>
            <h1
              className="af-display mt-7"
              style={{
                fontSize: "clamp(54px, 7vw, 88px)",
                maxWidth: 580,
              }}
            >
              Banco te disse{" "}
              <span
                style={{
                  textDecoration: "line-through",
                  textDecorationThickness: 6,
                  textDecorationColor: "var(--af-dourado)",
                  opacity: 0.6,
                }}
              >
                não
              </span>
              <br />
              <span style={{ color: "var(--af-dourado)" }}>aqui</span> se aceita
              fiado.
            </h1>
            <p
              className="text-[17px] leading-[1.5] mt-6"
              style={{ color: "rgba(250,250,250,0.75)", maxWidth: 460 }}
            >
              Checkout pra lojista cobrar fiado de MEI preta. Você recebe à
              vista, ela paga no tempo dela, e a gente toma o risco. Sem
              Serasa, sem peneira, sem letrinha miúda.
            </p>
          </div>
          <div>
            <div className="flex gap-3.5">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[14px]"
              >
                criar conta →
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[10px] border border-white/25 text-[14px] font-semibold"
              >
                ▸ ver demo
              </a>
            </div>
            <p className="font-mono text-[11.5px] mt-4 text-white/45">
              grátis pra cadastrar · sem mensalidade · taxa só quando o fiado é pago
            </p>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-[var(--af-preto-soft)] to-[var(--af-preto)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${PHOTO_URL})`,
              filter: "grayscale(0.1) contrast(1.05)",
              backgroundPosition: "center 30%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, rgba(10,10,10,0.55) 0%, transparent 30%, transparent 45%, rgba(10,10,10,0.85) 75%, rgba(10,10,10,0.95) 100%)",
            }}
          />
          {/* Receipt floating */}
          <div
            className="absolute top-9 right-9 bg-[var(--af-branco)] text-[var(--af-preto)] rounded-[12px] px-5 py-4 min-w-[240px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="font-mono text-[10px] text-[var(--af-cinza)] tracking-wider uppercase">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                style={{ background: "var(--af-sucesso)" }}
              />
              fiado aprovado
            </div>
            <div className="af-display text-[36px] mt-2 leading-none">
              R$ 1.240
              <span className="text-[16px] text-[var(--af-cinza)]">,00</span>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-dashed border-black/10 font-mono text-[11px] text-[var(--af-cinza)]">
              <span>Joana B. → Onda Preta</span>
              <span>28d</span>
            </div>
          </div>
          {/* Quote — posicionado mais alto pra não competir com a roupa branca */}
          <div className="absolute bottom-24 lg:bottom-32 left-9 right-9 z-10">
            <div
              className="af-display text-[22px] leading-[1.08]"
              style={{
                maxWidth: 380,
                textShadow: "0 2px 24px rgba(10,10,10,0.6)",
              }}
            >
              "primeira vez<br />
              que{" "}
              <span style={{ color: "var(--af-dourado)" }}>crédito</span>
              <br />
              foi pra mim."
            </div>
            <div
              className="font-mono text-[11px] text-white/70 mt-3.5 tracking-wide"
              style={{ textShadow: "0 2px 16px rgba(10,10,10,0.6)" }}
            >
              JOANA BEZERRA · ONDA PRETA BIQUÍNIS · HELIÓPOLIS/SP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
