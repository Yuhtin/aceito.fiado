import type { CreditFeatures, CreditRequest, CreditScoreUser } from './creditScore.types.js';
import type { NormalizedOpenFinanceData, NormalizedTransaction } from '../pluggy/pluggy.types.js';
import { average, clamp, round, standardDeviation } from '../../utils/math.js';
import { isWithinDays, monthKey } from '../../utils/dates.js';
import { DEBT_TERMS, FOOD_ACTIVITY_TERMS, NON_PRODUCTIVE_TERMS, PRODUCTIVE_TERMS } from './scoreRules.js';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function containsAny(value: string, terms: string[]): boolean {
  const normalized = normalizeText(value);
  return terms.some((term) => normalized.includes(normalizeText(term)));
}

function recentTransactions(transactions: NormalizedTransaction[], days = 180): NormalizedTransaction[] {
  return transactions.filter((transaction) => isWithinDays(transaction.date, days));
}

export function calculateMonthlyAverageIncome(openFinanceData?: NormalizedOpenFinanceData): number {
  const credits = recentTransactions(openFinanceData?.transactions ?? [], 180).filter(
    (transaction) => transaction.type === 'CREDIT'
  );
  if (!credits.length) return 0;

  const incomeByMonth = new Map<string, number>();
  for (const transaction of credits) {
    const key = monthKey(transaction.date);
    incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + transaction.amount);
  }

  return round(average([...incomeByMonth.values()]), 2);
}

export function calculateIncomeRecurrenceScore(openFinanceData?: NormalizedOpenFinanceData): number {
  const credits = recentTransactions(openFinanceData?.transactions ?? [], 180).filter(
    (transaction) => transaction.type === 'CREDIT'
  );
  if (!credits.length) return 30;

  const months = new Set(credits.map((transaction) => monthKey(transaction.date))).size;
  const pixOrSales = credits.filter((transaction) =>
    containsAny(`${transaction.description} ${transaction.category ?? ''}`, ['pix', 'maquininha', 'venda', 'transfer'])
  ).length;

  const monthCoverageScore = clamp((months / 6) * 70, 0, 70);
  const salesPatternScore = clamp((pixOrSales / credits.length) * 30, 0, 30);
  return Math.round(monthCoverageScore + salesPatternScore);
}

export function calculateCashFlowStabilityScore(openFinanceData?: NormalizedOpenFinanceData): number {
  const balances = recentTransactions(openFinanceData?.transactions ?? [], 180)
    .map((transaction) => transaction.balance)
    .filter((balance): balance is number => typeof balance === 'number');

  if (balances.length < 4) return 50;

  const avgBalance = Math.abs(average(balances));
  const volatilityRatio = avgBalance === 0 ? 1 : standardDeviation(balances) / avgBalance;
  return Math.round(clamp(100 - volatilityRatio * 60, 20, 95));
}

export function calculateNegativeBalanceFrequency(openFinanceData?: NormalizedOpenFinanceData): number {
  const balances = recentTransactions(openFinanceData?.transactions ?? [], 180)
    .map((transaction) => transaction.balance)
    .filter((balance): balance is number => typeof balance === 'number');

  if (!balances.length) return 0;
  return round(balances.filter((balance) => balance < 0).length / balances.length, 4);
}

export function calculateProductiveTransactionScore(openFinanceData?: NormalizedOpenFinanceData): number {
  const debits = recentTransactions(openFinanceData?.transactions ?? [], 180).filter(
    (transaction) => transaction.type === 'DEBIT'
  );
  if (!debits.length) return 45;

  const productive = debits.filter((transaction) =>
    containsAny(`${transaction.description} ${transaction.category ?? ''}`, PRODUCTIVE_TERMS)
  );

  return Math.round(clamp((productive.length / debits.length) * 100 + Math.min(productive.length, 10), 30, 95));
}

export function calculateDebtBurdenScore(openFinanceData?: NormalizedOpenFinanceData): number {
  const transactions = recentTransactions(openFinanceData?.transactions ?? [], 180);
  const monthlyAverageIncome = calculateMonthlyAverageIncome(openFinanceData);
  const debtPayments = transactions
    .filter((transaction) => transaction.type === 'DEBIT')
    .filter((transaction) => containsAny(`${transaction.description} ${transaction.category ?? ''}`, DEBT_TERMS));

  const monthlyDebtEstimate = debtPayments.reduce((sum, transaction) => sum + transaction.amount, 0) / 6;
  const loanPressure = Math.min(openFinanceData?.loans?.length ?? 0, 3) * 10;

  if (monthlyAverageIncome <= 0) return clamp(75 - loanPressure, 25, 90);
  const burdenRatio = monthlyDebtEstimate / monthlyAverageIncome;
  return Math.round(clamp(100 - burdenRatio * 120 - loanPressure, 15, 95));
}

export function calculateBusinessCoherenceScore(
  user: CreditScoreUser,
  openFinanceData?: NormalizedOpenFinanceData
): number {
  const activityMatchesFood = containsAny(user.declaredBusinessActivity, FOOD_ACTIVITY_TERMS);
  const productiveScore = calculateProductiveTransactionScore(openFinanceData);
  const base = activityMatchesFood ? 70 : 45;
  return Math.round(clamp(base * 0.6 + productiveScore * 0.4, 20, 95));
}

export function calculateRequestedAmountAdequacyScore(
  creditRequest: CreditRequest,
  monthlyAverageIncome: number
): number {
  if (monthlyAverageIncome <= 0) return creditRequest.requestedAmount <= 200 ? 60 : 35;
  const ratio = creditRequest.requestedAmount / monthlyAverageIncome;
  if (ratio <= 0.1) return 95;
  if (ratio <= 0.2) return 82;
  if (ratio <= 0.3) return 55;
  return 25;
}

export function calculateIntendedUseCoherenceScore(creditRequest: CreditRequest): number {
  const text = `${creditRequest.intendedUse} ${creditRequest.supplierCategory}`;
  if (containsAny(text, NON_PRODUCTIVE_TERMS)) return 5;
  if (containsAny(text, PRODUCTIVE_TERMS)) return 92;
  return 45;
}

export function buildCreditFeatures(
  user: CreditScoreUser,
  creditRequest: CreditRequest,
  openFinanceData?: NormalizedOpenFinanceData
): CreditFeatures {
  const monthlyAverageIncome = calculateMonthlyAverageIncome(openFinanceData);
  const incomeRecurrenceScore = calculateIncomeRecurrenceScore(openFinanceData);
  const cashFlowStabilityScore = calculateCashFlowStabilityScore(openFinanceData);
  const negativeBalanceFrequency = calculateNegativeBalanceFrequency(openFinanceData);
  const productiveTransactionScore = calculateProductiveTransactionScore(openFinanceData);
  const debtBurdenScore = calculateDebtBurdenScore(openFinanceData);
  const businessCoherenceScore = calculateBusinessCoherenceScore(user, openFinanceData);
  const requestedAmountAdequacyScore = calculateRequestedAmountAdequacyScore(creditRequest, monthlyAverageIncome);
  const intendedUseCoherenceScore = calculateIntendedUseCoherenceScore(creditRequest);

  const validCpfCnpj = /^\d{11}$/.test(user.cpf) && /^\d{14}$/.test(user.cnpj);
  const foodActivity = containsAny(user.declaredBusinessActivity, FOOD_ACTIVITY_TERMS);
  const registrationScore = Math.round(
    clamp(
      (validCpfCnpj ? 25 : 0) +
        (user.businessType.toUpperCase() === 'MEI' ? 20 : 8) +
        (foodActivity ? 20 : 8) +
        (user.monthsOperating >= 12 ? 20 : user.monthsOperating >= 3 ? 12 : 4) +
        (user.city && user.state ? 10 : 0) +
        (user.hasCadUnico ? 5 : 0),
      0,
      100
    )
  );

  const declaredRevenue = user.declaredMonthlyRevenue || 0;
  const revenueCompatibility =
    monthlyAverageIncome > 0 && declaredRevenue > 0
      ? clamp(100 - Math.abs(monthlyAverageIncome - declaredRevenue) / declaredRevenue * 100, 30, 100)
      : 45;

  const financialCapacityScore = Math.round(
    clamp(
      monthlyAverageIncome > 0
        ? monthlyAverageIncome >= 3000
          ? incomeRecurrenceScore * 0.45 + revenueCompatibility * 0.35 + 20
          : incomeRecurrenceScore * 0.5 + revenueCompatibility * 0.3 + 10
        : declaredRevenue >= 2500
          ? 55
          : 40,
      20,
      95
    )
  );

  const cashStabilityCompositeScore = Math.round(
    clamp(cashFlowStabilityScore * 0.7 + (100 - negativeBalanceFrequency * 100) * 0.3, 10, 95)
  );

  const productiveBehaviorScore = Math.round(
    clamp(productiveTransactionScore * 0.55 + businessCoherenceScore * 0.45, 15, 95)
  );

  const requestAdequacyScore = Math.round(
    clamp(requestedAmountAdequacyScore * 0.6 + intendedUseCoherenceScore * 0.4, 5, 95)
  );

  const criticalFactors: string[] = [];
  if (intendedUseCoherenceScore < 20) criticalFactors.push('Finalidade declarada nao parece ser insumo produtivo');
  if (negativeBalanceFrequency >= 0.35) criticalFactors.push('Frequencia alta de saldo negativo');
  if (debtBurdenScore < 35) criticalFactors.push('Indicios de endividamento elevado');

  return {
    monthlyAverageIncome,
    incomeRecurrenceScore,
    cashFlowStabilityScore,
    negativeBalanceFrequency,
    productiveTransactionScore,
    debtBurdenScore,
    businessCoherenceScore,
    requestedAmountAdequacyScore,
    intendedUseCoherenceScore,
    registrationScore,
    financialCapacityScore,
    cashStabilityCompositeScore,
    productiveBehaviorScore,
    requestAdequacyScore,
    openFinanceTransactionCount: openFinanceData?.transactions.length ?? 0,
    hasCriticalFactor: criticalFactors.length > 0,
    criticalFactors
  };
}
