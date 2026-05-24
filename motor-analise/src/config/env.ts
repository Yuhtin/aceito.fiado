import 'dotenv/config';

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: numberFromEnv('PORT', 3000),
  pluggyClientId: process.env.PLUGGY_CLIENT_ID,
  pluggyClientSecret: process.env.PLUGGY_CLIENT_SECRET,
  pluggyBaseUrl: process.env.PLUGGY_BASE_URL ?? 'https://api.pluggy.ai',
  pricing: {
    costOfCapitalPercent: numberFromEnv('COST_OF_CAPITAL_PERCENT', 1),
    operationalCostPercent: numberFromEnv('OPERATIONAL_COST_PERCENT', 1),
    platformMarginPercent: numberFromEnv('PLATFORM_MARGIN_PERCENT', 2),
    safetyMarginPercent: numberFromEnv('SAFETY_MARGIN_PERCENT', 1)
  }
};
