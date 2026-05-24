# Aceito Fiado

> **🌐 Demo ao vivo:** https://aceitofiado.daviduarte.com.br
>
> **Atalho rápido:** botão **"ver demo"** na landing loga automaticamente como a Joana e cai no app — sem cadastro.
>
> **Usuários de teste** (senha pra todos: `aceito123`):
>
> | Email | Papel | Negócio |
> |---|---|---|
> | `joana@ondapreta.com.br` | MEI (cliente) | Onda Preta Biquínis · Heliópolis/SP |
> | `compras@distropical.com.br` | Lojista | Distribuidora Tropical Brás (têxtil) |
> | `pedidos@afrocosmeticos.com.br` | Lojista | Atacado Afro Cosméticos |
> | `atendimento@brastexteis.com.br` | Lojista | Brás Têxteis Estampas |

---

Infraestrutura de crédito produtivo embutido para MEIs alimentícios.

O Aceito Fiado permite que fornecedores ofereçam venda a prazo com mais segurança, usando análise de risco, checkout fiado, gestão de cobrança, trava de recebíveis, split de pagamentos e liquidez opcional dos recebíveis.

O crédito não é dinheiro livre na conta. O empreendedor recebe limite para comprar insumos e matéria-prima em fornecedores parceiros, produz, vende e paga a operação com o giro das vendas.

## Visão Geral

| Tema | Resumo |
| --- | --- |
| Público inicial | MEIs alimentícios, marmiteiros, doceiras, salgadeiras, cozinhas de bairro e pequenos comerciantes alimentícios |
| Primeiro mercado | São Paulo |
| Produto | Crédito produtivo para compra de insumos em fornecedores parceiros |
| Diferencial | Underwriting contextualizado, checkout embutido, trava de recebíveis e liquidez para fornecedores |
| Modelo financeiro | Taxa dinâmica, prazo curto e recebíveis estruturáveis para SCP, debênture ou FIDC |
| Status | MVP funcional com app web, marketplace demo, checkout, motor de score, duplicata e simulação de trava de Pix |

## Problema

O pequeno empreendedor alimentício precisa comprar matéria-prima antes de vender. Quando não há capital de giro, ele reduz produção, compra mais caro, perde prazo com fornecedores e deixa demanda na mesa.

No crédito tradicional, esse público costuma ser mal atendido por três razões:

- baixa profundidade de histórico formal;
- modelos de score pouco sensíveis ao ciclo produtivo do negócio;
- uso de proxies que penalizam território, informalidade parcial e renda irregular.

Dados que orientam o recorte:

| Indicador | Número |
| --- | ---: |
| MEIs ativos no Brasil | 12 milhões |
| MEIs que buscaram crédito e receberam negativa | 67% |
| Empreendedores negros no Brasil | 51,8% |
| Mercado inicial estimado de MEIs alimentícios | cerca de 1,6 milhão |

## Solução

Aceito Fiado transforma crédito em insumo produtivo.

Em vez de emprestar dinheiro livre, a plataforma libera limite para compra em fornecedores parceiros. A operação nasce associada a uma finalidade produtiva, a um fornecedor, a um prazo e a um fluxo de recebíveis que pode ser acompanhado e travado.

### Atores

| Ator | Papel |
| --- | --- |
| Empreendedor | Solicita limite, compra insumos, produz e vende |
| Fornecedor | Vende a prazo com confirmação digital e recebe à vista ou com liquidez antecipada |
| Aceito Fiado | Analisa risco, origina a operação, calcula preço, acompanha cobrança e estrutura recebíveis |
| Investidor ou veículo financeiro | Pode financiar operações via SCP, debênture, securitizadora ou FIDC |

## Como Funciona

1. O empreendedor realiza cadastro.
2. A plataforma analisa risco com dados cadastrais, contas pagas, extrato bancário via Open Finance, tempo de MEI e endividamento.
3. O motor recomenda um limite de insumo e uma taxa.
4. O empreendedor compra em fornecedor parceiro pelo checkout fiado.
5. O fornecedor confirma a venda e recebe o valor conforme a estrutura da operação.
6. A plataforma emite ou simula a duplicata da operação.
7. O empreendedor produz e vende.
8. Pagamentos via Pix, split ou trava de recebíveis liquidam a operação.
9. O bom histórico aumenta limite progressivamente.
10. Recebíveis performados podem ser vendidos ou estruturados para investidores, securitizadoras e FIDCs.

## Produto Construído

O repositório contém um MVP funcional de ponta a ponta.

| Módulo | O que entrega |
| --- | --- |
| Landing e demo | Página de apresentação, marketplace demo e docs de API |
| Onboarding | Cadastro de empreendedor com análise de crédito no fluxo |
| Cockpit do empreendedor | Limite, histórico, saúde financeira, fornecedores, compras fiado e trava ao vivo |
| Painel do fornecedor | Pedidos, produtos, cobrança por QR/link, operações e confirmação de venda |
| Checkout fiado | Sessões de pagamento com prazo, QR/link e API para marketplaces |
| Motor de análise | Score híbrido com regras ponderadas, Pluggy opcional e fallback local |
| Trava de recebíveis | Simulação de captura proporcional de Pix para liquidação de duplicatas |
| Persistência | PostgreSQL com Prisma, sessões, perfis, pedidos, duplicatas, Pix e análises de crédito |

## Arquitetura da Solução

```text
Empreendedor / Fornecedor / Marketplace
               |
               v
Next.js App Router
  - onboarding
  - dashboards
  - checkout fiado
  - docs API
  - rotas server-side
               |
               v
Camada de domínio
  - pricing
  - scoring local
  - credit-engine
  - receivables lock
  - auth e queries
               |
               v
PostgreSQL + Prisma
  - usuários e sessões
  - empreendedores e fornecedores
  - pedidos e itens
  - duplicatas
  - Pix e recebíveis
  - snapshots de score e análises
               |
               v
Integrações
  - Pluggy / Open Finance
  - API de checkout para marketplaces
  - simulação de Pix e trava de recebíveis
  - futura registradora, banco parceiro e FIDC
```

Também existe um serviço separado em `motor-analise/`, com Express + TypeScript, que isola o motor de análise de crédito produtivo e pode evoluir como microserviço.

## Tecnologias Utilizadas

| Camada | Stack |
| --- | --- |
| Frontend e backend web | Next.js 16, React 19, TypeScript, App Router, Server Actions |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI, Recharts, Framer Motion, Lucide |
| Banco e ORM | PostgreSQL 16, Prisma 6 |
| Autenticação | Sessões persistidas no Postgres, cookie httpOnly, hashing de senha |
| Validação | Zod |
| Open Finance | Pluggy Connect e Pluggy API server-side |
| Motor isolado | Node.js, Express, TypeScript, Vitest |
| Infra local | Docker, docker-compose |

## Motor de Crédito

O motor de crédito é a camada de inteligência da operação. No MVP, ele foi implementado com regras ponderadas, feature engineering e travas determinísticas para manter auditabilidade e explicar a decisão ao empreendedor.

A escolha por não treinar um modelo de machine learning nesta fase é intencional: ainda não existe histórico suficiente de pagamento, atraso, recompra e inadimplência dentro da plataforma para treinar IA com responsabilidade. Em vez de simular uma caixa-preta sem base real, o MVP cria a infraestrutura para coletar dados de performance e evoluir o motor de forma gradual.

O uso pretendido de IA está concentrado na evolução desse motor. Com dados reais da operação, modelos supervisionados poderão apoiar a estimativa de risco, a recomendação de limite e a calibragem de taxa, sempre com trilha de auditoria e monitoramento de impacto.

### Motor no app principal

Implementação local:

- `src/lib/credit-engine/`
- fallback em `src/lib/scoring.ts`
- persistência em `CreditAnalysis` e `ScoreSnapshot`

O motor considera:

- cadastro e identidade;
- tempo de operação;
- atividade declarada;
- faturamento declarado;
- canais conectados;
- recorrência de entradas;
- estabilidade de caixa;
- endividamento;
- finalidade da compra;
- dados Open Finance, quando disponíveis.

### Evolução com IA

A IA não é apresentada como uma promessa de aprovação automática ou perfeita. O objetivo é usar modelos como apoio à decisão, melhorando precisão sem perder explicabilidade.

| Fase | Abordagem |
| --- | --- |
| MVP | Regras explicáveis, pesos definidos manualmente, Pluggy opcional e auditoria das decisões |
| Piloto | Coleta de dados de performance: pagamento em dia, atraso, recompra, liquidação e comportamento por fornecedor |
| V1 IA | Modelo supervisionado simples para estimar probabilidade de atraso da operação |
| V2 IA | Calibração de limite e taxa por risco, com monitoramento de viés e revisão humana em casos sensíveis |
| V3 IA | Recomendações de cesta de insumos e limite dinâmico conforme ciclo produtivo do MEI |

Sinais que poderão alimentar a evolução com IA:

- recorrência de entradas por Pix, cartão e marketplaces;
- estabilidade e sazonalidade do fluxo de caixa;
- comportamento de pagamento dentro da plataforma;
- compatibilidade entre compra solicitada e atividade produtiva;
- concentração de receita em poucos clientes ou canais;
- histórico com fornecedores;
- sinais de endividamento e comprometimento de caixa.

Princípios para essa evolução:

- não usar raça/cor para reduzir limite, piorar score ou aumentar taxa individual;
- evitar variáveis que funcionem como proxies discriminatórios sem análise de impacto;
- manter explicação compreensível para o empreendedor;
- versionar modelos, features e pesos usados em cada análise;
- auditar resultados por grupos de forma agregada para detectar impacto desigual.

### Serviço independente

O diretório `motor-analise/` contém o serviço independente do motor, com:

- `POST /credit-score/analyze`;
- `POST /api/connect-token`;
- normalização de dados Pluggy;
- testes automatizados com Vitest;
- README técnico próprio.

## Score e Decisão

Blocos do motor avançado:

| Bloco | Peso |
| --- | ---: |
| Identidade e cadastro | 15% |
| Capacidade financeira | 25% |
| Estabilidade de caixa | 20% |
| Comportamento transacional produtivo | 20% |
| Endividamento e compromissos | 10% |
| Adequação da solicitação | 10% |

Saídas principais:

- decisão: `APPROVED`, `MANUAL_REVIEW` ou `REJECTED`;
- risco: `BAIXO`, `MEDIO` ou `ALTO`;
- confiança: `ALTA`, `MEDIA` ou `BAIXA`;
- limite recomendado;
- taxa sugerida;
- fatores positivos;
- pontos de atenção;
- explicação em linguagem simples;
- metadados técnicos para auditoria.

O motor não usa raça/cor para reduzir limite, piorar score ou aumentar taxa individual. A proposta de inclusão financeira é tratada no desenho do produto, não como penalização ou privilégio em decisão individual.

## Modelo de Negócio

| Item | Premissa inicial |
| --- | --- |
| Taxa média | 5% ao mês |
| Faixa dinâmica | 4% a 7% |
| Prazo | 45 a 60 dias |
| Receita | Fee operacional e participação na taxa da operação |
| Fornecedor | Recebe o valor integral ou antecipado da venda |
| Capital | Pode vir de parceiros, SCP, debênture ou FIDC |
| Ativo financeiro | Recebíveis produtivos originados na plataforma |

A lógica econômica é simples: o fornecedor vende mais e reduz risco de inadimplência direta; o empreendedor compra insumo para produzir; a plataforma origina, precifica e acompanha a operação; investidores podem financiar recebíveis com lastro produtivo e dados operacionais.

## Diferenciais

| Diferencial | Por que importa |
| --- | --- |
| Crédito produtivo, não pessoal | Reduz desvio de finalidade e conecta crédito à geração de receita |
| Vertical alimentícia | Permite entender ciclo de compra, produção e venda do MEI |
| Integração com fornecedores | Origina crédito no momento da compra real |
| Análise contextualizada | Considera fluxo, atividade, recorrência e finalidade produtiva |
| Trava de recebíveis | Mitiga risco usando parte do giro de vendas |
| Transparência de preço | Prazo, taxa e valor final ficam claros no checkout |
| Histórico financeiro próprio | O empreendedor constrói reputação dentro da plataforma |
| Embedded finance | Marketplaces e fornecedores podem embutir o checkout fiado |

## API e Integrações

### Checkout fiado

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/api/v1/checkout` | Cria sessão de checkout fiado por QR presencial ou API marketplace |
| `GET` | `/api/v1/checkout/{code}` | Consulta dados e status de uma sessão |
| `POST` | `/api/v1/checkout/{code}/confirm` | Confirma a operação para MEI autenticado |

O fluxo também suporta `webhookUrl` em integrações marketplace para notificar confirmação.

### Open Finance

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/api/connect-token` | Gera Connect Token da Pluggy no servidor |

As credenciais `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` devem ficar apenas no servidor, em variáveis de ambiente. Nunca exponha essas chaves no frontend.

### Simulação de Pix

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/api/sim/pix` | Simula entrada de Pix e aplica captura na trava de recebíveis |

## TAM, SAM e SOM

| Camada | Recorte |
| --- | --- |
| TAM | 12 milhões de MEIs ativos no Brasil |
| SAM | Cerca de 1,6 milhão de MEIs alimentícios |
| SOM inicial | Operação em São Paulo com fornecedores parceiros e MEIs de alimentação |

O foco inicial em alimentos reduz dispersão operacional: há recorrência de compra de insumos, ciclo curto de produção e venda, alta frequência de Pix e necessidade contínua de capital de giro.

## Roadmap e Escalabilidade

| Fase | Estratégia |
| --- | --- |
| 1. MVP | Validar originação, cobrança, limite e recorrência com operação controlada |
| 2. SCP | Operar com estrutura simples de participação e validação de carteira |
| 3. Debênture própria | Criar funding mais escalável para carteira performada |
| 4. FIDC próprio | Estruturar carteira de recebíveis produtivos com governança |
| 5. Infraestrutura | Virar camada de originação e distribuição de recebíveis para fornecedores, marketplaces e marcas |

Visão estratégica: grandes marcas de alimentos, bebidas, embalagens e insumos podem atuar como investidoras e parceiras, financiando pequenos empreendedores que compram e distribuem seus próprios produtos.

## Estrutura do Projeto

```text
.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (entrepreneur)/
│   │   ├── (supplier)/
│   │   ├── api/
│   │   ├── demo-marketplace/
│   │   ├── docs/
│   │   └── pay/
│   ├── components/
│   └── lib/
│       ├── credit-engine/
│       ├── auth.ts
│       ├── checkout.ts
│       ├── pricing.ts
│       ├── receivables.ts
│       └── scoring.ts
├── motor-analise/
│   ├── src/
│   ├── package.json
│   └── README.md
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Como Rodar Localmente

Pré-requisitos:

- Node.js 22+
- npm 11+
- Docker, para PostgreSQL local

### 1. Configurar ambiente

```bash
cp .env.example .env
```

Variáveis principais:

```env
DATABASE_URL="postgresql://aceitofiado:aceitofiado_dev@localhost:5433/aceitofiado?schema=public"
AUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

PLUGGY_CLIENT_ID=""
PLUGGY_CLIENT_SECRET=""
PLUGGY_BASE_URL="https://api.pluggy.ai"

COST_OF_CAPITAL_PERCENT=1.0
OPERATIONAL_COST_PERCENT=1.0
PLATFORM_MARGIN_PERCENT=2.0
SAFETY_MARGIN_PERCENT=1.0
```

Preencha `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` com credenciais reais apenas no `.env` local ou no provedor de deploy.

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir banco

```bash
npm run db:up
```

### 4. Migrar e popular demo

```bash
npm run db:migrate
npm run db:seed
```

### 5. Rodar app

```bash
npm run dev
```

Aplicação:

```text
http://localhost:3000
```

## Contas de Demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Empreendedora | `joana@ondapreta.com.br` | `aceito123` |
| Fornecedor | `compras@distropical.com.br` | `aceito123` |
| Fornecedor | `pedidos@afrocosmeticos.com.br` | `aceito123` |
| Fornecedor | `atendimento@brastexteis.com.br` | `aceito123` |

## Walkthrough da Demo

1. Acesse a landing em `/`.
2. Entre como Joana ou use o fluxo de cadastro em `/cadastro`.
3. Veja cockpit, limite, saúde financeira e fornecedores em `/app`.
4. Faça uma compra fiado em `/app/fiado`.
5. Entre como fornecedor e confirme o pedido em `/fornecedor/pedidos`.
6. Volte para o empreendedor e acompanhe a trava em `/app/trava`.
7. Simule Pix entrando para ver a captura proporcional liquidando a operação.
8. Acesse `/docs/api` para ver a API de checkout embutido.
9. Teste `/demo-marketplace` para simular integração com marketplace externo.

## Rodando com Docker

```bash
npm run docker:build
npm run docker:up
```

Aplicar migrations e seed dentro do container:

```bash
docker compose --profile production exec app npx prisma migrate deploy
docker compose --profile production exec app npx tsx prisma/seed.ts
```

Parar:

```bash
npm run docker:down
```

## Rodando o Motor Isolado

```bash
cd motor-analise
npm install
npm run dev
```

Endpoints do motor:

```text
POST http://localhost:3000/credit-score/analyze
POST http://localhost:3000/api/connect-token
GET  http://localhost:3000/health
```

Testes:

```bash
cd motor-analise
npm test
```

## Screenshots e Preview

Espaço reservado para imagens do demo:

| Tela | Arquivo sugerido |
| --- | --- |
| Landing | `docs/screenshots/landing.png` |
| Cockpit do empreendedor | `docs/screenshots/app-cockpit.png` |
| Compra fiado | `docs/screenshots/fiado-checkout.png` |
| Painel do fornecedor | `docs/screenshots/fornecedor-pedidos.png` |
| Trava de recebíveis | `docs/screenshots/trava-recebiveis.png` |
| Docs API | `docs/screenshots/api-docs.png` |

## Compliance e Justiça

O produto é voltado à inclusão financeira de empreendedores negros e periféricos, mas a decisão individual de crédito não usa raça/cor para piorar score, preço ou limite.

Princípios do MVP:

- minimização de dados sensíveis;
- consentimento para Open Finance;
- finalidade produtiva clara;
- explicabilidade da decisão;
- não exposição de CPF, CNPJ completo e dados bancários em logs;
- motor auditável antes de qualquer uso de machine learning.

## Impacto Social

O Aceito Fiado busca aumentar acesso a capital produtivo sem reproduzir dependência exclusiva de bureaus tradicionais. A tese é que MEIs com fluxo real, recorrência de venda e demanda por insumos podem ser financiados com estruturas de menor risco quando a operação é vinculada a fornecedor, finalidade produtiva e recebíveis.

Impactos esperados:

- maior capacidade de compra de insumos;
- melhora de margem ao comprar melhor e em maior volume;
- construção de histórico financeiro verificável;
- aumento de vendas para fornecedores locais;
- criação de uma nova classe de recebíveis produtivos de pequeno ticket.

## Limitações do MVP

- A trava de recebíveis e emissão de duplicata são simuladas para demonstração.
- O motor de crédito usa regras ponderadas, não modelo estatístico treinado.
- Pesos e limites precisam ser calibrados com dados reais de pagamento e inadimplência.
- A integração Pluggy depende de consentimento do usuário e disponibilidade por instituição.
- A solução não substitui análise jurídica, regulatória ou de compliance.
- Estruturas como SCP, debênture e FIDC exigem desenho jurídico e operacional próprio antes de produção.

## Próximos Passos

- Integrar Pix real com banco parceiro e webhooks de entrada.
- Integrar registradora de recebíveis para trava operacional real.
- Persistir trilhas de decisão e versionamento completo do motor.
- Calibrar score com performance real da carteira.
- Criar régua de cobrança multicanal.
- Ampliar fornecedores alimentícios em São Paulo.
- Estruturar piloto com SCP.
- Preparar carteira para debênture ou FIDC.
- Evoluir a API para marketplaces e ERPs de fornecedores.

