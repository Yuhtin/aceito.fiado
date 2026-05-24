import { redirect } from "next/navigation";
import { CheckCircle2, ShieldOff, Sparkles } from "lucide-react";

import {
  AfCard,
  Eyebrow,
  GradientMesh,
  Money,
  Tag,
} from "@/components/af";
import { PageHeader } from "@/components/shell/page-header";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SCORING_CONSTANTS } from "@/lib/scoring";

type Factor = {
  key: string;
  label: string;
  weight: number;
  rawValue: string;
  normalizedValue: number;
  contribution: number;
};

export default async function ScorePage() {
  const user = await requireEntrepreneur();
  const snapshot = await db.scoreSnapshot.findFirst({
    where: { entrepreneurId: user.entrepreneurId },
    orderBy: { calculatedAt: "desc" },
  });
  if (!snapshot) redirect("/app");

  const inputs = snapshot.inputsJson as { factors?: Factor[] };
  const factors = inputs.factors ?? [];

  return (
    <>
      <PageHeader
        eyebrow="meu score"
        title="por que seu limite é o que é"
        description="sem caixa preta. calculamos do que você fatura, em quantos canais e há quanto tempo. sem consulta a Serasa."
      />

      <div
        className="grid gap-6 px-6 py-7 md:px-10 md:py-8 lg:grid-cols-[1.4fr_1fr]"
        style={{ background: "var(--af-paper-2)" }}
      >
        <div className="space-y-5">
          {/* SCORE PRINCIPAL */}
          <GradientMesh
            className="overflow-hidden"
            style={{ borderRadius: 20 }}
          >
            <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
              <div
                className="flex size-32 items-center justify-center rounded-full"
                style={{
                  background: "var(--af-paper)",
                  border: "2px solid var(--af-terra)",
                  color: "var(--af-terra)",
                }}
              >
                <div className="text-center">
                  <p
                    className="af-n"
                    style={{
                      fontSize: 42,
                      lineHeight: 1,
                      color: "var(--af-ink-deep)",
                    }}
                  >
                    {Math.round(snapshot.score * 100)}
                  </p>
                  <p
                    className="af-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--af-ink-soft)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    de 100
                  </p>
                </div>
              </div>
              <div>
                <Tag color="var(--af-mata)">
                  aprovada · acima de{" "}
                  {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%
                </Tag>
                <h2
                  className="af-h-tight"
                  style={{
                    fontSize: 28,
                    margin: "12px 0 0",
                    color: "var(--af-ink-deep)",
                  }}
                >
                  seu limite aprovado é{" "}
                  <span style={{ color: "var(--af-terra)" }}>
                    <Money
                      cents={snapshot.approvedLimitCents}
                      size={28}
                      weight={600}
                      color="var(--af-terra)"
                    />
                  </span>
                </h2>
                <p
                  className="af-body text-pretty"
                  style={{
                    fontSize: 13.5,
                    color: "var(--af-ink-2)",
                    margin: "10px 0 0",
                  }}
                >
                  {snapshot.rationale}
                </p>
                <p
                  className="af-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--af-ink-soft)",
                    margin: "8px 0 0",
                  }}
                >
                  calculado em {formatDate(snapshot.calculatedAt, true)}
                </p>
              </div>
            </div>
          </GradientMesh>

          {/* FATORES */}
          <AfCard padding={0} radius={20} className="overflow-hidden">
            <div className="px-7 pt-6 pb-3">
              <Eyebrow>como cada sinal pesa</Eyebrow>
              <h2
                className="af-h"
                style={{
                  fontSize: 20,
                  margin: "8px 0 0",
                  color: "var(--af-ink-deep)",
                }}
              >
                cada fator vira número 0–1, multiplicado pelo peso
              </h2>
            </div>
            <div style={{ borderTop: "1px solid var(--af-ink-08)" }}>
              <div
                className="divide-y"
                style={{ borderColor: "var(--af-ink-08)" }}
              >
                {factors.map((f) => {
                  const contributionPct = f.contribution * 100;
                  return (
                    <div key={f.key} className="px-7 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p
                            className="af-body"
                            style={{ fontSize: 14, fontWeight: 500, margin: 0 }}
                          >
                            {f.label}
                          </p>
                          <p
                            className="af-mono"
                            style={{
                              fontSize: 11,
                              color: "var(--af-ink-soft)",
                              margin: "3px 0 0",
                            }}
                          >
                            peso {Math.round(f.weight * 100)}% · seu valor{" "}
                            <span style={{ color: "var(--af-ink)" }}>
                              {f.rawValue}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="af-n"
                            style={{
                              fontSize: 16,
                              color: "var(--af-mata)",
                              fontWeight: 600,
                            }}
                          >
                            +{contributionPct.toFixed(1)}
                          </p>
                          <p
                            className="af-mono"
                            style={{
                              fontSize: 10,
                              color: "var(--af-ink-soft)",
                              margin: "2px 0 0",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            pts
                          </p>
                        </div>
                      </div>
                      <div
                        className="mt-3 overflow-hidden rounded-full"
                        style={{
                          height: 4,
                          background: "var(--af-ink-08)",
                        }}
                      >
                        <div
                          style={{
                            width: `${f.normalizedValue * 100}%`,
                            height: "100%",
                            background: "var(--af-terra)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AfCard>
        </div>

        <div className="space-y-5">
          <AfCard padding={22} radius={18}>
            <div
              className="inline-flex items-center gap-1.5"
              style={{ color: "var(--af-terra)" }}
            >
              <Sparkles className="size-3.5" />
              <Eyebrow color="var(--af-terra)">por que isso importa</Eyebrow>
            </div>
            <p
              className="af-body"
              style={{
                fontSize: 13.5,
                color: "var(--af-ink-2)",
                margin: "12px 0 0",
                lineHeight: 1.55,
              }}
            >
              algoritmos de score brasileiros usam{" "}
              <strong style={{ color: "var(--af-ink)" }}>CEP</strong> como
              variável de poder preditivo. CEP correlaciona com raça.
              conclusão: o algoritmo discrimina sem saber que discrimina.
            </p>
            <p
              className="af-body"
              style={{
                fontSize: 13.5,
                color: "var(--af-ink-soft)",
                margin: "12px 0 0",
                lineHeight: 1.55,
              }}
            >
              nosso underwriting{" "}
              <strong style={{ color: "var(--af-ink)" }}>
                não consulta bureau
              </strong>
              . não usa CEP. usa o que você de fato move por mês.
            </p>
          </AfCard>

          <AfCard padding={22} radius={18}>
            <Eyebrow>como subir seu score</Eyebrow>
            <ul className="mt-4 space-y-3">
              {[
                [
                  "conecte mais canais",
                  "diversidade de receita vira sinal de resiliência.",
                ],
                [
                  "construa histórico",
                  "cada operação quitada melhora o fator histórico com fornecedor.",
                ],
                [
                  "estabilize o fluxo",
                  "variação mensal alta puxa pra baixo. constância importa.",
                ],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="size-4 shrink-0 mt-0.5"
                    style={{ color: "var(--af-mata)" }}
                  />
                  <span
                    className="af-body"
                    style={{ fontSize: 13.5, color: "var(--af-ink-2)" }}
                  >
                    <strong style={{ color: "var(--af-ink)" }}>{t}</strong> —{" "}
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </AfCard>

          <AfCard
            padding={22}
            radius={18}
            style={{ border: "1px dashed var(--af-ink-12)" }}
          >
            <div
              className="inline-flex items-center gap-1.5"
              style={{ color: "var(--af-ink-soft)" }}
            >
              <ShieldOff className="size-3.5" />
              <Eyebrow>o que não usamos</Eyebrow>
            </div>
            <ul
              className="af-mono mt-3 space-y-1.5"
              style={{ fontSize: 12, color: "var(--af-ink-soft)" }}
            >
              <li>· CEP</li>
              <li>· score do Serasa, SPC ou Quod</li>
              <li>· dados de redes sociais inferidos</li>
              <li>· renda do CPF</li>
            </ul>
          </AfCard>
        </div>
      </div>
    </>
  );
}
