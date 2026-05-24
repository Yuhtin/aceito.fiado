import type {
  NormalizedAccount,
  NormalizedTransaction,
  PluggyAccount,
  PluggyTransaction
} from './types';
import { maskTaxNumber } from '../utils/masks';

export function mapPluggyAccount(account: PluggyAccount): NormalizedAccount {
  return {
    id: account.id,
    type: account.type,
    subtype: account.subtype,
    balance: account.balance,
    currencyCode: account.currencyCode,
    owner: account.owner,
    taxNumber: maskTaxNumber(account.taxNumber)
  };
}

export function mapPluggyTransaction(transaction: PluggyTransaction): NormalizedTransaction {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: Math.abs(transaction.amount),
    date: transaction.date,
    category: transaction.category ?? undefined,
    type: transaction.type ?? (transaction.amount >= 0 ? 'CREDIT' : 'DEBIT'),
    accountId: transaction.accountId,
    balance: transaction.balance
  };
}

export function mapCreditCards(accounts: PluggyAccount[]): Record<string, unknown>[] {
  return accounts
    .filter((account) => account.type === 'CREDIT' || account.subtype === 'CREDIT_CARD')
    .map((account) => ({
      id: account.id,
      subtype: account.subtype,
      balance: account.balance,
      currencyCode: account.currencyCode,
      creditData: account.creditData
    }));
}
