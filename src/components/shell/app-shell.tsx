import Link from "next/link";

import { AfLogo } from "@/components/af";
import { UserMenu } from "@/components/shell/user-menu";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
};

type AppShellProps = {
  user: AuthUser;
  nav: NavItem[];
  currentPath: string;
  variant?: "entrepreneur" | "supplier";
  children: React.ReactNode;
};

export function AppShell({
  user,
  nav,
  currentPath,
  variant = "entrepreneur",
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--af-paper-2)" }}>
      <aside
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col md:flex"
        style={{
          background: "var(--af-ink-deep)",
          color: "var(--af-paper)",
          borderRight: "1px solid oklch(0.972 0.008 75 / 0.06)",
        }}
      >
        <div className="flex items-center gap-2 px-5 py-6">
          <Link href={variant === "supplier" ? "/fornecedor" : "/app"}>
            <AfLogo
              size={22}
              color="var(--af-paper)"
              accent="var(--af-acafrao)"
            />
          </Link>
        </div>
        <div className="mt-2 px-3">
          <p
            className="px-2.5 text-[10px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "oklch(0.972 0.008 75 / 0.4)" }}
          >
            {variant === "supplier" ? "fornecedor" : "cockpit"}
          </p>
        </div>
        <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
          {nav.map((item) => {
            const isHome =
              item.href === "/app" || item.href === "/fornecedor";
            const active = isHome
              ? currentPath === item.href
              : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                )}
                style={{
                  background: active
                    ? "oklch(0.972 0.008 75 / 0.08)"
                    : "transparent",
                  color: active
                    ? "var(--af-paper)"
                    : "oklch(0.972 0.008 75 / 0.6)",
                }}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums"
                    style={{
                      background: active
                        ? "var(--af-terra)"
                        : "oklch(0.972 0.008 75 / 0.1)",
                      color: active
                        ? "var(--af-paper)"
                        : "var(--af-acafrao)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div
          className="p-3"
          style={{ borderTop: "1px solid oklch(0.972 0.008 75 / 0.06)" }}
        >
          <UserMenu user={user} variant="dark" />
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-col">
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
          style={{
            background: "var(--af-paper)",
            borderBottom: "1px solid var(--af-ink-08)",
          }}
        >
          <AfLogo size={20} />
          <UserMenu user={user} variant="light" compact />
        </header>

        <main className="flex w-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
