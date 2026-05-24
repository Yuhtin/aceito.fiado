import { describe, expect, it } from 'vitest';
import {
  buildCreditFeatures,
  calculateIntendedUseCoherenceScore,
  calculateMonthlyAverageIncome,
  calculateNegativeBalanceFrequency
} from '../featureEngineering.js';
import { baseInput, marmiteiraPixData, negativeBalanceData } from './mocks.js';

describe('featureEngineering', () => {
  it('calculates monthly average income from recent credit transactions', () => {
    expect(calculateMonthlyAverageIncome(marmiteiraPixData)).toBeGreaterThan(1500);
  });

  it('detects frequent negative balance', () => {
    expect(calculateNegativeBalanceFrequency(negativeBalanceData)).toBeGreaterThan(0.5);
  });

  it('scores productive intended use highly', () => {
    expect(calculateIntendedUseCoherenceScore(baseInput.creditRequest)).toBeGreaterThanOrEqual(90);
  });

  it('marks incompatible intended use as a critical factor', () => {
    const features = buildCreditFeatures(
      baseInput.user,
      { ...baseInput.creditRequest, intendedUse: 'aposta esportiva online', supplierCategory: 'bet' },
      marmiteiraPixData
    );

    expect(features.hasCriticalFactor).toBe(true);
    expect(features.intendedUseCoherenceScore).toBeLessThan(20);
  });
});
