import { headers } from "next/headers";

import { AppShell } from "@/components/shell/app-shell";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";

import { supplierNav } from "./_nav";

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSupplier();
  const hdrs = await headers();
  const currentPath = hdrs.get("x-pathname") ?? "/fornecedor";

  const pendingCount = await db.order.count({
    where: { supplierId: user.supplierId, status: "AWAITING_SUPPLIER" },
  });

  const navWithBadges = supplierNav.map((item) =>
    item.href === "/fornecedor/pedidos" && pendingCount > 0
      ? { ...item, badge: pendingCount }
      : item,
  );

  return (
    <AppShell
      user={user}
      nav={navWithBadges}
      currentPath={currentPath}
      variant="supplier"
    >
      {children}
    </AppShell>
  );
}
