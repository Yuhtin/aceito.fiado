import { Package, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export default async function FornecedorProdutos() {
  const user = await requireSupplier();
  const products = await db.product.findMany({
    where: { supplierId: user.supplierId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Seus produtos"
        description="Itens disponíveis para compra a prazo via AceitoFiado."
      />
      <div className="px-6 py-6 md:px-10 md:py-8">
        <Card className="border-border/60 shadow-soft">
          <div className="divide-y divide-border/60">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Package className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    SKU {p.sku} · {p.stock} {p.unit} em estoque · mínimo {p.minQuantity}
                  </p>
                </div>
                <div className="hidden gap-1 text-xs md:flex md:items-center">
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {p._count.orderItems} venda{p._count.orderItems === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {formatBRL(p.priceCents)}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    /{p.unit}
                  </span>
                </p>
                <Badge
                  variant={p.active ? "outline" : "outline"}
                  className={
                    p.active
                      ? "border-success/30 bg-success/10 text-success text-[10px]"
                      : "border-border bg-muted text-muted-foreground text-[10px]"
                  }
                >
                  {p.active ? "ativo" : "inativo"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
