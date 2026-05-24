import Link from "next/link";

import { AfButton, AfLogo } from "@/components/af";

export function TopNav({ dark = false }: { dark?: boolean }) {
  const fg = dark ? "var(--af-paper)" : "var(--af-ink)";
  const muted = dark
    ? "oklch(0.972 0.008 75 / 0.7)"
    : "var(--af-ink-soft)";
  return (
    <div className="flex items-center justify-between w-full px-14 py-5">
      <div className="flex items-center gap-14">
        <Link href="/">
          <AfLogo size={22} color={fg} />
        </Link>
        <nav className="hidden md:flex gap-7">
          {[
            ["produto", "/#produto"],
            ["como funciona", "/#como-funciona"],
            ["manifesto", "/#manifesto"],
            ["fornecedores", "/#fornecedores"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[14.5px] font-medium tracking-[-0.005em] inline-flex items-center gap-1 transition-opacity hover:opacity-100 opacity-90"
              style={{ color: muted }}
            >
              {label}
              <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/entrar"
          className="hidden md:inline-block text-[14.5px] font-medium"
          style={{ color: fg }}
        >
          entrar →
        </Link>
        <AfButton
          variant={dark ? "paper" : "primary"}
          size="sm"
          href="/cadastro"
        >
          conhecer o aceito
        </AfButton>
      </div>
    </div>
  );
}
