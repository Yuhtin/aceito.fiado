import Link from "next/link";
import { redirect } from "next/navigation";

import { AfLogo } from "@/components/af";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ demo?: string; next?: string }>;
};

export default async function EntrarPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "SUPPLIER" ? "/fornecedor" : "/app");
  }
  const params = await searchParams;
  const demoEmail =
    params.demo === "joana"
      ? "joana@ondapreta.com.br"
      : params.demo === "tropical"
        ? "compras@distropical.com.br"
        : undefined;
  const nextUrl = params.next ?? "/app";

  return (
    <div className="flex min-h-screen lg:min-h-[calc(100vh-0px)]">
      {/* ── Left: form panel ── */}
      <div
        className="flex w-full flex-col lg:w-1/2"
        style={{ background: "var(--af-creme)" }}
      >
        {/* desktop logo */}
        <div className="hidden px-10 py-8 lg:block">
          <Link href="/" className="inline-flex items-center gap-2">
            <AfLogo size={22} />
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 pb-12 pt-8 lg:px-14 lg:pt-4">
          <div className="mx-auto w-full max-w-sm">
            <p
              className="af-eb mb-4"
              style={{ color: "var(--af-cinza)" }}
            >
              acesso à conta
            </p>
            <h1
              className="af-display"
              style={{
                fontSize: 42,
                color: "var(--af-preto)",
                marginBottom: 8,
              }}
            >
              bom ter você de volta.
            </h1>
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-cinza)",
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              acesse seu cockpit para ver limite, operações e trava de
              recebíveis.
            </p>

            <LoginForm prefillEmail={demoEmail} nextUrl={nextUrl} />

            <p
              className="af-body mt-8 text-center"
              style={{ fontSize: 14, color: "var(--af-cinza)" }}
            >
              não tem conta?{" "}
              <Link
                href={`/cadastro${nextUrl !== "/app" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: "var(--af-dourado)" }}
              >
                cadastre-se agora →
              </Link>
            </p>

            {/* demo accounts */}
            <div
              className="mt-8 rounded-2xl p-4"
              style={{
                background: "var(--af-branco)",
                border: "1px dashed var(--af-borda)",
              }}
            >
              <p className="af-eb" style={{ color: "var(--af-cinza)" }}>
                contas de demonstração
              </p>
              <div
                className="af-mono mt-2 space-y-1"
                style={{
                  fontSize: 11,
                  color: "var(--af-cinza-soft)",
                  lineHeight: 1.6,
                }}
              >
                <p>
                  empreendedora:{" "}
                  <span style={{ color: "var(--af-preto)" }}>
                    joana@ondapreta.com.br
                  </span>
                </p>
                <p>
                  fornecedor:{" "}
                  <span style={{ color: "var(--af-preto)" }}>
                    compras@distropical.com.br
                  </span>
                </p>
                <p>
                  senha:{" "}
                  <span style={{ color: "var(--af-dourado)" }}>aceito123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: brand panel (desktop only) ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-14 lg:flex lg:w-1/2"
        style={{ background: "var(--af-preto)" }}
      >
        {/* decorative corner accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 size-96 translate-x-1/3 -translate-y-1/3 rounded-full opacity-10"
          style={{ background: "var(--af-dourado)" }}
        />

        <div className="relative z-10">
          <p className="af-eb" style={{ color: "var(--af-cinza-soft)" }}>
            aceito fiado
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <h2
            className="af-display"
            style={{
              fontSize: 56,
              color: "var(--af-dourado)",
              lineHeight: 0.95,
              maxWidth: 420,
            }}
          >
            crédito que respeita quem construiu do zero.
          </h2>

          <p
            className="af-body"
            style={{
              fontSize: 15,
              color: "var(--af-cinza-soft)",
              maxWidth: 360,
              lineHeight: 1.65,
            }}
          >
            sem Serasa. sem CEP no algoritmo. seu histórico de recebimentos
            fala mais alto do que qualquer bureau convencional.
          </p>

          {/* manifesto quote */}
          <blockquote
            className="border-l-2 pl-4"
            style={{ borderColor: "var(--af-dourado)" }}
          >
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-cinza-soft)",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              "infraestrutura financeira pra cadeia afroempreendedora."
            </p>
          </blockquote>
        </div>

        {/* bottom stats strip */}
        <div
          className="relative z-10 grid grid-cols-3 gap-6 border-t pt-8"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {[
            { value: "R$ 0", label: "sem taxa de adesão" },
            { value: "48h", label: "aprovação em até" },
            { value: "100%", label: "baseado em recebimentos" },
          ].map((s) => (
            <div key={s.label}>
              <p
                className="af-display"
                style={{ fontSize: 28, color: "var(--af-dourado)" }}
              >
                {s.value}
              </p>
              <p
                className="af-eb mt-1"
                style={{ color: "var(--af-cinza-soft)", fontSize: 10 }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
