import Link from "next/link";
import { redirect } from "next/navigation";

import { AfCard, Eyebrow } from "@/components/af";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  searchParams: Promise<{ demo?: string }>;
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

  return (
    <div className="w-full max-w-md">
      <AfCard padding={36} radius={24} className="shadow-af-lift">
        <Eyebrow>entre na sua conta</Eyebrow>
        <h1
          className="af-h-tight"
          style={{
            fontSize: 32,
            margin: "10px 0 0",
            color: "var(--af-ink-deep)",
          }}
        >
          bom ter você de volta.
        </h1>
        <p
          className="af-body"
          style={{
            fontSize: 14,
            color: "var(--af-ink-soft)",
            margin: "6px 0 0",
          }}
        >
          acesse seu cockpit pra ver limite, operações e trava de recebíveis.
        </p>

        <LoginForm prefillEmail={demoEmail} />

        <div
          className="af-body mt-6 text-center"
          style={{ fontSize: 14, color: "var(--af-ink-soft)" }}
        >
          não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--af-terra)" }}
          >
            cadastre-se agora →
          </Link>
        </div>
      </AfCard>

      <div
        className="mt-5 rounded-2xl p-4"
        style={{
          background: "oklch(0.972 0.008 75 / 0.5)",
          border: "1px dashed var(--af-ink-12)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Eyebrow>contas de demonstração</Eyebrow>
        <div
          className="af-mono mt-2 space-y-1"
          style={{ fontSize: 11, color: "var(--af-ink-2)", lineHeight: 1.6 }}
        >
          <p>
            empreendedora:{" "}
            <span style={{ color: "var(--af-ink)" }}>
              joana@ondapreta.com.br
            </span>
          </p>
          <p>
            fornecedor:{" "}
            <span style={{ color: "var(--af-ink)" }}>
              compras@distropical.com.br
            </span>
          </p>
          <p>
            senha: <span style={{ color: "var(--af-terra)" }}>aceito123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
