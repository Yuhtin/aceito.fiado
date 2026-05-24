export const ENGINE_VERSION = '1.0.0';

export const SCORE_WEIGHTS = {
  registration: 0.15,
  financialCapacity: 0.25,
  cashStability: 0.2,
  productiveBehavior: 0.2,
  debtBurden: 0.1,
  requestAdequacy: 0.1
} as const;

export const FOOD_ACTIVITY_TERMS = [
  'marmita',
  'marmitaria',
  'doce',
  'doceira',
  'salgado',
  'salgadeira',
  'lanche',
  'lanchonete',
  'cozinha',
  'comida',
  'alimentacao',
  'restaurante',
  'bolo',
  'confeitaria'
];

export const PRODUCTIVE_TERMS = [
  'mercado',
  'atacado',
  'atacadista',
  'arroz',
  'feijao',
  'carne',
  'frango',
  'oleo',
  'farinha',
  'leite',
  'acucar',
  'embalagem',
  'gas',
  'ingrediente',
  'hortifruti',
  'delivery',
  'maquininha',
  'pix',
  'insumo',
  'massa',
  'ovo',
  'verdura',
  'legume'
];

export const NON_PRODUCTIVE_TERMS = [
  'aposta',
  'bet',
  'cassino',
  'viagem',
  'show',
  'eletronico pessoal',
  'celular pessoal',
  'roupa pessoal',
  'festa'
];

export const DEBT_TERMS = ['emprestimo', 'financiamento', 'parcela', 'fatura', 'cartao', 'boleto', 'divida'];
