"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction, type AuthFormState } from "@/app/(auth)/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: AuthFormState = { ok: false };

export function LoginForm({ prefillEmail }: { prefillEmail?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={prefillEmail ?? state.fields?.email ?? ""}
          placeholder="seu-email@exemplo.com.br"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          defaultValue={prefillEmail ? "aceito123" : ""}
        />
      </div>
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
