// src/components/marketing/cta-final.tsx
import Link from "next/link";

export function CtaFinal() {
  return (
    <div className="bg-[var(--af-preto)] px-9 py-28 text-center">
      <div className="max-w-[1080px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-wider uppercase"
          style={{ color: "var(--af-dourado)" }}
        >
          comece em 90 segundos
        </span>
        <h2
          className="af-display mt-5 text-[var(--af-branco)]"
          style={{ fontSize: "clamp(48px, 7vw, 88px)" }}
        >
          Cobre fiado<br />
          <span style={{ color: "var(--af-dourado)" }}>sem peneira.</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link
            href="/cadastro"
            className="px-7 py-4 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[14px]"
          >
            criar conta →
          </Link>
          <Link
            href="/demo-marketplace"
            className="px-7 py-4 rounded-[10px] border border-white/25 text-[var(--af-branco)] font-semibold text-[14px]"
          >
            ▸ ver demo de 60s
          </Link>
        </div>
        <p className="font-mono text-[12px] text-white/45 mt-6">
          grátis · sem CNPJ · sem consulta a bureau · contrato em pt-br claro
        </p>
      </div>
    </div>
  );
}
