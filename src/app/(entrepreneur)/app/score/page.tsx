import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  ShieldOff,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { requireEntrepreneur } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBRL, formatDate } from "@/lib/format";
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

  const inputs = snapshot.inputsJson as {
    factors?: Factor[];
  };
  const factors = inputs.factors ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Meu score"
        title="Por que seu limite é o que é"
        description="Sem caixa preta. Calculamos do que você fatura, em quantos canais e há quanto tempo. Sem consulta a Serasa."
      />

      <div className="grid gap-6 px-6 py-6 md:px-10 md:py-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {/* Score principal */}
          <Card className="overflow-hidden border-border/60 shadow-soft">
            <div className="grid gap-6 p-7 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-accent to-secondary text-primary">
                <div className="text-center">
                  <p className="font-display text-4xl font-medium tabular-nums">
                    {Math.round(snapshot.score * 100)}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    de 100
                  </p>
                </div>
              </div>
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 border-success/30 bg-success/10 text-success"
                >
                  Aprovada · acima de {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%
                </Badge>
                <h2 className="font-display text-2xl font-medium leading-tight">
                  Seu limite aprovado é{" "}
                  <span className="text-primary">
                    {formatBRL(snapshot.approvedLimitCents)}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  {snapshot.rationale}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Calculado em {formatDate(snapshot.calculatedAt, true)}
                </p>
              </div>
            </div>
          </Card>

          {/* Fatores */}
          <Card className="border-border/60 shadow-soft">
            <div className="px-6 pt-6 pb-3">
              <h2 className="font-display text-xl font-medium">
                Como cada sinal pesa
              </h2>
              <p className="text-sm text-muted-foreground">
                Cada fator vira um número entre 0 e 1, multiplicado pelo peso.
                Soma final = seu score.
              </p>
            </div>
            <Separator />
            <div className="divide-y divide-border/60">
              {factors.map((f) => {
                const contributionPct = f.contribution * 100;
                return (
                  <div key={f.key} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          peso {Math.round(f.weight * 100)}% · seu valor{" "}
                          <span className="text-foreground">{f.rawValue}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm tabular-nums">
                          +{contributionPct.toFixed(1)} pts
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          contribuiu
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={f.normalizedValue * 100}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-border/60 p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" /> Por que isso importa
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Algoritmos de score brasileiros usam{" "}
              <strong className="text-foreground">CEP</strong> como variável de
              poder preditivo. CEP correlaciona com raça. Conclusão: o algoritmo
              discrimina sem saber que discrimina.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Nosso underwriting{" "}
              <strong className="text-foreground">não consulta bureau</strong>.
              Não usa CEP. Usa o que você de fato move por mês.
            </p>
          </Card>

          <Card className="border-border/60 p-5 shadow-soft">
            <h3 className="font-display text-base font-medium">
              Como subir seu score
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Conecte mais canais</strong>{" "}
                  — diversidade de receita vira sinal de resiliência.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Construa histórico</strong>{" "}
                  — cada operação quitada melhora seu fator
                  &ldquo;histórico com fornecedor&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Estabilize o fluxo</strong>{" "}
                  — variação mensal alta puxa pra baixo. Constância importa.
                </span>
              </li>
            </ul>
          </Card>

          <Card className="border-dashed border-border p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ShieldOff className="size-3.5" /> O que não usamos
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>· CEP</li>
              <li>· Score do Serasa, SPC ou Quod</li>
              <li>· Dados de redes sociais inferidos</li>
              <li>· Renda do CPF</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
