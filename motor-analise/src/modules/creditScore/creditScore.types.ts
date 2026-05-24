import type { NormalizedOpenFinanceData } from '../pluggy/pluggy.types.js';

export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';
export type ConfidenceLevel = 'ALTA' | 'MEDIA' | 'BAIXA';
export type CreditDecision = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
export type RecommendedLimit = 0 | 200 | 400 | 600 | 800;

export type CreditScoreUser = {
  name: string;
  cpf: string;
  cnpj: string;
  birthDate: string;
  declaredMonthlyRevenue: number;
  declaredBusinessActivity: string;
  businessType: string;
  city: string;
  state: string;
  hasCadUnico?: boolean;
  monthsOperating: number;
};

export type CreditRequest = {
  requestedAmount: number;
  requestedTermDays: number;
  supplierCategory: string;
  intendedUse: string;
};

export type CreditScoreInput = {
  user: CreditScoreUser;
  creditRequest: CreditRequest;
  openFinance?: {
    provider?: 'pluggy';
    itemId?: string;
  };
};

export type CreditFeatures = {
  monthlyAverageIncome: number;
  incomeRecurrenceScore: number;
  cashFlowStabilityScore: number;
  negativeBalanceFrequency: number;
  productiveTransactionScore: number;
  debtBurdenScore: number;
  businessCoherenceScore: number;
  requestedAmountAdequacyScore: number;
  intendedUseCoherenceScore: number;
  registrationScore: number;
  financialCapacityScore: number;
  cashStabilityCompositeScore: number;
  productiveBehaviorScore: number;
  requestAdequacyScore: number;
  openFinanceTransactionCount: number;
  hasCriticalFactor: boolean;
  criticalFactors: string[];
};

export type ScoreEngineResult = {
  recommendedLimit: RecommendedLimit;
  suggestedOperationFeePercent: number;
  confidenceLevel: ConfidenceLevel;
  decision: CreditDecision;
  riskLevel: RiskLevel;
  positiveFactors: string[];
  attentionFactors: string[];
  userExplanation: string;
  technicalMetadata: {
    engineVersion: string;
    usedOpenFinance: boolean;
    scoreFinal: number;
    score0a100: number;
    features: CreditFeatures;
    scoreBreakdown: Record<string, number>;
    appliedRules: string[];
    pluggyWarnings?: string[];
  };
};

export type AnalyzeContext = {
  input: CreditScoreInput;
  openFinanceData?: NormalizedOpenFinanceData;
  usedOpenFinance: boolean;
  pluggyWarnings?: string[];
};
