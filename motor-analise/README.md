# Aceito Fiado - Credit Engine MVP

Motor backend de analise de credito produtivo para MEIs de comida pronta, marmitarias, doceiras, salgadeiras, pequenos lanches e cozinhas de bairro.

O MVP usa regras ponderadas, feature engineering e travas deterministicas. Ele nao treina modelo estatistico de inadimplencia nesta fase.

## Como Rodar

```bash
npm install
npm run dev
```

Servidor padrao: `http://localhost:3000`

Teste de saude:

```bash
curl http://localhost:3000/health
```

## Variaveis De Ambiente

Crie um `.env` a partir de `.env.example`:

```env
PORT=3000

PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
PLUGGY_BASE_URL=https://api.pluggy.ai

COST_OF_CAPITAL_PERCENT=1.0
OPERATIONAL_COST_PERCENT=1.0
PLATFORM_MARGIN_PERCENT=2.0
SAFETY_MARGIN_PERCENT=1.0
```

Substitua `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` pelos acessos reais da sua conta Pluggy no seu `process.env`/`.env`. Nunca exponha essas credenciais no browser, em logs ou em codigo versionado.

## Endpoints

### `POST /api/connect-token`

Cria um Connect Token server-side para o frontend abrir o Pluggy Connect com seguranca.

```json
{
  "clientUserId": "user-123"
}
```

Resposta:

```json
{
  "accessToken": "connect-token"
}
```

### `POST /credit-score/analyze`

Analisa cadastro, solicitacao de credito e, se houver `openFinance.itemId`, busca dados da Pluggy no backend.

```json
{
  "user": {
    "name": "Maria Silva",
    "cpf": "00000000000",
    "cnpj": "00000000000000",
    "birthDate": "1989-05-10",
    "declaredMonthlyRevenue": 3500,
    "declaredBusinessActivity": "marmitaria",
    "businessType": "MEI",
    "city": "Sao Paulo",
    "state": "SP",
    "hasCadUnico": true,
    "monthsOperating": 18
  },
  "creditRequest": {
    "requestedAmount": 400,
    "requestedTermDays": 14,
    "supplierCategory": "atacado",
    "intendedUse": "compra de arroz, carne, oleo e embalagens"
  },
  "openFinance": {
    "provider": "pluggy",
    "itemId": "optional-pluggy-item-id"
  }
}
```

Resposta resumida:

```json
{
  "recommendedLimit": 600,
  "suggestedOperationFeePercent": 7.5,
  "confidenceLevel": "ALTA",
  "decision": "APPROVED",
  "riskLevel": "BAIXO",
  "positiveFactors": ["Movimentacao financeira recorrente nos ultimos meses"],
  "attentionFactors": ["Historico de credito produtivo na plataforma ainda inexistente"],
  "userExplanation": "Seu limite recomendado e de R$ 600 porque...",
  "technicalMetadata": {
    "engineVersion": "1.0.0",
    "usedOpenFinance": true,
    "scoreFinal": 812,
    "features": {
      "monthlyAverageIncome": 3700,
      "incomeRecurrenceScore": 82,
      "cashFlowStabilityScore": 76,
      "negativeBalanceFrequency": 0.04,
      "debtBurdenScore": 68,
      "businessCoherenceScore": 90
    }
  }
}
```

## Pesos Do Score

O score final vai de 0 a 1000. Internamente, o motor calcula `score0a100` e multiplica por 10.

| Bloco | Peso |
| --- | ---: |
| Identidade e cadastro | 15% |
| Capacidade financeira | 25% |
| Estabilidade de caixa | 20% |
| Comportamento transacional produtivo | 20% |
| Endividamento e compromissos | 10% |
| Adequacao da solicitacao | 10% |

Faixas iniciais:

| Score | Limite base |
| --- | ---: |
| `< 350` | R$ 0 |
| `350-499` | R$ 200 se nao houver fator critico |
| `500-649` | R$ 200 ou R$ 400 |
| `650-799` | R$ 400 ou R$ 600 |
| `800-1000` | R$ 600 ou R$ 800 |

Travas aplicadas:

- limite maximo de 20% da media de entradas mensais estimada;
- primeiro uso limitado a R$ 800;
- sem Open Finance, recomendacao conservadora de ate R$ 400;
- endividamento alto reduz uma faixa;
- finalidade nao produtiva retorna `MANUAL_REVIEW` ou `REJECTED`;
- menos de 3 meses de operacao limita a R$ 200.

## Taxa Sugerida

Formula:

```txt
taxa = custoCapital + perdaEsperada + custoOperacional + margemPlataforma + margemSeguranca
```

A perda esperada varia por risco:

- `BAIXO`: 1.5%
- `MEDIO`: 3.25%
- `ALTO`: 5.5%

As demais premissas sao configuraveis por ambiente.

## Pluggy

O servico `PluggyService` autentica usando `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET`, gera API Key e consulta:

- `GET /accounts?itemId=...`
- `GET /transactions?accountId=...`
- `GET /identity?itemId=...`, quando disponivel
- `GET /loans?itemId=...`, quando disponivel

Contas, transacoes, cartoes e emprestimos sao normalizados antes de entrar no score. Se a Pluggy falhar, a analise continua com dados cadastrais e `confidenceLevel: "BAIXA"`.

## Testes

```bash
npm test
```

Coberturas principais:

- bons dados cadastrais e financeiros;
- ausencia de Open Finance;
- baixa recorrencia de entradas;
- saldo negativo frequente;
- valor solicitado alto;
- finalidade incompativel;
- score medio com limite reduzido;
- falha na Pluggy;
- calculo da taxa;
- explicacao textual.

## Compliance E Justica

O motor nao usa raca/cor para reduzir score, limite ou aumentar taxa individual. Caso atributos sensiveis existam em outras camadas do produto, devem ser usados apenas para metricas agregadas de impacto, com consentimento, minimizacao e finalidade clara.

CPF, CNPJ e dados bancarios completos nao devem ser gravados em logs. O mapper da Pluggy mascara documento de conta antes da normalizacao.

## Limitacoes Do MVP

- O score e baseado em regras ponderadas, nao em modelo estatistico treinado.
- Os pesos devem ser calibrados com dados reais de pagamento e inadimplencia.
- A Pluggy depende de consentimento do usuario e disponibilidade dos produtos por instituicao.
- O motor nao substitui analise regulatoria, juridica ou de compliance.
- A recomendacao de limite e conservadora por ser a primeira versao.
- O uso de dados sensiveis deve seguir minimizacao, consentimento e finalidade.

## Proximos Passos

- Persistir decisoes e snapshots de features para auditoria.
- Criar trilha de explicabilidade por versao do motor.
- Medir performance por safra, atividade e fornecedor.
- Calibrar pesos com comportamento real de pagamento.
- Evoluir para modelo estatistico ou ML somente quando houver historico suficiente e governanca de vies.
