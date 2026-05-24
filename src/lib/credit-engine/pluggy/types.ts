export type NormalizedTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  type: 'CREDIT' | 'DEBIT';
  accountId: string;
  balance?: number;
};

export type NormalizedAccount = {
  id: string;
  type: string;
  subtype?: string;
  balance?: number;
  currencyCode?: string;
  owner?: string;
  taxNumber?: string;
};

export type NormalizedOpenFinanceData = {
  identity?: Record<string, unknown>;
  accounts: NormalizedAccount[];
  transactions: NormalizedTransaction[];
  loans?: Record<string, unknown>[];
  creditCards?: Record<string, unknown>[];
  warnings?: string[];
};

export type PluggyListResponse<T> = {
  results?: T[];
  total?: number;
  page?: number;
  totalPages?: number;
  next?: string;
};

export type PluggyAccount = {
  id: string;
  type: string;
  subtype?: string;
  balance?: number;
  currencyCode?: string;
  owner?: string;
  taxNumber?: string;
  creditData?: Record<string, unknown>;
};

export type PluggyTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string | null;
  type?: 'CREDIT' | 'DEBIT';
  accountId: string;
  balance?: number;
};
