import { Package } from "lucide-react";

import { AfCard, Eyebrow } from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  TEXTIL: "têxtil & aviamentos",
  COSMETICOS: "cosméticos",
  ALIMENTOS: "alimentos",
  BEBIDAS: "bebidas",
  PAPELARIA: "papelaria",
  ACESSORIOS: "acessórios",
  CALCADOS: "calçados",
  BAZAR: "bazar",
  OUTROS: "outros",
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
        eyebrow="comprar fiado"
        title="fornecedores da rede"
        description="curados na cadeia afro. Todos aceitam fiado via AceitoFiado — você compra, eles recebem à vista."
        actions={
          <div
            className="af-mono"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--af-branco)",
              border: "1px solid var(--af-borda)",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--af-cinza)" }}>limite aprovado</span>
            <span style={{ fontWeight: 600, color: "var(--af-preto)" }}>
              {formatBRL(score?.approvedLimitCents ?? 0n)}
            </span>
          </div>
        }
      />

      <div
        className="px-6 py-7 md:px-10 md:py-8 space-y-6"
        style={{ background: "var(--af-creme-2)" }}
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <AfCard key={s.id} padding={0} radius={20} className="overflow-hidden h-full">
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid var(--af-borda)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--af-dourado-soft)",
                      color: "var(--af-dourado-dark)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--af-display)",
                      fontSize: 20,
                      fontWeight: 400,
                      flexShrink: 0,
                    }}
                  >
                    {s.businessName.charAt(0)}
                  </div>
                  <span
                    className="af-mono"
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 99,
                      background: "var(--af-creme)",
                      border: "1px solid var(--af-borda)",
                      color: "var(--af-cinza)",
                    }}
                  >
                    {CATEGORY_LABEL[s.category] ?? s.category.toLowerCase()}
                  </span>
                </div>
                <h3
                  className="af-display"
                  style={{
                    fontSize: 18,
                    color: "var(--af-preto)",
                    margin: "14px 0 0",
                  }}
                >
                  {s.businessName}
                </h3>
                <p
                  className="af-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--af-cinza)",
                    margin: "4px 0 0",
                  }}
                >
                  {s.addressNeighborhood}, {s.addressCity}/{s.addressState}
                </p>
                <p
                  className="af-body text-pretty"
                  style={{
                    fontSize: 13.5,
                    color: "var(--af-cinza)",
                    margin: "12px 0 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.description}
                </p>
              </div>
              <div
                className="flex items-center justify-between px-6 py-4"
              >
                <span
                  className="af-mono inline-flex items-center gap-1.5"
                  style={{ fontSize: 11, color: "var(--af-cinza)" }}
                >
                  <Package className="size-3.5" />
                  {s._count.products} produtos
                  {s.products[0] && (
                    <>
                      {" "}· a partir de{" "}
                      <span style={{ color: "var(--af-preto)", fontWeight: 600 }}>
                        {formatBRL(s.products[0].priceCents)}
                      </span>
                    </>
                  )}
                </span>
                <span
                  className="af-mono"
                  style={{
                    fontSize: 10,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: "var(--af-preto)",
                    color: "var(--af-creme)",
                  }}
                >
                  aceita fiado
                </span>
              </div>
            </AfCard>
          ))}
        </div>
      </div>
    </>
  );
}
