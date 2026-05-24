import { describe, expect, it } from 'vitest';
import type { NormalizedOpenFinanceData } from '../../pluggy/pluggy.types.js';
import { CreditScoreService } from '../creditScore.service.js';
import { buildCreditFeatures } from '../featureEngineering.js';
import { runScoreEngine } from '../scoreEngine.js';
import {
  baseInput,
  doceiraSazonalData,
  marmiteiraPixData,
  negativeBalanceData,
  newMeiLowMovementData,
  strongProductiveData
} from './mocks.js';

function serviceWithData(data: NormalizedOpenFinanceData) {
  return new CreditScoreService({
    getNormalizedData: async () => data
  } as never);
}

describe('scoreEngine', () => {
  it('approves a user with good registration and financial data', async () => {
    const result = await serviceWithData(strongProductiveData).analyze(baseInput);

    expect(result.decision).toBe('APPROVED');
    expect(result.recommendedLimit).toBeGreaterThanOrEqual(400);
    expect(result.technicalMetadata.usedOpenFinance).toBe(true);
  });

  it('works without Open Finance with low confidence and conservative limit', async () => {
    const result = await new CreditScoreService().analyze({ ...baseInput, openFinance: undefined });

    expect(result.confidenceLevel).toBe('BAIXA');
    expect(result.recommendedLimit).toBeLessThanOrEqual(400);
    expect(result.technicalMetadata.usedOpenFinance).toBe(false);
  });

  it('penalizes low income recurrence', async () => {
    const result = await serviceWithData(doceiraSazonalData).analyze(baseInput);

    expect(result.technicalMetadata.features.incomeRecurrenceScore).toBeLessThan(70);
    expect(result.confidenceLevel).not.toBe('BAIXA');
  });

  it('reduces risk appetite when negative balance is frequent', async () => {
    const result = await serviceWithData(negativeBalanceData).analyze(baseInput);

    expect(result.technicalMetadata.features.negativeBalanceFrequency).toBeGreaterThan(0.35);
    expect(result.recommendedLimit).toBeLessThanOrEqual(200);
  });

  it('limits very high requested amount against income capacity', async () => {
    const result = await serviceWithData(newMeiLowMovementData).analyze({
      ...baseInput,
      creditRequest: { ...baseInput.creditRequest, requestedAmount: 800 },
      user: { ...baseInput.user, monthsOperating: 2 }
    });

    expect(result.recommendedLimit).toBeLessThanOrEqual(200);
    expect(result.technicalMetadata.appliedRules).toContain('Menos de 3 meses de operacao, limite limitado a R$ 200');
  });

  it('rejects or sends incompatible intended use to manual review', async () => {
    const result = await serviceWithData(marmiteiraPixData).analyze({
      ...baseInput,
      creditRequest: { ...baseInput.creditRequest, intendedUse: 'aposta esportiva', supplierCategory: 'bet' }
    });

    expect(['REJECTED', 'MANUAL_REVIEW']).toContain(result.decision);
    expect(result.recommendedLimit).toBe(0);
  });

  it('returns a medium score with reduced limit when debt pressure is high', async () => {
    const result = await serviceWithData(negativeBalanceData).analyze({
      ...baseInput,
      creditRequest: { ...baseInput.creditRequest, requestedAmount: 400 }
    });

    expect(result.technicalMetadata.features.debtBurdenScore).toBeLessThan(55);
    expect(result.recommendedLimit).toBeLessThanOrEqual(200);
  });

  it('falls back when Pluggy fails', async () => {
    const result = await new CreditScoreService({
      getNormalizedData: async () => {
        throw new Error('rate limited');
      }
    } as never).analyze(baseInput);

    expect(result.technicalMetadata.usedOpenFinance).toBe(false);
    expect(result.confidenceLevel).toBe('BAIXA');
    expect(result.technicalMetadata.pluggyWarnings?.[0]).toContain('Falha ao consultar Pluggy');
  });

  it('calculates operation fee from configured MVP premises', () => {
    const features = buildCreditFeatures(baseInput.user, baseInput.creditRequest, marmiteiraPixData);
    const result = runScoreEngine({ input: baseInput, features, usedOpenFinance: true });

    expect(result.suggestedOperationFeePercent).toBeGreaterThanOrEqual(6.5);
    expect(result.suggestedOperationFeePercent).toBeLessThanOrEqual(10.5);
  });

  it('generates user explanation', async () => {
    const result = await serviceWithData(marmiteiraPixData).analyze(baseInput);

    expect(result.userExplanation).toContain('Seu limite recomendado');
    expect(result.positiveFactors.length).toBeGreaterThan(0);
  });
});
