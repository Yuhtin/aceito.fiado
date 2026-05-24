import { headers } from "next/headers";

import { AppShell } from "@/components/shell/app-shell";
import { requireEntrepreneur } from "@/lib/auth";

import { entrepreneurNav } from "./_nav";

export default async function EntrepreneurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireEntrepreneur();
  const hdrs = await headers();
  const currentPath = hdrs.get("x-pathname") ?? "/app";

  return (
    <AppShell
      user={user}
      nav={entrepreneurNav}
      currentPath={currentPath}
      variant="entrepreneur"
    >
      {children}
    </AppShell>
  );
}
