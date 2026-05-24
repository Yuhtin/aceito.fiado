import Link from "next/link";
import { ArrowRight, Package, Search, Store } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  TEXTIL: "Têxtil & aviamentos",
  COSMETICOS: "Cosméticos",
  ALIMENTOS: "Alimentos",
  BEBIDAS: "Bebidas",
  PAPELARIA: "Papelaria",
  ACESSORIOS: "Acessórios",
  CALCADOS: "Calçados",
  BAZAR: "Bazar",
  OUTROS: "Outros",
};

export default async function FiadoPage() {
  const user = await requireEntrepreneur();

  const [suppliers, score] = await Promise.all([
    db.supplierProfile.findMany({
      orderBy: { businessName: "asc" },
      include: {
        _count: { select: { products: { where: { active: true } } } },
        products: {
          where: { active: true },
          orderBy: { priceCents: "asc" },
          take: 1,
          select: { priceCents: true },
        },
      },
    }),
    db.scoreSnapshot.findFirst({
      where: { entrepreneurId: user.entrepreneurId },
      orderBy: { calculatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Comprar fiado"
        title="Fornecedores da rede"
        description="Curados na cadeia afro. Todos aceitam fiado via AceitoFiado — você compra, eles recebem à vista."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-soft">
            <span className="text-muted-foreground">Seu limite</span>
            <span className="font-mono font-medium tabular-nums">
              {formatBRL(score?.approvedLimitCents ?? 0n)}
            </span>
          </div>
        }
      />

      <div className="px-6 py-6 md:px-10 md:py-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor ou categoria"
            className="pl-10"
            disabled
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card
              key={s.id}
              className="group flex flex-col overflow-hidden border-border/60 shadow-soft transition-all hover:shadow-soft-lg"
            >
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/30 to-secondary">
                <div className="absolute inset-0 pattern-dots text-primary/15" />
                <div className="absolute bottom-3 left-4 flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-soft">
                  <Store className="size-7" />
                </div>
                <Badge
                  variant="outline"
                  className="absolute right-3 top-3 border-card/40 bg-card/80 text-xs backdrop-blur"
                >
                  {CATEGORY_LABEL[s.category] ?? s.category}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h3 className="font-display text-lg font-medium leading-tight">
                    {s.businessName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {s.addressNeighborhood}, {s.addressCity}/{s.addressState}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground text-pretty">
                  {s.description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="size-3.5" />
                    {s._count.products} produtos
                    {s.products[0] && (
                      <span>
                        {" "}· a partir de{" "}
                        <span className="font-mono text-foreground">
                          {formatBRL(s.products[0].priceCents)}
                        </span>
                      </span>
                    )}
                  </div>
                  <Button asChild size="sm" variant="ghost" className="gap-1">
                    <Link href={`/app/fiado/${s.id}`}>
                      Ver <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
