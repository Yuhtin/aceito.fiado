import Link from "next/link";
import Image from "next/image";

import { AfLogo } from "@/components/af";

import { OnboardingFlow } from "./onboarding-flow";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=85&auto=format&fit=crop";

export default async function CadastroPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextUrl = params.next ?? "/app";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Left: onboarding form (wider) ── */}
      <div
        className="flex w-full flex-col lg:w-3/5 xl:w-2/3"
        style={{ background: "var(--af-creme)" }}
      >
        <div className="hidden px-10 py-7 lg:block">
          <Link href="/" className="inline-flex items-center gap-2">
            <AfLogo size={22} />
          </Link>
        </div>
        <div className="flex-1">
          <OnboardingFlow nextUrl={nextUrl} />
        </div>
      </div>

      {/* ── Right: brand pull (preto dramático + foto + manifesto) ── */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-2/5 xl:w-1/3"
        style={{ background: "var(--af-preto)" }}
      >
        {/* foto Joana fundo */}
        <div className="absolute inset-0">
          <Image
            src={HERO_PHOTO}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, 40vw"
            className="object-cover object-[center_30%]"
            style={{ filter: "grayscale(0.15) contrast(1.05)" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.65) 45%, rgba(10,10,10,0.95) 100%)",
            }}
          />
        </div>

        {/* topo */}
        <div className="relative z-10">
          <p
            className="af-eb"
            style={{ color: "rgba(250,250,250,0.6)" }}
          >
            aceito fiado · cadastro
          </p>
        </div>

        {/* meio: headline + receipt chip */}
        <div className="relative z-10 flex flex-col gap-9">
          <h2
            className="af-display"
            style={{
              fontSize: "clamp(40px, 4vw, 60px)",
              color: "var(--af-branco)",
              lineHeight: 0.95,
              maxWidth: 480,
            }}
          >
            seu limite começa{" "}
            <span style={{ color: "var(--af-dourado)" }}>aqui</span>.
          </h2>
          <p
            className="af-body"
            style={{
              fontSize: 16,
              color: "rgba(250,250,250,0.78)",
              maxWidth: 380,
              lineHeight: 1.55,
            }}
          >
            cinco minutos pra abrir sua conta. nenhum minuto consultando
            Serasa. o motor olha seu fluxo de verdade — Pix, marketplace,
            Open Finance se você quiser conectar.
          </p>

          <div
            className="inline-flex max-w-fit items-center gap-3 rounded-2xl px-4 py-3.5 shadow-2xl"
            style={{ background: "var(--af-branco)" }}
          >
            <div
              className="grid size-8 place-items-center rounded-md af-display text-[14px]"
              style={{
                background: "var(--af-preto)",
                color: "var(--af-dourado)",
              }}
            >
              ✓
            </div>
            <div>
              <p
                className="af-eb"
                style={{
                  color: "var(--af-cinza)",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                }}
              >
                joana, 34 · heliópolis/sp
              </p>
              <p
                className="af-display"
                style={{ fontSize: 18, color: "var(--af-preto)" }}
              >
                limite aprovado · R$ 600
              </p>
            </div>
          </div>
        </div>

        {/* baixo: manifesto strip + login link */}
        <div className="relative z-10 flex flex-col gap-5">
          <blockquote
            className="border-l-2 pl-4"
            style={{ borderColor: "var(--af-dourado)" }}
          >
            <p
              className="af-body"
              style={{
                fontSize: 13.5,
                color: "rgba(250,250,250,0.75)",
                fontStyle: "italic",
                lineHeight: 1.55,
              }}
            >
              "primeira vez que um banco — ou seja lá o que vocês são —
              olhou meu negócio antes de olhar meu CEP."
            </p>
            <footer
              className="af-mono mt-2"
              style={{
                fontSize: 10.5,
                color: "rgba(250,250,250,0.5)",
                letterSpacing: "0.06em",
              }}
            >
              — JOANA B. · ONDA PRETA BIQUÍNIS
            </footer>
          </blockquote>

          <p
            className="af-body"
            style={{ fontSize: 13, color: "rgba(250,250,250,0.65)" }}
          >
            já tem conta?{" "}
            <Link
              href={`/entrar${nextUrl !== "/app" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
              className="font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--af-dourado)" }}
            >
              entrar →
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
