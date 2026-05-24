import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";

import { AfCard, Eyebrow, Tag } from "@/components/af";
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

const CATEGORY_ACCENT: Record<string, string> = {
  TEXTIL: "var(--af-terra)",
  COSMETICOS: "var(--af-mata)",
  ALIMENTOS: "var(--af-dende)",
  BEBIDAS: "var(--af-cobre)",
  PAPELARIA: "var(--af-acafrao)",
  ACESSORIOS: "var(--af-terra-2)",
  CALCADOS: "var(--af-brasa)",
  BAZAR: "var(--af-mata-2)",
  OUTROS: "var(--af-ink-3)",
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
              background: "var(--af-paper)",
              border: "1px solid var(--af-ink-08)",
              fontSize: 13,
              boxShadow: "var(--af-shadow-card)",
            }}
          >
            <span style={{ color: "var(--af-ink-soft)" }}>seu limite</span>
            <span style={{ fontWeight: 600 }}>
              {formatBRL(score?.approvedLimitCents ?? 0n)}
            </span>
          </div>
        }
      />

      <div
        className="px-6 py-7 md:px-10 md:py-8 space-y-6"
        style={{ background: "var(--af-paper-2)" }}
      >
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2"
            style={{ color: "var(--af-ink-soft)" }}
          />
          <input
            placeholder="buscar fornecedor ou categoria"
            className="w-full rounded-xl px-10 py-3 text-sm"
            style={{
              background: "var(--af-paper)",
              border: "1px solid var(--af-ink-08)",
              fontFamily: "var(--af-sans)",
              color: "var(--af-ink)",
              outline: "none",
            }}
            disabled
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => {
            const accent = CATEGORY_ACCENT[s.category] ?? "var(--af-terra)";
            return (
              <Link
                key={s.id}
                href={`/app/fiado/${s.id}`}
                className="group block transition-transform hover:-translate-y-0.5"
              >
                <AfCard padding={0} radius={20} className="overflow-hidden h-full">
                  <div
                    className="relative h-32 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, oklch(0.93 0.012 72))`,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(currentColor 1.2px, transparent 1.2px)",
                        backgroundSize: "20px 20px",
                        color: "oklch(0.972 0.008 75 / 0.18)",
                      }}
                    />
                    <div
                      className="absolute left-5 bottom-4"
                      style={{
                        width: 56,
                        height: 56,
                        background: "var(--af-paper)",
                        color: accent,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--af-sans)",
                        fontSize: 22,
                        fontWeight: 600,
                        boxShadow: "var(--af-shadow-card)",
                      }}
                    >
                      {s.businessName.charAt(0)}
                    </div>
                    <Tag
                      color={accent}
                      className="absolute right-3 top-3"
                      style={{
                        background: "var(--af-paper)",
                        boxShadow: "var(--af-shadow-card)",
                      }}
                    >
                      {CATEGORY_LABEL[s.category] ?? s.category.toLowerCase()}
                    </Tag>
                  </div>
                  <div className="p-6">
                    <h3
                      className="af-h"
                      style={{
                        fontSize: 18,
                        color: "var(--af-ink-deep)",
                        margin: 0,
                      }}
                    >
                      {s.businessName}
                    </h3>
                    <p
                      className="af-mono"
                      style={{
                        fontSize: 11,
                        color: "var(--af-ink-soft)",
                        margin: "4px 0 0",
                      }}
                    >
                      {s.addressNeighborhood}, {s.addressCity}/{s.addressState}
                    </p>
                    <p
                      className="af-body text-pretty"
                      style={{
                        fontSize: 13.5,
                        color: "var(--af-ink-2)",
                        margin: "14px 0 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {s.description}
                    </p>
                    <div
                      className="mt-5 flex items-center justify-between pt-4"
                      style={{ borderTop: "1px solid var(--af-ink-08)" }}
                    >
                      <span
                        className="af-mono inline-flex items-center gap-1.5"
                        style={{ fontSize: 11, color: "var(--af-ink-soft)" }}
                      >
                        <Package className="size-3.5" />
                        {s._count.products} produtos
                        {s.products[0] && (
                          <>
                            {" "}· a partir de{" "}
                            <span style={{ color: "var(--af-ink)" }}>
                              {formatBRL(s.products[0].priceCents)}
                            </span>
                          </>
                        )}
                      </span>
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        style={{ color: "var(--af-ink-soft)" }}
                      />
                    </div>
                  </div>
                </AfCard>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
