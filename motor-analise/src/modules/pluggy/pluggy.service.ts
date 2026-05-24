import { env } from '../../config/env.js';
import type {
  NormalizedOpenFinanceData,
  PluggyAccount,
  PluggyListResponse,
  PluggyTransaction
} from './pluggy.types.js';
import { mapCreditCards, mapPluggyAccount, mapPluggyTransaction } from './pluggy.mapper.js';

export class PluggyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluggyUnavailableError';
  }
}

export class PluggyService {
  private apiKey?: string;
  private apiKeyExpiresAt = 0;

  constructor(
    private readonly baseUrl = env.pluggyBaseUrl,
    private readonly clientId = env.pluggyClientId,
    private readonly clientSecret = env.pluggyClientSecret,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async createConnectToken(clientUserId?: string): Promise<{ accessToken: string }> {
    const apiKey = await this.getApiKey();
    return this.request<{ accessToken: string }>('/connect_token', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey },
      body: JSON.stringify(clientUserId ? { clientUserId } : {})
    });
  }

  async getNormalizedData(itemId: string): Promise<NormalizedOpenFinanceData> {
    const apiKey = await this.getApiKey();
    const accounts = await this.listAll<PluggyAccount>(`/accounts?itemId=${encodeURIComponent(itemId)}`, apiKey);

    const transactions = (
      await Promise.all(
        accounts.map((account) =>
          this.listAll<PluggyTransaction>(
            `/transactions?accountId=${encodeURIComponent(account.id)}&pageSize=500`,
            apiKey
          ).catch(() => [])
        )
      )
    ).flat();

    const [identity, loans] = await Promise.all([
      this.optionalRequest<Record<string, unknown>>(`/identity?itemId=${encodeURIComponent(itemId)}`, apiKey),
      this.listAll<Record<string, unknown>>(`/loans?itemId=${encodeURIComponent(itemId)}`, apiKey).catch(() => [])
    ]);

    return {
      identity: identity ?? undefined,
      accounts: accounts.map(mapPluggyAccount),
      transactions: transactions.map(mapPluggyTransaction),
      loans,
      creditCards: mapCreditCards(accounts)
    };
  }

  private async getApiKey(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new PluggyUnavailableError('Pluggy credentials are missing');
    }

    if (this.apiKey && Date.now() < this.apiKeyExpiresAt) {
      return this.apiKey;
    }

    const response = await this.request<{ apiKey?: string; accessToken?: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret
      })
    });

    this.apiKey = response.apiKey ?? response.accessToken;
    if (!this.apiKey) {
      throw new PluggyUnavailableError('Pluggy auth response did not include an API key');
    }

    this.apiKeyExpiresAt = Date.now() + 110 * 60 * 1000;
    return this.apiKey;
  }

  private async listAll<T>(path: string, apiKey: string): Promise<T[]> {
    const firstSeparator = path.includes('?') ? '&' : '?';
    const firstPagePath = `${path}${firstSeparator}page=1`;
    const firstPage = await this.request<PluggyListResponse<T>>(firstPagePath, {
      headers: { 'X-API-KEY': apiKey }
    });

    const results = [...(firstPage.results ?? [])];
    const totalPages = firstPage.totalPages ?? firstPage.page ?? 1;

    for (let page = 2; page <= totalPages; page += 1) {
      const separator = path.includes('?') ? '&' : '?';
      const nextPage = await this.request<PluggyListResponse<T>>(`${path}${separator}page=${page}`, {
        headers: { 'X-API-KEY': apiKey }
      });
      results.push(...(nextPage.results ?? []));
    }

    return results;
  }

  private async optionalRequest<T>(path: string, apiKey: string): Promise<T | null> {
    try {
      return await this.request<T>(path, { headers: { 'X-API-KEY': apiKey } });
    } catch {
      return null;
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new PluggyUnavailableError(`Pluggy request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
