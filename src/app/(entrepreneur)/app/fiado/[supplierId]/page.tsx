import Link from "next/link";
import { ArrowLeft, MapPin, Package, Store } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatCNPJ } from "@/lib/format";

import { CatalogShopper } from "./catalog-shopper";

const CATEGORY_LABEL: Record<string, string> = {
  TEXTIL: "Têxtil",
  COSMETICOS: "Cosméticos",
  ALIMENTOS: "Alimentos",
  BEBIDAS: "Bebidas",
  PAPELARIA: "Papelaria",
  ACESSORIOS: "Acessórios",
  CALCADOS: "Calçados",
  BAZAR: "Bazar",
  OUTROS: "Outros",
};

type Props = {
  params: Promise<{ supplierId: string }>;
};

export default async function SupplierCatalogPage({ params }: Props) {
  const { supplierId } = await params;
  const user = await requireEntrepreneur();

  const [supplier, score, activeOrders] = await Promise.all([
    db.supplierProfile.findUnique({
      where: { id: supplierId },
      include: {
        products: {
          where: { active: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    db.scoreSnapshot.findFirst({
      where: { entrepreneurId: user.entrepreneurId },
      orderBy: { calculatedAt: "desc" },
    }),
    db.order.findMany({
      where: {
        entrepreneurId: user.entrepreneurId,
        status: { in: ["ACTIVE", "FUNDED", "SUPPLIER_CONFIRMED", "AWAITING_SUPPLIER"] },
      },
      select: { supplierReceiveCents: true },
    }),
  ]);

  if (!supplier) notFound();

  const approvedLimit = score?.approvedLimitCents ?? 0n;
  const committedLimit = activeOrders.reduce(
    (acc, o) => acc + o.supplierReceiveCents,
    0n,
  );
  const availableLimit =
    approvedLimit > committedLimit ? approvedLimit - committedLimit : 0n;

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <Link
              href="/app/fiado"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="inline size-3" /> Fornecedores
            </Link>
          </span>
        }
        title={supplier.businessName}
        description={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Badge variant="outline" className="bg-accent text-accent-foreground">
              {CATEGORY_LABEL[supplier.category] ?? supplier.category}
            </Badge>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-3.5" /> {supplier.addressNeighborhood},{" "}
              {supplier.addressCity}/{supplier.addressState}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              CNPJ {formatCNPJ(supplier.cnpj)}
            </span>
          </span>
        }
      />

      <div className="border-b border-border bg-warm-gradient px-6 py-5 md:px-10">
        <p className="max-w-3xl text-sm text-muted-foreground text-pretty">
          {supplier.description}
        </p>
      </div>

      <CatalogShopper
        supplierId={supplier.id}
        supplierName={supplier.businessName}
        supplierDiscountBps={supplier.defaultDiscountBps}
        products={supplier.products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents.toString(),
          unit: p.unit,
          stock: p.stock,
          minQuantity: p.minQuantity,
        }))}
        availableLimitCents={availableLimit.toString()}
        approvedLimitCents={approvedLimit.toString()}
      />
    </>
  );
}
