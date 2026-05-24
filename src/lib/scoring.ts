// Engine de underwriting V0
//
// Regra:
//   score = 0.30 × normalizado(faturamento_mensal_mediano) +
//           0.20 × normalizado(tempo_de_atividade_meses) +
//           0.20 × normalizado(diversidade_de_canais) +
//           0.15 × normalizado(estabilidade_de_fluxo) +
//           0.15 × normalizado(histórico_com_fornecedor)
//
//   Aprovação se score ≥ 0.6
//   Limite = clamp(faturamento_mediano × 0.4 × multiplicador_score, R$ 1k, R$ 60k)
//
// Sem ML: regra de negócio auditável.

export type ScoringInputs = {
  monthlyRevenueCents: bigint; // mediana dos últimos 3-6 meses
  monthsActive: number; // tempo de atividade
  channelsCount: number; // canais conectados (Pix, marketplace, etc.)
  cashflowStabilityScore: number; // 0..1, calculado de transações Pix
  supplierHistoryScore: number; // 0..1, baseado em operações passadas
};

export type ScoringResult = {
  score: number; // 0..1
  approved: boolean;
  approvedLimitCents: bigint;
  factors: Array<{
    key: keyof ScoringInputs;
    label: string;
    weight: number;
    rawValue: number | string;
    normalizedValue: number; // 0..1
    contribution: number; // weight × normalizedValue
  }>;
  rationale: string;
};

const APPROVAL_THRESHOLD = 0.6;
const MIN_LIMIT_CENTS = 100_000n; // R$ 1.000
const MAX_LIMIT_CENTS = 6_000_000n; // R$ 60.000

const WEIGHTS = {
  monthlyRevenueCents: 0.3,
  monthsActive: 0.2,
  channelsCount: 0.2,
  cashflowStabilityScore: 0.15,
  supplierHistoryScore: 0.15,
} as const;

function normalizeRevenue(cents: bigint): number {
  // R$ 5.000/mês ≈ 0.5; R$ 50.000/mês ≈ 1.0; escala log
  const reais = Number(cents) / 100;
  if (reais <= 0) return 0;
  const score = Math.log10(reais + 1) / 5; // log10(50000) ≈ 4.7 → ~0.94
  return Math.min(1, Math.max(0, score));
}

function normalizeMonths(months: number): number {
  // 24 meses = 1.0; cresce sublinear
  return Math.min(1, Math.max(0, Math.sqrt(months / 24)));
}

function normalizeChannels(count: number): number {
  // 1 canal = 0.3; 4+ canais = 1.0
  if (count <= 0) return 0;
  if (count >= 4) return 1;
  return 0.3 + 0.233 * (count - 1);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function calculateScore(inputs: ScoringInputs): ScoringResult {
  const norm = {
    monthlyRevenueCents: normalizeRevenue(inputs.monthlyRevenueCents),
    monthsActive: normalizeMonths(inputs.monthsActive),
    channelsCount: normalizeChannels(inputs.channelsCount),
    cashflowStabilityScore: clamp01(inputs.cashflowStabilityScore),
    supplierHistoryScore: clamp01(inputs.supplierHistoryScore),
  };

  const score =
    WEIGHTS.monthlyRevenueCents * norm.monthlyRevenueCents +
    WEIGHTS.monthsActive * norm.monthsActive +
    WEIGHTS.channelsCount * norm.channelsCount +
    WEIGHTS.cashflowStabilityScore * norm.cashflowStabilityScore +
    WEIGHTS.supplierHistoryScore * norm.supplierHistoryScore;

  const approved = score >= APPROVAL_THRESHOLD;

  // Limite proporcional ao faturamento, modulado pelo score
  let limitCents: bigint = 0n;
  if (approved) {
    const baseLimit = (inputs.monthlyRevenueCents * 4n) / 10n; // 40% do faturamento
    const multiplier = BigInt(Math.round(score * 1000));
    const adjusted = (baseLimit * multiplier) / 1000n;
    limitCents = adjusted < MIN_LIMIT_CENTS
      ? MIN_LIMIT_CENTS
      : adjusted > MAX_LIMIT_CENTS
        ? MAX_LIMIT_CENTS
        : adjusted;
  }

  const factors: ScoringResult["factors"] = [
    {
      key: "monthlyRevenueCents",
      label: "Faturamento mensal mediano",
      weight: WEIGHTS.monthlyRevenueCents,
      rawValue: `R$ ${(Number(inputs.monthlyRevenueCents) / 100).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      )}`,
      normalizedValue: norm.monthlyRevenueCents,
      contribution: WEIGHTS.monthlyRevenueCents * norm.monthlyRevenueCents,
    },
    {
      key: "monthsActive",
      label: "Tempo de atividade",
      weight: WEIGHTS.monthsActive,
      rawValue: `${inputs.monthsActive} meses`,
      normalizedValue: norm.monthsActive,
      contribution: WEIGHTS.monthsActive * norm.monthsActive,
    },
    {
      key: "channelsCount",
      label: "Diversidade de canais",
      weight: WEIGHTS.channelsCount,
      rawValue: `${inputs.channelsCount} canais`,
      normalizedValue: norm.channelsCount,
      contribution: WEIGHTS.channelsCount * norm.channelsCount,
    },
    {
      key: "cashflowStabilityScore",
      label: "Estabilidade de fluxo",
      weight: WEIGHTS.cashflowStabilityScore,
      rawValue: `${(inputs.cashflowStabilityScore * 100).toFixed(0)}%`,
      normalizedValue: norm.cashflowStabilityScore,
      contribution:
        WEIGHTS.cashflowStabilityScore * norm.cashflowStabilityScore,
    },
    {
      key: "supplierHistoryScore",
      label: "Histórico com fornecedor",
      weight: WEIGHTS.supplierHistoryScore,
      rawValue:
        inputs.supplierHistoryScore > 0
          ? `${(inputs.supplierHistoryScore * 100).toFixed(0)}%`
          : "novo na rede",
      normalizedValue: norm.supplierHistoryScore,
      contribution: WEIGHTS.supplierHistoryScore * norm.supplierHistoryScore,
    },
  ];

  const rationale = approved
    ? `Aprovado com score ${(score * 100).toFixed(0)}%. ` +
      `Limite proporcional a 40% do faturamento mediano, modulado pelo score.`
    : `Não aprovado: score ${(score * 100).toFixed(0)}% abaixo do mínimo (${(
        APPROVAL_THRESHOLD * 100
      ).toFixed(0)}%). ` +
      `Conecte mais canais ou aguarde mais histórico de fluxo.`;

  return { score, approved, approvedLimitCents: limitCents, factors, rationale };
}

// Calcula estabilidade de fluxo a partir das transações Pix.
// Coeficiente de variação invertido: quanto mais estável o fluxo mensal, maior o score.
export function calculateCashflowStability(
  monthlyTotalsCents: bigint[],
): number {
  if (monthlyTotalsCents.length < 2) return 0.5;
  const values = monthlyTotalsCents.map((c) => Number(c));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // coeficiente de variação
  // CV de 0 = perfeito; CV ≥ 1 = caótico
  return Math.min(1, Math.max(0, 1 - cv));
}

export const SCORING_CONSTANTS = {
  APPROVAL_THRESHOLD,
  MIN_LIMIT_CENTS,
  MAX_LIMIT_CENTS,
  WEIGHTS,
} as const;
