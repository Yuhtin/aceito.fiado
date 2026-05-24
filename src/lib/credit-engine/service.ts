import 'server-only';
import { PluggyService } from './pluggy/service';
import type { AnalyzeContext, CreditScoreInput, ScoreEngineResult } from './types';
import { buildCreditFeatures } from './feature-engineering';
import { runScoreEngine } from './score-engine';

export class CreditScoreService {
  constructor(private readonly pluggyService = new PluggyService()) {}

  async analyze(input: CreditScoreInput): Promise<ScoreEngineResult> {
    const context = await this.buildContext(input);
    const features = buildCreditFeatures(input.user, input.creditRequest, context.openFinanceData);

    return runScoreEngine({
      input,
      features,
      usedOpenFinance: context.usedOpenFinance,
      pluggyWarnings: context.pluggyWarnings
    });
  }

  private async buildContext(input: CreditScoreInput): Promise<AnalyzeContext> {
    const itemId = input.openFinance?.itemId;
    if (!itemId) {
      return { input, usedOpenFinance: false };
    }

    try {
      const openFinanceData = await this.pluggyService.getNormalizedData(itemId);
      const hasUsableData = openFinanceData.accounts.length > 0 && openFinanceData.transactions.length > 0;

      return {
        input,
        openFinanceData,
        usedOpenFinance: hasUsableData,
        pluggyWarnings: hasUsableData ? openFinanceData.warnings : ['Open Finance sem transacoes suficientes']
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pluggy unavailable';
      return {
        input,
        usedOpenFinance: false,
        pluggyWarnings: [`Falha ao consultar Pluggy: ${message}`]
      };
    }
  }
}
