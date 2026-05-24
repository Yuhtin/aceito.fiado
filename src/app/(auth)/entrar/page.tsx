import Link from "next/link";
import { redirect } from "next/navigation";

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
      <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-soft-lg backdrop-blur md:p-10">
        <h1 className="font-display text-3xl font-medium leading-tight">
          Entrar na sua conta
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Acesse o cockpit pra ver limite, operações e trava de recebíveis.
        </p>

        <LoginForm prefillEmail={demoEmail} />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Cadastre-se agora
          </Link>
        </div>
      </div>

      {/* Atalhos de demo */}
      <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-card/40 p-4 text-xs text-muted-foreground backdrop-blur">
        <p className="mb-2 font-semibold text-foreground">
          Contas de demonstração
        </p>
        <p className="leading-relaxed">
          Empreendedora:{" "}
          <code className="font-mono text-foreground">
            joana@ondapreta.com.br
          </code>
          {" · "}
          Fornecedor:{" "}
          <code className="font-mono text-foreground">
            compras@distropical.com.br
          </code>
          <br />
          Senha:{" "}
          <code className="font-mono text-foreground">aceito123</code>
        </p>
      </div>
    </div>
  );
}
