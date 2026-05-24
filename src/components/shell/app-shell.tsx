import Link from "next/link";

import { Logo, LogoMark } from "@/components/brand/logo";
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

export function AppShell({ user, nav, currentPath, variant = "entrepreneur", children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <LogoMark size={28} className="text-primary" />
          <Logo size="md" variant="mono" className="text-sidebar-foreground" />
        </div>
        <div className="mt-2 px-3">
          <p className="px-2.5 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
            {variant === "supplier" ? "Fornecedor" : "Cockpit"}
          </p>
        </div>
        <nav className="mt-1 flex flex-1 flex-col gap-0.5 px-3">
          {nav.map((item) => {
            const active = item.href === "/app" || item.href === "/fornecedor"
              ? currentPath === item.href
              : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-sidebar-accent text-sidebar-foreground/70",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <UserMenu user={user} variant="dark" />
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-col">
        {/* Top bar mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Logo size="sm" />
          <UserMenu user={user} variant="light" compact />
        </header>

        <main className="flex w-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
