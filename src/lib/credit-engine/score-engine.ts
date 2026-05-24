import { env } from './env';
import { clamp, round } from './utils/math';
import type {
  ConfidenceLevel,
  CreditDecision,
  CreditFeatures,
  CreditScoreInput,
  RecommendedLimit,
  RiskLevel,
  ScoreEngineResult
} from './types';
import { buildAttentionFactors, buildPositiveFactors, buildUserExplanation } from './explanation-builder';
import { ENGINE_VERSION, SCORE_WEIGHTS } from './score-rules';

const LIMITS: RecommendedLimit[] = [0, 200, 400, 600, 800];

function nearestAllowedLimit(value: number): RecommendedLimit {
  const eligible = LIMITS.filter((limit) => limit <= value);
  return (eligible.at(-1) ?? 0) as RecommendedLimit;
}

function reduceOneTier(limit: RecommendedLimit): RecommendedLimit {
  const index = LIMITS.indexOf(limit);
  return LIMITS[Math.max(0, index - 1)];
}

function riskFromScore(scoreFinal: number): RiskLevel {
  if (scoreFinal >= 750) return 'BAIXO';
  if (scoreFinal >= 550) return 'MEDIO';
  return 'ALTO';
}

function confidenceFromContext(usedOpenFinance: boolean, features: CreditFeatures): ConfidenceLevel {
  if (!usedOpenFinance) return 'BAIXA';
  if (features.openFinanceTransactionCount >= 20) return 'ALTA';
  return 'MEDIA';
}

function calculateBaseLimit(scoreFinal: number, requestedAmount: number, hasCriticalFactor: boolean): RecommendedLimit {
  if (scoreFinal < 350) return 0;
  if (scoreFinal < 500) return hasCriticalFactor ? 0 : 200;
  if (scoreFinal < 650) return requestedAmount >= 400 ? 400 : 200;
  if (scoreFinal < 800) return requestedAmount >= 600 ? 600 : 400;
  return requestedAmount >= 800 ? 800 : 600;
}

function calculateDecision(limit: RecommendedLimit, features: CreditFeatures): CreditDecision {
  if (features.intendedUseCoherenceScore < 20) return features.requestedAmountAdequacyScore < 40 ? 'REJECTED' : 'MANUAL_REVIEW';
  if (features.hasCriticalFactor && limit === 0) return 'MANUAL_REVIEW';
  if (limit === 0) return 'REJECTED';
  return 'APPROVED';
}

function calculateFeePercent(riskLevel: RiskLevel): number {
  const expectedLoss = riskLevel === 'BAIXO' ? 1.5 : riskLevel === 'MEDIO' ? 3.25 : 5.5;
  return round(
    env.pricing.costOfCapitalPercent +
      expectedLoss +
      env.pricing.operationalCostPercent +
      env.pricing.platformMarginPercent +
      env.pricing.safetyMarginPercent,
    2
  );
}

export function runScoreEngine(params: {
  input: CreditScoreInput;
  features: CreditFeatures;
  usedOpenFinance: boolean;
  pluggyWarnings?: string[];
}): ScoreEngineResult {
  const { input, features, usedOpenFinance, pluggyWarnings } = params;

  const scoreBreakdown = {
    cadastroScore: features.registrationScore * SCORE_WEIGHTS.registration,
    capacidadeFinanceiraScore: features.financialCapacityScore * SCORE_WEIGHTS.financialCapacity,
    estabilidadeCaixaScore: features.cashStabilityCompositeScore * SCORE_WEIGHTS.cashStability,
    comportamentoProdutivoScore: features.productiveBehaviorScore * SCORE_WEIGHTS.productiveBehavior,
    endividamentoScore: features.debtBurdenScore * SCORE_WEIGHTS.debtBurden,
    adequacaoSolicitacaoScore: features.requestAdequacyScore * SCORE_WEIGHTS.requestAdequacy
  };

  const score0a100 = round(Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0), 2);
  const scoreFinal = Math.round(score0a100 * 10);
  const riskLevel = riskFromScore(scoreFinal);
  const appliedRules: string[] = [];

  let recommendedLimit = calculateBaseLimit(scoreFinal, input.creditRequest.requestedAmount, features.hasCriticalFactor);

  const incomeCap =
    features.monthlyAverageIncome > 0
      ? nearestAllowedLimit(features.monthlyAverageIncome * 0.2)
      : usedOpenFinance
        ? 200
        : 400;
  if (recommendedLimit > incomeCap) {
    recommendedLimit = incomeCap;
    appliedRules.push('Limite travado em ate 20% da media de entradas mensais estimada');
  }

  if (!usedOpenFinance && recommendedLimit > 400) {
    recommendedLimit = 400;
    appliedRules.push('Sem Open Finance, limite inicial limitado a R$ 400');
  }

  if (features.debtBurdenScore < 45 && recommendedLimit > 0) {
    recommendedLimit = reduceOneTier(recommendedLimit);
    appliedRules.push('Limite reduzido por indicios de endividamento alto');
  }

  if (input.user.monthsOperating < 3) {
    if (recommendedLimit > 200) {
      recommendedLimit = 200;
    }
    appliedRules.push('Menos de 3 meses de operacao, limite limitado a R$ 200');
  }

  if (features.intendedUseCoherenceScore < 20) {
    recommendedLimit = 0;
    appliedRules.push('Finalidade nao produtiva exige rejeicao ou revisao manual');
  }

  recommendedLimit = clamp(recommendedLimit, 0, 800) as RecommendedLimit;

  const decision = calculateDecision(recommendedLimit, features);
  const confidenceLevel = confidenceFromContext(usedOpenFinance, features);
  const suggestedOperationFeePercent = calculateFeePercent(riskLevel);
  const positiveFactors = buildPositiveFactors(features, usedOpenFinance);
  const attentionFactors = buildAttentionFactors(features, usedOpenFinance);
  const userExplanation = buildUserExplanation({
    recommendedLimit,
    decision,
    riskLevel,
    positiveFactors,
    attentionFactors
  });

  return {
    recommendedLimit,
    suggestedOperationFeePercent,
    confidenceLevel,
    decision,
    riskLevel,
    positiveFactors,
    attentionFactors,
    userExplanation,
    technicalMetadata: {
      engineVersion: ENGINE_VERSION,
      usedOpenFinance,
      scoreFinal,
      score0a100,
      features,
      scoreBreakdown,
      appliedRules,
      pluggyWarnings
    }
  };
}
