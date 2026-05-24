# AceitoFiado · Pivot para Checkout · Spec de Design

**Data:** 2026-05-24
**Status:** Em revisão
**Autor:** brainstorming session David + Claude

---

## 1. Contexto e Por Quê

### Estado atual
O site comunica "infraestrutura de crédito mercantil + trava de recebíveis + cobrança de bureau". Conceito ambicioso, mas a landing parece dirigida a "qualquer empreendedor" e a identidade Afro está ausente. A trava de recebíveis está no centro do pitch público, embora ela seja infraestrutura — não o produto que o usuário vê.

### Pivot
O AceitoFiado **é um checkout**. Especificamente: uma forma de pagamento alternativa ao Pix e cartão, onde o **lojista cobra** e o **MEI afro paga a prazo**, sem cartão e sem score de bureau. Há dois fluxos de uso, ambos importantes pro MVP:

1. **Presencial (QrCode na loja):** lojista digita itens no painel, gera QrCode, MEI escaneia pelo celular, confirma compra fiado, lojista recebe à vista.
2. **API marketplace:** marketplace afro pluga "Pagar com AceitoFiado" como botão de checkout (tipo Stripe). MEI clica, abre nosso modal, confirma. Marketplace recebe webhook.

A trava de recebíveis **continua existindo** (é nosso diferencial técnico), mas vira mecânica de bastidor mencionada em copy técnica/secundária — não é o herói da landing.

### Restrições não-negociáveis
- **Site público nunca usa a palavra "score"** (`feedback_copy_design.md`). Substituir por "saúde financeira", "limite", "atividade na rede".
- **Identidade Afro explícita** em copy, paleta, tipografia e fotografia. Sem decoração genérica de "qualquer empreendedor".
- **Foto real** de empreendedora preta brasileira no hero (não placeholder, não silhueta).

---

## 2. Direção visual fechada (v3)

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--af-preto` | `#0a0a0a` | Background principal, texto sobre claro |
| `--af-branco` | `#fafafa` | Texto sobre preto, cards claros |
| `--af-creme` | `#f8f4ed` | Background claro secundário (cards, sections) |
| `--af-borda` | `#ece5d5` | Bordas em creme |
| `--af-cinza` | `#6b645c` | Texto secundário sobre creme |
| `--af-dourado` | `#d4a017` | **Accent único** — CTAs, highlights, manifesto bar |
| `--af-sucesso` | `#16a34a` | Status positivo (raro) |
| `--af-laranja` | `#e8521a` | Accent secundário pra estados de atenção (raro) |

Princípio: alto contraste preto × creme × dourado. Sem rainbow palette.

### Tipografia

| Família | Uso | Pesos |
|---|---|---|
| **Anton** (Google Fonts) | Display: headlines, números grandes, manifesto bar | 400 |
| **Inter** | Body, UI controls, parágrafos | 400, 500, 600, 700 |
| **Geist Mono** | Labels, eyebrows, valores monetários inline, metadata | 400, 500 |

Anton sempre em `text-transform: uppercase` e `letter-spacing: -0.01em`. Fraunces, Bricolage Grotesque e Geist Sans foram rejeitadas em rounds anteriores — não retomar.

### Princípios de composição
- Hero com foto real grande (50% da tela), overlay gradient, receipt chip flutuante e citação inline na foto.
- Manifesto strip horizontal em dourado sólido, Anton, mensagem política (1-line).
- Números (KPIs) em Anton 48-64px, com unidade pequena (M, mil) em cinza.
- Receipt cards (chip flutuante, modal de confirmação) em creme/branco com sombra ampla sobre fundo preto.
- Pulse dot animado em todo status "ao vivo" (já existe em `components/af/primitives.tsx`).

---

## 3. Estrutura nova de páginas

### 3.1 Públicas (landing + checkout aberto)

```
/                          → Landing nova (v3)
/pay/[code]                → MEI escaneia QR / abre link, confirma fiado
/demo-marketplace          → Fake marketplace com botão "Pagar com AceitoFiado"
/docs/api                  → Página de doc curta com endpoint + snippet
/cadastro                  → Onboarding (refresh visual v3)
/entrar                    → Login (refresh visual v3)
```

### 3.2 App da cliente MEI (`/app`)

```
/app                       → Dashboard: fiados em aberto, próximo vencimento, saúde financeira
/app/fiado                 → Histórico + status de cada fiado
/app/fiado/op/[id]         → Detalhe de uma operação (existe, refresh)
/app/saude                 → Visualização de saúde financeira (renomeia /app/score)
/app/lojistas              → NOVO. Catálogo de lojistas com mapa + filtros
/app/trava                 → Trava live (existe, refresh visual)
/app/historico             → Histórico de pagamentos (existe, refresh)
```

**Removidos do app da MEI:**
- `/app/fiado/[supplierId]` (catalog-shopper que assumia MEI compra direto no marketplace nosso — não somos marketplace)
- `/app/score` (renomeado pra `/app/saude`)

### 3.3 App do lojista (`/fornecedor`)

```
/fornecedor                → Dashboard: vendas hoje, fiado em aberto, recebíveis previstos
/fornecedor/cobrar         → NOVO. Cria fiado, gera QrCode (tela crítica do MVP)
/fornecedor/operacoes      → Lista de cobranças/fiados (existe, refresh)
/fornecedor/pedidos        → Fila de aprovações (existe)
/fornecedor/pedidos/[id]   → Detalhe (existe)
/fornecedor/produtos       → Catálogo de produtos do lojista (existe, refresh)
```

### 3.4 API
```
POST   /api/v1/checkout             → cria CheckoutSession, retorna { code, payUrl }
GET    /api/v1/checkout/[code]      → retorna dados pra MEI confirmar
POST   /api/v1/checkout/[code]/confirm → confirma fiado, dispara webhook ao marketplace
POST   /api/sim/pix                 → mantém (trava de recebíveis sim)
```

---

## 4. Os 3 fluxos críticos

### 4.1 Lojista cobra fiado (presencial)
1. Lojista entra em `/fornecedor/cobrar`.
2. Identifica cliente: busca por CPF/nome (autocomplete contra `EntrepreneurProfile`).
3. Adiciona itens (livre, ou puxando do `/fornecedor/produtos`).
4. Escolhe prazo: 15/30/45/60 dias.
5. Clica "Gerar QrCode". Sistema cria `CheckoutSession` com `code` único (8 chars, formato `AF7K-9M2C-X1`).
6. Tela mostra QR Code grande (preto sobre creme, accent dourado), valor R$, link compartilhável (`aceitofiado.com/pay/<code>`), botão "Compartilhar no WhatsApp".
7. Cliente MEI escaneia ou recebe link.

### 4.2 MEI paga fiado (mobile-first)
1. MEI abre `/pay/[code]` (escaneada do QR ou link).
2. Tela de confirmação: lojista (nome + bairro), itens (ou só total se não tiver detalhe), valor, prazo, taxa AceitoFiado, valor total a pagar no vencimento.
3. Se não está logada, login express (CPF + senha) ou cadastro express (CPF + WhatsApp + senha).
4. Engine de underwriting roda (decisão silenciosa, sem expor "score").
5. Se aprovado, "Confirmar e pagar em 30d" → cria `Order` com `OrderStatus = FUNDED`.
6. Tela de sucesso: confirmação, nota sobre trava começar, link pra `/app`.
7. Se reprovado, mensagem neutra: "ainda não conseguimos liberar fiado pra essa compra — tenta valor menor ou outra loja."

### 4.3 Marketplace integra via API
1. Marketplace pluga botão "Pagar com AceitoFiado" no checkout.
2. Marketplace chama `POST /api/v1/checkout` com `{ amount, items, cliente_cpf, marketplace_id, success_url, cancel_url, webhook_url }`.
3. Resposta: `{ code, payUrl, expires_at }`.
4. Marketplace redireciona MEI pra `payUrl` (ou abre em modal/iframe).
5. MEI confirma como no fluxo 4.2.
6. Sucesso → webhook `POST {webhook_url}` com `{ code, status, amount, order_id }`.
7. Marketplace mostra confirmação na `success_url`.

**Pro MVP do hackaton:** `/demo-marketplace` é uma página fake nossa que executa o fluxo de ponta a ponta. Internamente usa server actions (não precisa chamar `/api/v1/*` real nem enviar webhook externo) — apenas simula o redirect pra `/pay/[code]` e o retorno. Isso prova visualmente que o fluxo funciona pro júri, sem dependência externa.

---

## 5. Arquitetura

### 5.1 Mudanças no schema Prisma

**Adicionar `CheckoutSession`:**
```prisma
model CheckoutSession {
  id            String   @id @default(cuid())
  code          String   @unique  // ex: AF7K-9M2C-X1
  supplierId    String
  entrepreneurId String?           // null até MEI se identificar
  amount        Int               // centavos
  items         Json              // [{ name, qty, price }]
  prazo         Int               // dias (15, 30, 45, 60)
  source        CheckoutSource    // QR_PRESENCIAL ou API_MARKETPLACE
  status        CheckoutStatus    // PENDING, CONFIRMED, EXPIRED, CANCELLED
  expiresAt     DateTime
  confirmedAt   DateTime?
  orderId       String? @unique   // FK pra Order quando confirmado

  // pra API marketplace:
  marketplaceId String?
  successUrl    String?
  webhookUrl    String?

  supplier     SupplierProfile     @relation(...)
  entrepreneur EntrepreneurProfile? @relation(...)
  order        Order?              @relation(...)

  createdAt DateTime @default(now())
}

enum CheckoutSource { QR_PRESENCIAL  API_MARKETPLACE }
enum CheckoutStatus { PENDING  CONFIRMED  EXPIRED  CANCELLED }
```

**Adicionar campos ao `SupplierProfile` pra o catálogo de lojistas no mapa:**
```prisma
model SupplierProfile {
  // ... existentes
  latitude    Float?
  longitude   Float?
  endereco    String?   // ex: "Heliópolis, SP"
  bairro      String?
  serviceTags String[]  // ex: ["moda praia", "biquíni", "estampa"]
}
```

### 5.2 Endpoints novos
- `POST /api/v1/checkout` — cria CheckoutSession, gera code, retorna payUrl.
- `GET  /api/v1/checkout/[code]` — devolve dados pra MEI confirmar.
- `POST /api/v1/checkout/[code]/confirm` — confirma fiado, cria Order, dispara webhook.
- `POST /api/sim/pix` — mantém (trava simulação).

### 5.3 Componentes novos
- `components/checkout/qr-display.tsx` — QR + valor + link + botão whatsapp.
- `components/checkout/pay-confirm.tsx` — tela mobile de confirmação MEI.
- `components/checkout/pay-success.tsx` — tela de sucesso.
- `components/checkout/marketplace-button.tsx` — botão "Pagar com AceitoFiado" embedável.
- `components/map/lojistas-map.tsx` — Leaflet com pins dos lojistas + filtros.
- `components/api/code-block.tsx` — bloco de código highlighted (já existe em `af/primitives.tsx` o `CodeBlock`, expandir).
- `components/marketing/hero-v3.tsx` — hero novo da landing.
- `components/marketing/manifesto-strip.tsx` — strip dourado com headline política.
- `components/marketing/numbers-grid.tsx` — grid de KPIs.

### 5.4 Componentes existentes a refatorar
- `components/af/*` — reescrever tokens (Anton, paleta v3).
- `components/marketing/top-nav.tsx` — preto + dourado, layout Anton.
- `components/marketing/site-footer.tsx` — preto, lista limpa.
- `components/shell/app-shell.tsx` — paleta v3.
- `components/brand/logo.tsx` — marca quadrada "A" dourada em fundo preto.

### 5.5 Globals
- `src/app/globals.css` — todos os tokens OKLCH a serem substituídos pela paleta v3 (manter compatibilidade ou rename). Adicionar imports do Anton via Google Fonts.

---

## 6. Mapa de arquivos: criar / editar / manter

### Criar (novos)
```
src/app/pay/[code]/page.tsx
src/app/pay/[code]/_actions.ts
src/app/demo-marketplace/page.tsx
src/app/demo-marketplace/_actions.ts
src/app/docs/api/page.tsx
src/app/api/v1/checkout/route.ts
src/app/api/v1/checkout/[code]/route.ts
src/app/api/v1/checkout/[code]/confirm/route.ts
src/app/(supplier)/fornecedor/cobrar/page.tsx
src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx
src/app/(supplier)/fornecedor/cobrar/_actions.ts
src/app/(entrepreneur)/app/saude/page.tsx
src/app/(entrepreneur)/app/lojistas/page.tsx
src/app/(entrepreneur)/app/lojistas/lojistas-map.tsx
src/components/checkout/qr-display.tsx
src/components/checkout/pay-confirm.tsx
src/components/checkout/pay-success.tsx
src/components/marketing/hero-v3.tsx
src/components/marketing/manifesto-strip.tsx
src/components/marketing/numbers-grid.tsx
src/components/map/lojistas-map.tsx
src/lib/checkout.ts                 # geração de code, validação, expiração
prisma/migrations/<ts>_checkout_session/migration.sql
```

### Editar (refresh visual + copy)
```
src/app/page.tsx                                            # landing completa v3
src/app/layout.tsx                                          # font imports
src/app/globals.css                                         # tokens v3
src/app/(auth)/cadastro/page.tsx                            # visual v3
src/app/(auth)/cadastro/onboarding-flow.tsx                 # visual v3
src/app/(auth)/entrar/page.tsx                              # visual v3
src/app/(auth)/entrar/login-form.tsx                        # visual v3
src/app/(entrepreneur)/app/page.tsx                         # dashboard sem "score"
src/app/(entrepreneur)/app/fiado/page.tsx                   # remover catálogo
src/app/(entrepreneur)/app/historico/page.tsx               # visual v3
src/app/(entrepreneur)/app/trava/page.tsx                   # visual v3
src/app/(entrepreneur)/app/trava/trava-live-stream.tsx      # visual v3
src/app/(entrepreneur)/app/_nav.ts                          # rotas atualizadas
src/app/(supplier)/fornecedor/page.tsx                      # dashboard v3
src/app/(supplier)/fornecedor/operacoes/page.tsx            # v3
src/app/(supplier)/fornecedor/pedidos/page.tsx              # v3
src/app/(supplier)/fornecedor/pedidos/[id]/page.tsx         # v3
src/app/(supplier)/fornecedor/produtos/page.tsx             # v3
src/app/(supplier)/fornecedor/_nav.ts                       # adicionar /cobrar
src/components/marketing/top-nav.tsx                        # v3
src/components/marketing/site-footer.tsx                    # v3
src/components/marketing/site-header.tsx                    # v3
src/components/shell/app-shell.tsx                          # v3
src/components/shell/page-header.tsx                        # v3
src/components/shell/user-menu.tsx                          # v3
src/components/brand/logo.tsx                               # marca v3
src/components/af/*.tsx                                     # tokens v3 + Anton
src/components/charts/*.tsx                                 # cores v3
prisma/schema.prisma                                        # CheckoutSession + lojista geo
prisma/seed.ts                                              # seed enriquecido com geo + service tags
```

### Deletar
```
src/app/(entrepreneur)/app/score/                           # vira /saude
src/app/(entrepreneur)/app/fiado/[supplierId]/              # MEI não compra no nosso marketplace
src/components/af/score-ring.tsx                            # repensar (renomear pra saude-meter?)
```

### Manter sem mudança funcional
```
src/lib/auth.ts, db.ts, password.ts, queries.ts, pricing.ts, format.ts, utils.ts
src/lib/scoring.ts                                          # backend engine, fica
src/lib/receivables.ts                                      # backend trava, fica
src/app/api/sim/pix/route.ts                                # trava simulação, fica
src/components/ui/*                                         # shadcn primitives
src/proxy.ts                                                # proxy Next 16
```

---

## 7. Ordem de implementação (fases)

### Fase 0 — Base de design (½ dia)
- Atualizar `globals.css` com tokens v3 (preto, dourado, creme, etc.).
- Importar Anton via Google Fonts em `layout.tsx`.
- Atualizar `components/af/*` pra usar nova paleta + Anton.
- Atualizar `components/brand/logo.tsx`.

### Fase 1 — Backend do checkout (½ dia)
- Migração Prisma: `CheckoutSession`, campos geo + tags em `SupplierProfile`.
- `src/lib/checkout.ts` — gerador de code (formato `AF7K-9M2C-X1`), expiração, validação.
- Endpoints `/api/v1/checkout/*`.
- Atualizar `prisma/seed.ts` com lat/lng + serviceTags pros lojistas seed.

### Fase 2 — Tela do lojista (cobrar) (1 dia)
- `/fornecedor/cobrar` — form de criação (cliente + itens + prazo + total).
- QR Display lado direito.
- Server action que chama `POST /api/v1/checkout` e retorna o code.
- Polling client-side a cada 2s consultando `GET /api/v1/checkout/[code]` (sem SSE — mais simples e suficiente).
- Adicionar item ao `_nav.ts`.

### Fase 3 — Tela do MEI (pay) (1 dia)
- `/pay/[code]` — confirmação mobile-first.
- Login/cadastro express integrado (se MEI não tá logada).
- Server action de confirmação chamando `POST /api/v1/checkout/[code]/confirm`.
- Tela de sucesso.

### Fase 4 — Landing v3 (1 dia)
- Refazer `src/app/page.tsx` seguindo mockup v3 do brainstorm:
  - Hero com foto + receipt chip + citação.
  - Trust strip.
  - Como funciona (lojista + MEI side-by-side).
  - Manifesto strip dourado.
  - Numbers grid.
  - Seção "API pra marketplaces" com code snippet + badge "powered by".
  - Seção "parceiros que integram" com logos fake.
  - Testimonial.
  - CTA final.
  - Footer v3.

### Fase 5 — Marketplace demo + docs API (½ dia)
- `/demo-marketplace` — página fake "Feira Preta" com 1 produto e botão "Pagar com AceitoFiado".
- Modal/sheet abrindo o checkout (reusa `/pay/[code]` em iframe ou redirect).
- `/docs/api` — markdown estilizado com endpoints, exemplos de request/response, code snippet `aceitofiado.checkout({...})`.

### Fase 6 — App MEI refresh (1 dia)
- Dashboard `/app` redesenhado (sem palavra "score").
- `/app/saude` — antiga score page renomeada e reescrita. Mostra: limite atual aprovado, valor em uso vs livre, canais conectados (Pix/Shopee/Instagram/Feira), tendência de atividade (gráfico simples). Zero menção à palavra "score" ou "pontuação". Lê os mesmos dados que `lib/scoring.ts` produz, só renomeia internamente pra "saúde" na UI.
- `/app/lojistas` — NOVA, com mapa **Leaflet** (`react-leaflet`, com `dynamic import ssr:false`) + filtros (tipo de serviço, bairro). Tiles do OpenStreetMap, sem chave de API.
- `/app/fiado` — sem catalog shopper, só histórico/status.
- `/app/trava` — visual v3.
- `/app/historico` — visual v3.

### Fase 7 — App lojista refresh (½ dia)
- Dashboard `/fornecedor` redesenhado.
- `/fornecedor/operacoes`, `/pedidos`, `/produtos` — refresh visual.

### Fase 8 — Auth refresh (½ dia)
- `/cadastro` e `/entrar` repaginados com v3.

### Fase 9 — QA + Playwright walkthrough (½ dia)
- Rodar Playwright pra clicar em cada um dos 3 fluxos.
- Tirar screenshots de cada tela.
- Ajustes finais de copy e responsividade.

**Total estimado:** 6.5 dias de trabalho focado.

**Recorte pro hackaton (P0 — deve estar pronto pro pitch):**
- Fase 0 (tokens v3 + Anton + paleta)
- Fase 1 (backend checkout)
- Fase 2 (`/fornecedor/cobrar` + QR)
- Fase 3 (`/pay/[code]` + sucesso)
- Fase 4 (landing v3)
- Fase 5 (`/demo-marketplace` + `/docs/api`)

**P1 (se sobrar tempo):** Fases 6-8 (refresh apps internos e auth).
**P2:** Fase 9 (Playwright QA).

---

## 8. Fora de escopo

- Marketplace de lojistas afro real (cadastro público de lojista, fluxo de aprovação) — usamos seed pra hackaton.
- Integração real com B3 / CERC pra registro de duplicata.
- Integração real com Pix de banco real — `/api/sim/pix` continua simulado.
- App nativo iOS/Android — mobile-first web só.
- WhatsApp chatbot real — só mencionado em copy.
- Multi-idioma — pt-BR only.
- Configurações avançadas de lojista (custo da taxa, prazos disponíveis customizados).
- Logout / refresh token / sessão complexa — manter auth manual como está.
- Geocodificação real — coordenadas hardcoded no seed.

---

## 9. Critérios de aceite

- [ ] Landing `/` carrega com identidade v3 (preto + dourado + Anton + foto real).
- [ ] Lojista logado consegue ir em `/fornecedor/cobrar`, criar uma cobrança e ver o QrCode + link.
- [ ] MEI consegue abrir `/pay/[code]` (não logada), fazer login express, confirmar e ver tela de sucesso.
- [ ] `/demo-marketplace` mostra checkout fake e botão "Pagar com AceitoFiado" funciona, redirecionando pra `/pay/[code]` e voltando.
- [ ] `/docs/api` exibe documentação curta com endpoints + snippet `aceitofiado.checkout()`.
- [ ] `/app/saude` substitui `/app/score`. Em nenhum lugar do site público aparece a palavra "score".
- [ ] `/app/lojistas` tem mapa funcional com pins clicáveis + filtros por tipo de serviço.
- [ ] Trava continua funcionando no backend (`/api/sim/pix`) e visível em `/app/trava`.
- [ ] Build Next.js passa sem erros. `pnpm lint` e `pnpm tsc --noEmit` passam.

---

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Tempo apertado pra hackaton | Paralelizar fases, focar em P0 (landing + lojista cobrar + MEI pay + demo marketplace). Outros refreshs viram P1. |
| Foto real "errada" no hero | Já validamos foto A (Christina Morillo, Unsplash `1531123897727-8f129e1688ce`) com user. |
| Webhook real impossível no demo | `/demo-marketplace` faz tudo local — sem dependência externa. |
| Mapa Leaflet pode quebrar SSR | Usar dynamic import com `ssr: false`. |
| Migration Prisma quebra dados seed | Reseed em dev. Não há produção. |
| Palavra "score" escapa | Grep CI: `grep -ri "score" src/app/ --include="*.tsx" --include="*.ts"` e proibir em copy strings (vars internas permitidas). |
