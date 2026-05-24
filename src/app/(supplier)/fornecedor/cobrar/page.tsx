// src/app/(supplier)/fornecedor/cobrar/page.tsx
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";

import { CobrarForm } from "./cobrar-form";

export default async function CobrarPage() {
  const user = await requireSupplier();

  const supplier = await db.supplierProfile.findUnique({
    where: { id: user.supplierId },
    select: { id: true, businessName: true },
  });

  if (!supplier) {
    throw new Error("supplier não encontrado");
  }

  return (
    <CobrarForm
      supplierId={supplier.id}
      supplierName={supplier.businessName}
    />
  );
}
