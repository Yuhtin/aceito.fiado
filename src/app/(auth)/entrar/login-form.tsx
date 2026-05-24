"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction, type AuthFormState } from "@/app/(auth)/_actions";

const INITIAL: AuthFormState = { ok: false };

export function LoginForm({
  prefillEmail,
  nextUrl = "/app",
}: {
  prefillEmail?: string;
  nextUrl?: string;
}) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextUrl} />
      <Field
        label="e-mail"
        name="email"
        type="email"
        required
        defaultValue={prefillEmail ?? state.fields?.email ?? ""}
        placeholder="seu-email@exemplo.com.br"
        autoComplete="email"
      />
      <Field
        label="senha"
        name="password"
        type="password"
        required
        placeholder="••••••••"
        defaultValue={prefillEmail ? "aceito123" : ""}
        autoComplete="current-password"
      />
      {state.error && (
        <p
          className="af-body rounded-xl px-3.5 py-2.5 text-sm"
          style={{
            background: "oklch(0.485 0.175 30 / 0.08)",
            border: "1px solid oklch(0.485 0.175 30 / 0.3)",
            color: "oklch(0.485 0.175 30)",
          }}
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{
          background: "var(--af-preto)",
          color: "var(--af-branco)",
          fontFamily: "var(--af-sans)",
          letterSpacing: "0.01em",
        }}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "entrar →"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        className="af-eb"
        htmlFor={props.name}
        style={{ color: "var(--af-cinza)" }}
      >
        {label}
      </label>
      <input
        id={props.name}
        {...props}
        className="w-full rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none"
        style={{
          background: "var(--af-branco)",
          border: "1px solid var(--af-borda)",
          color: "var(--af-preto)",
          fontFamily: "var(--af-sans)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--af-dourado)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(212,160,23,0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--af-borda)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
