# AceitoFiado

**Capital de giro pra cadeia afroempreendedora. Sem score discriminatório no caminho.**

A empreendedora compra a prazo do fornecedor parceiro. O fornecedor recebe à vista. A AceitoFiado adquire a duplicata e cobra direto do Pix dela, via trava de recebíveis registrada em B3. O Serasa não decide nada.

---

## Por que isso existe

- **3×** mais negação de crédito pra empreendedor negro em condições idênticas (BID, 2022).
- **60%** dos empreendedores negros estão na informalidade ou em CEP penalizado pelos modelos de score brasileiros.
- Capital de giro é o pain #1 do MEI/ME (Sebrae). Sem ele, não repõe estoque, não cresce, não escala canais.

**A jogada:** não construímos um bureau alternativo (corrida de uma década que ninguém ganha) — construímos uma cadeia onde o bureau não toma nenhuma decisão. A gente é o lender. Não precisa que ninguém aceite nosso score.

---

## O que está construído aqui

Produto funcional end-to-end, dados persistidos em Postgres, sem mock em memória.

| Persona | Capabilities |
|---|---|
| **Empreendedora** | Onboarding com cálculo de score em tempo real, cockpit com limite/operações/fluxo de canais, catálogo de fornecedores, compra fiado com carrinho + escolha de prazo, detalhes da operação com timeline e duplicata, trava de recebíveis ao vivo, histórico de operações, página explicativa do score |
| **Fornecedor** | Painel com KPIs, fila de pedidos aguardando confirmação, confirmação one-click que dispara o Pix simulado e emite duplicata escritural, lista de produtos, operações pagas |
| **AceitoFiado (engine)** | Underwriting V0 auditável (regra explicável, sem caixa-preta), pricing automático por prazo, emissão de duplicata escritural, simulação de trava B3 com captura proporcional de Pix |

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, novo `proxy.ts`)
- **React 19** + **TypeScript**
- **Tailwind v4** + **shadcn/ui** (base radix-nova)
- **Prisma 6** ORM + **PostgreSQL 16**
- **Recharts** pros gráficos · **framer-motion** pras animações da trava ao vivo
- **Sessões em Postgres** + cookie httpOnly (auth simples e auditável, sem dependência externa)
- **Zod** pra validação · **scrypt** pra hashing de senha
- **Docker + docker-compose** pra subir tudo com um comando

---

## Rodando local

Pré-requisitos: `node 22+`, `npm 11+`, `docker` (só pro Postgres).

```bash
# 1. instalar dependências
npm install

# 2. subir o Postgres
npm run db:up

# 3. aplicar migrations + povoar com dados de demo
npm run db:migrate
npm run db:seed

# 4. dev server
npm run dev
```

App em **http://localhost:3000**.

### Contas de demonstração

| Conta | E-mail | Senha |
|---|---|---|
| Empreendedora — Joana (Onda Preta Biquínis) | `joana@ondapreta.com.br` | `aceito123` |
| Fornecedor — Distribuidora Tropical | `compras@distropical.com.br` | `aceito123` |
| Fornecedor — Atacado Afro Cosméticos | `pedidos@afrocosmeticos.com.br` | `aceito123` |
| Fornecedor — Brás Têxteis | `atendimento@brastexteis.com.br` | `aceito123` |

Atalho na home: clique em **"Ver demo da Joana"** pra pré-preencher o login.

---

## Rodando em produção (Docker)

Tudo orquestrado:

```bash
# build do app + Postgres em containers
npm run docker:build
npm run docker:up

# aplicar migrations dentro do container
docker compose --profile production exec app npx prisma migrate deploy
docker compose --profile production exec app npx tsx prisma/seed.ts
```

App em **http://localhost:3000**.

Pra parar:

```bash
npm run docker:down
```

---

## Demo end-to-end (3 minutos)

1. **Cadastro real** com cálculo de score em tempo real
   `/cadastro` — preencha os steps, veja o limite subindo conforme adiciona canais. Sem consulta a Serasa.

2. **Cockpit da Joana**
   `/app` — limite, fluxo dos canais (90 dias de Pix reais no DB), operações ativas, captura mensal.

3. **Compra fiado**
   `/app/fiado` → escolha um fornecedor → adicione produtos → escolha prazo (30/45/60 dias) → veja preço transparente com a fatia do prazo → confirme.

4. **Confirmação do fornecedor**
   Faça logout, entre como `compras@distropical.com.br`. Pedido aparece na fila. Clique em **"Confirmar e receber"**: duplicata é emitida em CERC (simulado), Pix vai à vista pro fornecedor, operação fica ATIVA.

5. **Trava de recebíveis ao vivo**
   `/app/trava` — operações sob trava com progresso. Clique em **"Simular Pix entrando"** — a captura aparece em tempo real, com animação. Pix de R$ 132 da Camila Rocha vira automaticamente R$ 39,82 de liquidação da duplicata.

---

## Engine de underwriting (V0)

Regra auditável. Sem caixa preta. Sem CEP. Sem Serasa.

```
score = 0.30 × log10(faturamento_mediano_mensal)
      + 0.20 × √(meses_de_atividade / 24)
      + 0.20 × diversidade_de_canais
      + 0.15 × estabilidade_de_fluxo
      + 0.15 × histórico_com_fornecedor
```

- Threshold de aprovação: **0.6**
- Limite aprovado: `clamp(faturamento × 0.4 × score, R$ 1k, R$ 60k)`
- Cada fator gera um snapshot persistido (auditável depois)

Implementação: [`src/lib/scoring.ts`](src/lib/scoring.ts). Visualização do breakdown pra empreendedora: `/app/score`.

---

## Engine de trava de recebíveis

Em produção real: instrução de domicílio bancário registrada na B3 (Res. BC 4.734/2019). Aqui simulamos com o algoritmo:

1. Pix entra na conta da empreendedora (real ou simulado via `/api/sim/pix`).
2. Engine pega operações ATIVAS ordenadas por vencimento (mais antigo primeiro).
3. Calcula `captureAmount = pix × captureRateBps / 10000` (25–35% conforme prazo).
4. Aplica em cascata até zerar.
5. Cria `Receivable` por captura, atualiza Pix como capturado.
6. Se a operação foi 100% liquidada → marca como REPAID e duplicata como LIQUIDATED.

Implementação: [`src/lib/receivables.ts`](src/lib/receivables.ts) + [`src/app/api/sim/pix/route.ts`](src/app/api/sim/pix/route.ts).

---

## Estrutura do projeto

```
prisma/
  schema.prisma          # 10 modelos: User, Session, Entrepreneur/SupplierProfile,
                         # Channel, Product, Order, OrderItem, Duplicata,
                         # PixTransaction, Receivable
  seed.ts                # Joana + 3 fornecedores + 90 dias de Pix + 2 operações

src/
  app/
    page.tsx             # Landing/pitch
    (auth)/
      entrar/             # Login
      cadastro/           # Onboarding com score live
    (entrepreneur)/
      app/                # Cockpit
      app/fiado/          # Catálogo + operações
      app/trava/          # Trava ao vivo
      app/historico/      # Histórico
      app/score/          # Breakdown do score
    (supplier)/
      fornecedor/         # Painel, pedidos, produtos, operações
    api/sim/pix/          # Simulador de Pix entrando
    sair/                 # Logout

  lib/
    scoring.ts            # Engine de underwriting V0
    pricing.ts            # Cálculo de pricing
    receivables.ts        # Engine de trava
    auth.ts               # Sessions + hashing
    queries.ts            # Queries comuns
    format.ts             # BRL, CNPJ, CEP, datas, percentuais
```

---

## Base regulatória

Tudo o que aplicamos já é regulado e tem precedente:

- **Duplicata mercantil** (Lei 5.474/1968) → **duplicata escritural** (Lei 13.775/2018)
- **Registradoras de recebíveis** (Res. BC 4.734/2019) — B3, CERC, CIP, TAG
- **FIDC** (Res. CVM 175) — em produção, o passivo é cedido pra FIDC parceiro

A inovação não é a estrutura financeira. É *onde* aplicamos e *como* decidimos aprovar.

---

## Próximos passos (roadmap pós-hack)

- **V1:** integração real com banco parceiro pra Pix de fato + webhook de captura.
- **V2:** P2P lending — pessoas físicas afro investindo nas próprias empreendedoras (Res. BC 4.656).
- **V3:** marketplace afro curado de fornecedores.
- **V4:** cartão de compras com limite dinâmico.
- **V5:** extensão pra outras cadeias periféricas.

---

Feito no **AfroCapital Hack** — não como exercício acadêmico, mas como instrumento financeiro de inclusão real.
