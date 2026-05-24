// Wrapper de alto nível pro motor de crédito.
//
// Estratégia:
// 1. Tenta o motor portado (src/lib/credit-engine/service.ts) — regras
//    ponderadas + Pluggy opcional + travas determinísticas.
// 2. Se falhar (timeout, erro, env Pluggy ausente E o motor lançar), cai pro
//    cálculo legado em lib/scoring.ts (regra simples local).
//
// Output normalizado pra UI/persistência consumir sem se importar qual rolou.

import "server-only";

import {
  calculateCashflowStability,
  calculateScore,
  type ScoringInputs,
} from "@/lib/scoring";

import { CreditScoreService } from "./service";
import type {
  CreditDecision,
  CreditScoreInput,
  RecommendedLimit,
  RiskLevel,
  ConfidenceLevel,
  ScoreEngineResult,
} from "./types";

export interface CadastroAnalysisInput {
  user: {
    name: string;
    cpf: string;
    cnpj: string;
    birthDate: string; // YYYY-MM-DD
    declaredBusinessActivity: string;
    city: string;
    state: string;
    hasCadUnico: boolean;
    monthsOperating: number;
  };
  channels: Array<{ type: string; monthlyRevenueCents: number }>;
  pluggyItemId?: string;
  // O que ela quer pedir de fiado inicial (define faixa testada pelo motor)
  initialCreditRequest?: {
    amount?: 200 | 400 | 600 | 800;
    termDays?: number;
    supplierCategory?: string;
    intendedUse?: string;
  };
}

export interface CadastroAnalysisResult {
  engine: "motor" | "fallback-local";
  engineVersion: string;
  decision: CreditDecision;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  recommendedLimitCents: bigint;
  suggestedFeePercent: number;
  scoreFinal: number; // 0-1000 (motor) ou 0-100 normalizado pra mesma escala
  usedOpenFinance: boolean;
  positiveFactors: string[];
  attentionFactors: string[];
  userExplanation: string;
  raw: {
    input: CadastroAnalysisInput;
    motorResult?: ScoreEngineResult;
  };
}

const TIMEOUT_MS = 8000;

function deriveDeclaredMonthlyRevenue(channels: CadastroAnalysisInput["channels"]): number {
  // Motor espera valor em reais, nossa storage em cents
  const totalCents = channels.reduce((s, c) => s + c.monthlyRevenueCents, 0);
  return Math.round(totalCents / 100);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("motor timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function runFallback(input: CadastroAnalysisInput): CadastroAnalysisResult {
  const totalCents = input.channels.reduce(
    (s, c) => s + c.monthlyRevenueCents,
    0,
  );
  const stability =
    input.channels.length >= 3
      ? 0.85
      : input.channels.length === 2
        ? 0.7
        : 0.55;
  const scoringInputs: ScoringInputs = {
    monthlyRevenueCents: BigInt(totalCents),
    monthsActive: input.user.monthsOperating,
    channelsCount: input.channels.length,
    cashflowStabilityScore: stability,
    supplierHistoryScore: 0,
  };
  void calculateCashflowStability; // silence unused import in dev
  const local = calculateScore(scoringInputs);

  return {
    engine: "fallback-local",
    engineVersion: "scoring.ts-v0",
    decision: local.approved ? "APPROVED" : "REJECTED",
    riskLevel: local.score >= 0.75 ? "BAIXO" : local.score >= 0.6 ? "MEDIO" : "ALTO",
    confidenceLevel: "BAIXA",
    recommendedLimitCents: local.approvedLimitCents,
    suggestedFeePercent: 5.0,
    scoreFinal: Math.round(local.score * 1000),
    usedOpenFinance: false,
    positiveFactors: local.approved
      ? ["Fluxo cross-channel detectado em múltiplos canais conectados"]
      : [],
    attentionFactors: local.approved
      ? []
      : ["Histórico insuficiente — conecte mais canais ou aguarde mais movimentação"],
    userExplanation: local.rationale,
    raw: { input },
  };
}

export async function analyzeCadastro(
  input: CadastroAnalysisInput,
): Promise<CadastroAnalysisResult> {
  const declaredMonthlyRevenue = deriveDeclaredMonthlyRevenue(input.channels);

  const motorInput: CreditScoreInput = {
    user: {
      name: input.user.name,
      cpf: input.user.cpf,
      cnpj: input.user.cnpj,
      birthDate: input.user.birthDate,
      declaredMonthlyRevenue,
      declaredBusinessActivity: input.user.declaredBusinessActivity,
      businessType: "MEI",
      city: input.user.city,
      state: input.user.state,
      hasCadUnico: input.user.hasCadUnico,
      monthsOperating: input.user.monthsOperating,
    },
    creditRequest: {
      requestedAmount: input.initialCreditRequest?.amount ?? 400,
      requestedTermDays: input.initialCreditRequest?.termDays ?? 30,
      supplierCategory: input.initialCreditRequest?.supplierCategory ?? "atacado",
      intendedUse:
        input.initialCreditRequest?.intendedUse ??
        "compra de insumos pra revenda no meu negócio",
    },
    openFinance: input.pluggyItemId
      ? { provider: "pluggy", itemId: input.pluggyItemId }
      : undefined,
  };

  try {
    const svc = new CreditScoreService();
    const motorResult = await withTimeout(svc.analyze(motorInput), TIMEOUT_MS);

    return {
      engine: "motor",
      engineVersion: motorResult.technicalMetadata.engineVersion,
      decision: motorResult.decision,
      riskLevel: motorResult.riskLevel,
      confidenceLevel: motorResult.confidenceLevel,
      // Motor retorna em reais (200, 400, 600, 800), nós persistimos cents
      recommendedLimitCents: BigInt(motorResult.recommendedLimit * 100),
      suggestedFeePercent: motorResult.suggestedOperationFeePercent,
      scoreFinal: motorResult.technicalMetadata.scoreFinal,
      usedOpenFinance: motorResult.technicalMetadata.usedOpenFinance,
      positiveFactors: motorResult.positiveFactors,
      attentionFactors: motorResult.attentionFactors,
      userExplanation: motorResult.userExplanation,
      raw: { input, motorResult },
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.warn(
      `[credit-engine] motor falhou, caindo pro fallback local: ${reason}`,
    );
    return runFallback(input);
  }
}
