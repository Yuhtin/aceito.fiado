import { Package, TrendingUp } from "lucide-react";

import { AfCard, Eyebrow, Money } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function FornecedorProdutos() {
  const user = await requireSupplier();
  const products = await db.product.findMany({
    where: { supplierId: user.supplierId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { orderItems: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="catálogo"
        title="seus produtos"
        description="itens disponíveis para compra a prazo via AceitoFiado."
      />
      <div
        className="px-6 py-7 md:px-10 md:py-8"
        style={{ background: "var(--af-paper-2)" }}
      >
        <AfCard padding={0} radius={20} className="overflow-hidden">
          <div
            className="divide-y"
            style={{ borderColor: "var(--af-ink-08)" }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-7 py-4"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "var(--af-paper-3)",
                    color: "var(--af-ink-soft)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="af-body truncate"
                    style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="af-body line-clamp-1"
                    style={{
                      fontSize: 12,
                      color: "var(--af-ink-soft)",
                      margin: "2px 0 0",
                    }}
                  >
                    {p.description}
                  </p>
                  <p
                    className="af-mono mt-1"
                    style={{
                      fontSize: 10,
                      color: "var(--af-ink-soft)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    SKU {p.sku} · {p.stock} {p.unit} em estoque · mín{" "}
                    {p.minQuantity}
                  </p>
                </div>
                <div
                  className="hidden md:flex items-center gap-1.5"
                  style={{ color: "var(--af-ink-soft)" }}
                >
                  <TrendingUp className="size-3.5" />
                  <span
                    className="af-mono"
                    style={{ fontSize: 11 }}
                  >
                    {p._count.orderItems} venda
                    {p._count.orderItems === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="text-right">
                  <Money cents={p.priceCents} size={14} />
                  <p
                    className="af-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--af-ink-soft)",
                      margin: "2px 0 0",
                    }}
                  >
                    /{p.unit}
                  </p>
                </div>
                <span
                  className="af-mono inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
                  style={{
                    fontSize: 10,
                    background: p.active
                      ? "oklch(0.420 0.085 155 / 0.1)"
                      : "var(--af-paper-3)",
                    color: p.active
                      ? "var(--af-mata)"
                      : "var(--af-ink-soft)",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  {p.active ? "ativo" : "inativo"}
                </span>
              </div>
            ))}
          </div>
        </AfCard>
      </div>
    </>
  );
}
