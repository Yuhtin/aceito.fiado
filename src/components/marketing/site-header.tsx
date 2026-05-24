import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#como-funciona"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como funciona
          </Link>
          <Link
            href="/#para-fornecedores"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Para fornecedores
          </Link>
          <Link
            href="/#por-que"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Por quê
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cadastro">Quero capital de giro</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
