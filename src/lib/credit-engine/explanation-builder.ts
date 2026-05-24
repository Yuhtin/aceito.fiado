import type { CreditDecision, CreditFeatures, RecommendedLimit, RiskLevel } from './types';

export function buildPositiveFactors(features: CreditFeatures, usedOpenFinance: boolean): string[] {
  const factors: string[] = [];

  if (usedOpenFinance && features.incomeRecurrenceScore >= 70) {
    factors.push('Movimentacao financeira recorrente nos ultimos meses');
  }
  if (features.businessCoherenceScore >= 75) {
    factors.push('Atividade declarada compativel com alimentacao');
  }
  if (features.negativeBalanceFrequency <= 0.08) {
    factors.push('Baixa ocorrencia de saldo negativo');
  }
  if (features.registrationScore >= 75) {
    factors.push('Cadastro MEI consistente para a analise inicial');
  }
  if (features.productiveTransactionScore >= 70) {
    factors.push('Compras e movimentacoes compativeis com insumos produtivos');
  }

  return factors.length ? factors : ['Cadastro suficiente para uma primeira analise conservadora'];
}

export function buildAttentionFactors(features: CreditFeatures, usedOpenFinance: boolean): string[] {
  const factors: string[] = [];

  if (!usedOpenFinance) {
    factors.push('Analise feita sem dados de Open Finance');
  }
  if (features.openFinanceTransactionCount > 0 && features.openFinanceTransactionCount < 12) {
    factors.push('Historico bancario com poucas transacoes para analise');
  }
  if (features.monthlyAverageIncome === 0) {
    factors.push('Faturamento declarado ainda nao validado por movimentacao bancaria');
  }
  if (features.debtBurdenScore < 55) {
    factors.push('Compromissos financeiros podem pressionar o caixa');
  }
  if (features.requestedAmountAdequacyScore < 60) {
    factors.push('Valor solicitado alto em relacao ao fluxo financeiro estimado');
  }
  if (features.criticalFactors.length) {
    factors.push(...features.criticalFactors);
  }

  factors.push('Historico de credito produtivo na plataforma ainda inexistente');
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
    return `Neste momento nao conseguimos recomendar limite porque a finalidade informada nao parece estar ligada a insumos produtivos ou ha fatores criticos de risco. Voce pode revisar a finalidade da compra e tentar novamente com dados atualizados.`;
  }

  if (decision === 'MANUAL_REVIEW') {
    return `Sua solicitacao precisa de uma revisao manual antes da liberacao. Identificamos ${attentionFactors[0]?.toLowerCase() ?? 'pontos que precisam de confirmacao'} e queremos avaliar com cuidado antes de sugerir um limite justo.`;
  }

  const mainReasons = positiveFactors.slice(0, 3).join(', ').toLowerCase();
  const riskText = riskLevel === 'BAIXO' ? 'baixo risco no curto prazo' : riskLevel === 'MEDIO' ? 'risco moderado' : 'risco alto';

  return `Seu limite recomendado e de R$ ${recommendedLimit} porque identificamos ${mainReasons} e ${riskText}. Para aumentar seu limite, mantenha pagamentos em dia e concentre compras produtivas na plataforma.`;
}
