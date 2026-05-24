import type { CreditDecision, CreditFeatures, RecommendedLimit, RiskLevel } from './types';

export function buildPositiveFactors(features: CreditFeatures, usedOpenFinance: boolean): string[] {
  const factors: string[] = [];

  if (usedOpenFinance && features.incomeRecurrenceScore >= 70) {
    factors.push('Movimentação financeira recorrente nos últimos meses');
  }
  if (features.businessCoherenceScore >= 75) {
    factors.push('Atividade declarada compatível com o ramo informado');
  }
  if (features.negativeBalanceFrequency <= 0.08) {
    factors.push('Baixa ocorrência de saldo negativo');
  }
  if (features.registrationScore >= 75) {
    factors.push('Cadastro MEI consistente para a análise inicial');
  }
  if (features.productiveTransactionScore >= 70) {
    factors.push('Compras e movimentações compatíveis com insumos produtivos');
  }

  return factors.length ? factors : ['Cadastro suficiente para uma primeira análise conservadora'];
}

export function buildAttentionFactors(features: CreditFeatures, usedOpenFinance: boolean): string[] {
  const factors: string[] = [];

  if (!usedOpenFinance) {
    factors.push('Análise feita sem dados de Open Finance');
  }
  if (features.openFinanceTransactionCount > 0 && features.openFinanceTransactionCount < 12) {
    factors.push('Histórico bancário com poucas transações para análise');
  }
  if (features.monthlyAverageIncome === 0) {
    factors.push('Faturamento declarado ainda não validado por movimentação bancária');
  }
  if (features.debtBurdenScore < 55) {
    factors.push('Compromissos financeiros podem pressionar o caixa');
  }
  if (features.requestedAmountAdequacyScore < 60) {
    factors.push('Valor solicitado alto em relação ao fluxo financeiro estimado');
  }
  if (features.criticalFactors.length) {
    factors.push(...features.criticalFactors);
  }

  factors.push('Histórico de crédito produtivo na plataforma ainda inexistente');
  return [...new Set(factors)];
}

export function buildUserExplanation(params: {
  recommendedLimit: RecommendedLimit;
  decision: CreditDecision;
  riskLevel: RiskLevel;
  positiveFactors: string[];
  attentionFactors: string[];
}): string {
  const { recommendedLimit, decision, riskLevel, positiveFactors, attentionFactors } = params;

  if (decision === 'REJECTED') {
    return `Neste momento não conseguimos recomendar limite porque a finalidade informada não parece estar ligada a insumos produtivos ou há fatores críticos de risco. Você pode revisar a finalidade da compra e tentar novamente com dados atualizados.`;
  }

  if (decision === 'MANUAL_REVIEW') {
    return `Sua solicitação precisa de uma revisão manual antes da liberação. Identificamos ${attentionFactors[0]?.toLowerCase() ?? 'pontos que precisam de confirmação'} e queremos avaliar com cuidado antes de sugerir um limite justo.`;
  }

  const mainReasons = positiveFactors.slice(0, 3).join(', ').toLowerCase();
  const riskText = riskLevel === 'BAIXO' ? 'baixo risco no curto prazo' : riskLevel === 'MEDIO' ? 'risco moderado' : 'risco alto';

  return `Seu limite recomendado é de R$ ${recommendedLimit} porque identificamos ${mainReasons} e ${riskText}. Para aumentar seu limite, mantenha pagamentos em dia e concentre compras produtivas na plataforma.`;
}
