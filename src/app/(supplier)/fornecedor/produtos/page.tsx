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
        style={{ background: "var(--af-creme)" }}
      >
        {products.length === 0 && (
          <AfCard
            padding={40}
            radius={20}
            className="text-center"
            style={{ background: "var(--af-branco)" }}
          >
            <Package className="mx-auto size-8 mb-3" style={{ color: "var(--af-cinza-soft)" }} />
            <p className="af-body" style={{ color: "var(--af-cinza)" }}>
              nenhum produto cadastrado ainda.
            </p>
          </AfCard>
        )}

        {products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <AfCard
                key={p.id}
                padding={20}
                radius={18}
                style={{ background: "var(--af-branco)" }}
              >
                {/* icon + status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--af-creme-2)",
                      color: "var(--af-cinza)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Package className="size-5" />
                  </div>
                  <span
                    className="af-mono inline-flex items-center rounded-full px-2.5 py-0.5"
                    style={{
                      fontSize: 10,
                      background: p.active
                        ? "oklch(from var(--af-sucesso) l c h / 0.1)"
                        : "var(--af-creme-2)",
                      color: p.active ? "var(--af-sucesso)" : "var(--af-cinza)",
                      border: p.active
                        ? "1px solid oklch(from var(--af-sucesso) l c h / 0.25)"
                        : "1px solid var(--af-borda)",
                      letterSpacing: "0.06em",
                      fontWeight: 500,
                    }}
                  >
                    {p.active ? "ativo" : "inativo"}
                  </span>
                </div>

                {/* name + description */}
                <p
                  className="af-body truncate"
                  style={{ fontSize: 15, fontWeight: 600, color: "var(--af-preto)", margin: 0 }}
                >
                  {p.name}
                </p>
                {p.description && (
                  <p
                    className="af-body line-clamp-2 mt-1"
                    style={{ fontSize: 12.5, color: "var(--af-cinza)" }}
                  >
                    {p.description}
                  </p>
                )}

                {/* meta */}
                <p
                  className="af-mono mt-2"
                  style={{
                    fontSize: 10,
                    color: "var(--af-cinza-soft)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  SKU {p.sku} · {p.stock} {p.unit} em estoque · mín{" "}
                  {p.minQuantity}
                </p>

                {/* price + sales */}
                <div
                  className="mt-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--af-borda)", paddingTop: 12 }}
                >
                  <div>
                    <Money cents={p.priceCents} size={16} />
                    <p
                      className="af-mono"
                      style={{ fontSize: 10, color: "var(--af-cinza)", margin: "2px 0 0" }}
                    >
                      /{p.unit}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1.5"
                    style={{ color: "var(--af-cinza)" }}
                  >
                    <TrendingUp className="size-3.5" />
                    <span className="af-mono" style={{ fontSize: 11 }}>
                      {p._count.orderItems} venda
                      {p._count.orderItems === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </AfCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
