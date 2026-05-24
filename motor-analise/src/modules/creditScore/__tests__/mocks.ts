import type { CreditScoreInput } from '../creditScore.types.js';
import type { NormalizedOpenFinanceData, NormalizedTransaction } from '../../pluggy/pluggy.types.js';

export const baseInput: CreditScoreInput = {
  user: {
    name: 'Maria Silva',
    cpf: '00000000000',
    cnpj: '00000000000000',
    birthDate: '1989-05-10',
    declaredMonthlyRevenue: 3500,
    declaredBusinessActivity: 'marmitaria',
    businessType: 'MEI',
    city: 'Sao Paulo',
    state: 'SP',
    hasCadUnico: true,
    monthsOperating: 18
  },
  creditRequest: {
    requestedAmount: 400,
    requestedTermDays: 14,
    supplierCategory: 'atacado',
    intendedUse: 'compra de arroz, carne, oleo e embalagens'
  },
  openFinance: {
    provider: 'pluggy',
    itemId: 'item-123'
  }
};

function tx(
  id: string,
  description: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT',
  date: string,
  balance: number,
  category?: string
): NormalizedTransaction {
  return { id, description, amount, type, date, balance, category, accountId: 'acc-1' };
}

export const marmiteiraPixData: NormalizedOpenFinanceData = {
  identity: { name: 'Maria Silva' },
  accounts: [{ id: 'acc-1', type: 'BANK', subtype: 'CHECKING_ACCOUNT', balance: 1200, currencyCode: 'BRL' }],
  transactions: [
    tx('c1', 'PIX cliente marmita', 900, 'CREDIT', '2026-05-05', 1200, 'Transfer - PIX'),
    tx('c2', 'Venda maquininha', 850, 'CREDIT', '2026-05-12', 1500, 'Income'),
    tx('c3', 'PIX cliente marmita', 800, 'CREDIT', '2026-04-04', 1100, 'Transfer - PIX'),
    tx('c4', 'Venda maquininha', 950, 'CREDIT', '2026-04-13', 1400, 'Income'),
    tx('c5', 'PIX cliente marmita', 890, 'CREDIT', '2026-03-06', 900, 'Transfer - PIX'),
    tx('c6', 'Venda maquininha', 820, 'CREDIT', '2026-03-14', 1150, 'Income'),
    tx('c7', 'PIX cliente marmita', 920, 'CREDIT', '2026-02-07', 1000, 'Transfer - PIX'),
    tx('c8', 'Venda maquininha', 780, 'CREDIT', '2026-02-17', 950, 'Income'),
    tx('c9', 'PIX cliente marmita', 850, 'CREDIT', '2026-01-09', 1000, 'Transfer - PIX'),
    tx('c10', 'Venda maquininha', 930, 'CREDIT', '2026-01-20', 1300, 'Income'),
    tx('d1', 'Atacado arroz feijao carne', 520, 'DEBIT', '2026-05-06', 680, 'Groceries'),
    tx('d2', 'Mercado embalagens marmita', 240, 'DEBIT', '2026-05-14', 1260, 'Groceries'),
    tx('d3', 'Gas cozinha', 130, 'DEBIT', '2026-04-08', 970, 'Utilities'),
    tx('d4', 'Atacadista ingredientes', 430, 'DEBIT', '2026-03-10', 720, 'Groceries'),
    tx('d5', 'Delivery app taxa', 90, 'DEBIT', '2026-02-12', 860, 'Services'),
    tx('d6', 'Embalagens descartaveis', 180, 'DEBIT', '2026-01-15', 820, 'Groceries')
  ],
  loans: [],
  creditCards: []
};

export const doceiraSazonalData: NormalizedOpenFinanceData = {
  accounts: [{ id: 'acc-1', type: 'BANK', balance: 300 }],
  transactions: [
    tx('c1', 'PIX encomenda bolo', 2500, 'CREDIT', '2026-05-07', 2600),
    tx('c2', 'PIX encomenda pascoa', 3200, 'CREDIT', '2026-04-03', 3300),
    tx('c3', 'PIX cliente doce', 600, 'CREDIT', '2026-02-13', 700),
    tx('d1', 'Mercado acucar leite farinha', 800, 'DEBIT', '2026-05-08', 1800),
    tx('d2', 'Embalagens doces', 350, 'DEBIT', '2026-04-04', 2950),
    tx('d3', 'Fatura cartao', 700, 'DEBIT', '2026-03-10', 100)
  ],
  loans: [],
  creditCards: []
};

export const newMeiLowMovementData: NormalizedOpenFinanceData = {
  accounts: [{ id: 'acc-1', type: 'BANK', balance: 80 }],
  transactions: [
    tx('c1', 'PIX cliente', 300, 'CREDIT', '2026-05-10', 320),
    tx('d1', 'Mercado ingredientes', 220, 'DEBIT', '2026-05-11', 100)
  ],
  loans: [],
  creditCards: []
};

export const negativeBalanceData: NormalizedOpenFinanceData = {
  accounts: [{ id: 'acc-1', type: 'BANK', balance: -250 }],
  transactions: [
    tx('c1', 'PIX cliente', 700, 'CREDIT', '2026-05-02', -100),
    tx('c2', 'PIX cliente', 650, 'CREDIT', '2026-04-02', -80),
    tx('c3', 'PIX cliente', 600, 'CREDIT', '2026-03-02', 50),
    tx('d1', 'Fatura cartao', 900, 'DEBIT', '2026-05-03', -1000),
    tx('d2', 'Emprestimo parcela', 450, 'DEBIT', '2026-04-03', -530),
    tx('d3', 'Atacado arroz', 300, 'DEBIT', '2026-03-03', -250)
  ],
  loans: [{ id: 'loan-1', contractAmount: 5000 }],
  creditCards: []
};

export const strongProductiveData: NormalizedOpenFinanceData = {
  accounts: [{ id: 'acc-1', type: 'BANK', balance: 2400 }],
  transactions: [
    ...marmiteiraPixData.transactions,
    tx('c11', 'Venda maquininha', 4500, 'CREDIT', '2025-12-11', 5200),
    tx('c12', 'PIX cliente marmita', 4200, 'CREDIT', '2025-12-18', 7600),
    tx('c13', 'Venda maquininha', 3600, 'CREDIT', '2026-05-19', 6100),
    tx('c14', 'PIX cliente marmita', 3900, 'CREDIT', '2026-04-21', 6400),
    tx('d7', 'Atacado carnes', 500, 'DEBIT', '2025-12-12', 1600),
    tx('d8', 'Hortifruti ingredientes', 260, 'DEBIT', '2025-12-19', 2340)
  ],
  loans: [],
  creditCards: []
};
