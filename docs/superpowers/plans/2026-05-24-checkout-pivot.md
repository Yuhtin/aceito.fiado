# Checkout Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar AceitoFiado como checkout (presencial via QR Code + API marketplace), aplicar identidade visual v3 (preto + dourado + Anton + foto real), e remover a palavra "score" do site público.

**Architecture:** Next.js 16 App Router. Backend Prisma + Postgres. Sessões manuais (cookie httpOnly). Server actions pra UI interna. `/api/v1/checkout/*` endpoints REST pra integração externa. Polling client-side de 2s pra confirmar fiado no lado do lojista. Mapa Leaflet com OSM (sem chave de API). Tudo em pt-BR.

**Tech Stack:** Next 16.2 · React 19.2 · TypeScript · Prisma 6 · Postgres 16 (Docker porta 5433) · TailwindCSS v4 · shadcn/ui · sonner · zod · react-leaflet · Anton (Google Fonts) · Inter · Geist Mono · Playwright (validação visual).

**Spec:** `docs/superpowers/specs/2026-05-24-checkout-pivot-design.md`

**Escopo deste plano:** Fases 0-5 do spec (P0 pro hackaton). Fases 6-9 (refresh apps internos, auth, QA estendido) ficam pra plano sequencial.

---

## Pre-flight

- [ ] **PF.1: Verificar dev environment**

```bash
# Banco rodando na porta 5433?
docker compose ps postgres

# Se não, sobe
pnpm db:up

# Schema sincronizado?
pnpm prisma db push --skip-generate
pnpm prisma generate

# Dev server roda?
pnpm dev
# Esperado: http://localhost:3010 carrega sem erro
```

Verificar que `.env` tem `DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aceitofiado?schema=public"`.

- [ ] **PF.2: Instalar dependências novas**

```bash
pnpm add react-leaflet leaflet
pnpm add -D @types/leaflet
pnpm add qrcode
pnpm add -D @types/qrcode
```

Verificar `package.json`. Commit em PF.3.

- [ ] **PF.3: Commit das dependências**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: leaflet + qrcode pro checkout pivot

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 0 — Design tokens v3 + tipografia

**Files affected:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/af/*`, `src/components/brand/logo.tsx`

### Task 0.1: Importar Anton + atualizar fontes no root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Ler estado atual**

```bash
cat src/app/layout.tsx
```

- [ ] **Step 2: Atualizar imports e font config**

Substituir o conteúdo de `src/app/layout.tsx` por:

```tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono, Anton } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  variable: "--af-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--af-mono",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--af-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AceitoFiado · checkout pra MEI afro",
  description:
    "Checkout pra lojista cobrar fiado de MEI afro. Sem Serasa, sem peneira, sem letrinha miúda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verificar build**

```bash
pnpm tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(design): add Anton display font + reorg root layout

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 0.2: Reescrever tokens em globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Sobrescrever os tokens af-* com paleta v3**

Substituir o bloco `:root { ... }` de tokens (e dark mode se existir) por:

```css
:root {
  /* paleta v3 — preto + dourado + creme */
  --af-preto: #0a0a0a;
  --af-preto-soft: #1a1410;
  --af-branco: #fafafa;
  --af-creme: #f8f4ed;
  --af-creme-2: #f3ebd9;
  --af-borda: #ece5d5;
  --af-borda-soft: rgba(13, 13, 13, 0.08);
  --af-cinza: #6b645c;
  --af-cinza-soft: #a39c92;
  --af-dourado: #d4a017;
  --af-dourado-soft: rgba(212, 160, 23, 0.12);
  --af-dourado-dark: #b07d10;
  --af-sucesso: #16a34a;
  --af-laranja: #e8521a;
  --af-vermelho: #b91c1c;

  /* aliases legados — mantém compat com componentes existentes */
  --af-paper: var(--af-creme);
  --af-paper-2: var(--af-creme-2);
  --af-paper-3: #ddd4be;
  --af-ink: var(--af-preto);
  --af-ink-deep: var(--af-preto);
  --af-ink-2: var(--af-cinza);
  --af-ink-3: var(--af-cinza-soft);
  --af-ink-soft: var(--af-cinza-soft);
  --af-ink-08: rgba(13, 13, 13, 0.08);
  --af-ink-12: rgba(13, 13, 13, 0.12);
  --af-terra: var(--af-laranja);
  --af-terra-2: var(--af-laranja);
  --af-terra-soft: rgba(232, 82, 26, 0.12);
  --af-dende: var(--af-dourado);
  --af-acafrao: var(--af-dourado);
  --af-mata: #15413a;
  --af-mata-2: #1f6557;
  --af-brasa: var(--af-laranja);
  --af-cobre: #92400e;

  /* sombras */
  --af-shadow-lift: 0 20px 60px rgba(0, 0, 0, 0.18);
  --af-shadow-card: 0 4px 12px rgba(0, 0, 0, 0.04);
  --af-shadow-strong: 0 30px 80px rgba(0, 0, 0, 0.35);

  /* radius */
  --radius: 12px;

  /* shadcn bridge */
  --background: var(--af-creme);
  --foreground: var(--af-preto);
  --card: var(--af-branco);
  --card-foreground: var(--af-preto);
  --popover: var(--af-branco);
  --popover-foreground: var(--af-preto);
  --primary: var(--af-preto);
  --primary-foreground: var(--af-branco);
  --secondary: var(--af-creme-2);
  --secondary-foreground: var(--af-preto);
  --muted: var(--af-creme-2);
  --muted-foreground: var(--af-cinza);
  --accent: var(--af-dourado);
  --accent-foreground: var(--af-preto);
  --destructive: var(--af-vermelho);
  --success: var(--af-sucesso);
  --success-foreground: var(--af-branco);
  --warning: var(--af-laranja);
  --warning-foreground: var(--af-branco);
  --border: var(--af-borda);
  --input: var(--af-borda);
  --ring: var(--af-dourado);
}

/* utility classes globais */
.af-screen {
  background: var(--af-creme);
  color: var(--af-preto);
}
.af-display {
  font-family: var(--af-display), "Anton", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 0.95;
  font-weight: 400;
}
.af-h-tight {
  font-family: var(--af-display), system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.015em;
  line-height: 0.92;
  font-weight: 400;
}
.af-h {
  font-family: var(--af-sans), system-ui, sans-serif;
  letter-spacing: -0.02em;
  font-weight: 600;
}
.af-body {
  font-family: var(--af-sans), system-ui, sans-serif;
  font-weight: 400;
  line-height: 1.5;
}
.af-mono,
.af-n {
  font-family: var(--af-mono), ui-monospace, monospace;
}
.af-eb {
  font-family: var(--af-mono), ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--af-cinza);
  font-weight: 500;
}
.af-placeholder {
  background: var(--af-creme-2);
  color: var(--af-cinza);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--af-mono), monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

Manter os outros bloços `@import`, `@theme inline`, `@custom-variant` no topo.

- [ ] **Step 2: Verificar dev server**

```bash
pnpm dev
```

Abrir `http://localhost:3010` e visualizar. Esperado: ainda carrega (cores diferentes, layout pode ficar quebrado em algumas páginas — vamos consertar nas próximas tarefas).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): paleta v3 (preto+dourado+creme) em globals.css

Aliases legados mantêm compat com componentes af/* enquanto eles são
atualizados. Anton via --af-display, Inter via --af-sans, Geist Mono
via --af-mono. Sem palavra 'score' aqui — só tokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 0.3: Atualizar logo pro novo lockup

**Files:**
- Modify: `src/components/brand/logo.tsx`
- Modify: `src/components/af/logo.tsx`

- [ ] **Step 1: Ler estado atual**

```bash
cat src/components/brand/logo.tsx
cat src/components/af/logo.tsx
```

- [ ] **Step 2: Reescrever `src/components/brand/logo.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
  showText?: boolean;
}

export function Logo({
  size = 28,
  color = "var(--af-preto)",
  accent = "var(--af-dourado)",
  className,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        style={{
          width: size,
          height: size,
          background: accent,
          borderRadius: size * 0.22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--af-preto)",
          fontFamily: "var(--af-display), system-ui, sans-serif",
          fontSize: size * 0.62,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        A
      </div>
      {showText && (
        <span
          className="af-display"
          style={{
            color,
            fontSize: size * 0.78,
            lineHeight: 1,
          }}
        >
          AceitoFiado
        </span>
      )}
    </div>
  );
}

export { Logo as AfLogo };
```

- [ ] **Step 3: Atualizar `src/components/af/logo.tsx` pra reexportar**

```tsx
export { Logo as AfLogo } from "@/components/brand/logo";
```

- [ ] **Step 4: Validar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/brand/logo.tsx src/components/af/logo.tsx
git commit -m "feat(design): novo lockup do logo — quadrado dourado + Anton

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 0.4: Atualizar primitivos af/* pros tokens v3

**Files:**
- Modify: `src/components/af/primitives.tsx`

- [ ] **Step 1: Ler estado atual**

```bash
cat src/components/af/primitives.tsx
```

- [ ] **Step 2: Atualizar AfButton variant primary**

Localizar `export function AfButton` (provavelmente no início do arquivo). Na variant `"primary"`, substituir o bloco de styles por:

```ts
primary: {
  background: "var(--af-dourado)",
  color: "var(--af-preto)",
  fontFamily: "var(--af-display), system-ui, sans-serif",
  textTransform: "uppercase" as const,
  letterSpacing: "0.01em",
  fontWeight: 400,
}
```

- [ ] **Step 3: Atualizar Eyebrow pra tokens consistentes**

Localizar `export function Eyebrow`. Garantir que o style usa:

```ts
fontFamily: "var(--af-mono), ui-monospace, monospace",
fontSize: 11,
letterSpacing: "0.12em",
textTransform: "uppercase",
color: color ?? "var(--af-cinza)",
fontWeight: 500,
```

- [ ] **Step 4: PulseDot e Tag — só trocar default color**

Em `PulseDot`, mudar default de `color` pra `"var(--af-dourado)"`.
Em `Tag`, mudar default de `color` pra `"var(--af-dourado)"`.
Em `GradientMesh`, mudar gradient base — variante clara usa `var(--af-creme)` em vez de paper antigo, variante `dark` usa `var(--af-preto)`.

(Nota: outros componentes legacy do af/* que ficam visíveis só em apps internos serão refatorados num plano P1 sequencial. Este plano só toca o necessário pra Phase 4 não quebrar.)

- [ ] **Step 3: Verificar visualmente**

```bash
pnpm dev
```

Abrir `http://localhost:3010` — landing renderiza com paleta nova (mesmo que layout antigo ainda esteja parcialmente). Sem erros no console.

- [ ] **Step 4: Commit**

```bash
git add src/components/af/primitives.tsx
git commit -m "feat(design): primitivos af/* migrados pra tokens v3

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 0.5: Criar componente DisplayHeading reusável

**Files:**
- Create: `src/components/af/display-heading.tsx`
- Modify: `src/components/af/index.ts`

- [ ] **Step 1: Criar arquivo**

```tsx
// src/components/af/display-heading.tsx
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface DisplayHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function DisplayHeading({
  children,
  as: Tag = "h2",
  size = 48,
  color = "var(--af-preto)",
  className,
  style,
}: DisplayHeadingProps) {
  return (
    <Tag
      className={cn("af-display", className)}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Exportar via `src/components/af/index.ts`**

Adicionar linha:

```ts
export { DisplayHeading } from "./display-heading";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/af/display-heading.tsx src/components/af/index.ts
git commit -m "feat(design): componente DisplayHeading (Anton + uppercase)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 1 — Backend checkout

### Task 1.1: Adicionar CheckoutSession ao schema Prisma

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Adicionar enums e modelo**

Inserir ao final dos enums (após `DuplicataStatus`):

```prisma
enum CheckoutSource {
  QR_PRESENCIAL
  API_MARKETPLACE
}

enum CheckoutStatus {
  PENDING
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

Inserir ao final dos modelos:

```prisma
model CheckoutSession {
  id             String          @id @default(cuid())
  code           String          @unique
  supplierId     String
  entrepreneurId String?
  amount         BigInt
  items          Json
  prazo          Int
  source         CheckoutSource  @default(QR_PRESENCIAL)
  status         CheckoutStatus  @default(PENDING)
  expiresAt      DateTime
  confirmedAt    DateTime?
  orderId        String?         @unique

  // API marketplace
  marketplaceId String?
  successUrl    String?
  webhookUrl    String?
  cancelUrl     String?

  supplier     SupplierProfile      @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  entrepreneur EntrepreneurProfile? @relation(fields: [entrepreneurId], references: [id])
  order        Order?               @relation(fields: [orderId], references: [id])

  createdAt DateTime @default(now())

  @@index([code])
  @@index([supplierId, status])
}
```

- [ ] **Step 2: Adicionar relações reversas**

Em `model SupplierProfile`, adicionar:

```prisma
  checkoutSessions CheckoutSession[]
```

Em `model EntrepreneurProfile`, adicionar:

```prisma
  checkoutSessions CheckoutSession[]
```

Em `model Order`, adicionar:

```prisma
  checkoutSession CheckoutSession?
```

- [ ] **Step 3: Adicionar campos geo + serviceTags no SupplierProfile**

Localizar `model SupplierProfile` e adicionar antes de `createdAt`:

```prisma
  latitude    Float?
  longitude   Float?
  serviceTags String[]  @default([])
```

- [ ] **Step 4: Validar schema**

```bash
pnpm prisma validate
```

Esperado: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 5: Migrar**

```bash
pnpm prisma migrate dev --name add_checkout_session_and_geo
pnpm prisma generate
```

Esperado: migration aplicada, client regenerado.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): CheckoutSession + geo/serviceTags em SupplierProfile

Modelo central pro pivot de checkout. Suporta QR presencial e
integração via API com source enum. Geo permite mapa em /app/lojistas.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.2: Criar lib/checkout.ts com gerador de código

**Files:**
- Create: `src/lib/checkout.ts`
- Create: `src/lib/__tests__/checkout.test.ts`

- [ ] **Step 1: Verificar se há test runner**

```bash
ls vitest.config.* 2>/dev/null || ls jest.config.* 2>/dev/null
```

Se não houver, pular tests automatizados nesta task — validar manualmente via `tsx` no Step 5.

- [ ] **Step 2: Criar `src/lib/checkout.ts`**

```ts
// src/lib/checkout.ts
// Helpers pra CheckoutSession: geração de código curto, validação de prazo,
// cálculo de expiração e taxa AceitoFiado.

import "server-only";

import { db } from "@/lib/db";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTVWXYZ23456789"; // sem I, O, U, 0, 1
const CODE_BLOCK_SIZE = 4;
const CODE_BLOCKS = 3;
const PRAZO_OPTIONS = [15, 30, 45, 60] as const;
const CHECKOUT_TTL_MINUTES = 30;
const FEE_BPS = 500; // 5% — taxa AceitoFiado padrão

export type PrazoOption = (typeof PRAZO_OPTIONS)[number];

export function isValidPrazo(value: number): value is PrazoOption {
  return PRAZO_OPTIONS.includes(value as PrazoOption);
}

/**
 * Gera código curto formato AF7K-9M2C-X1 (12 chars + 2 hífens).
 * Prefixa "AF" só no display — armazenamos sem hífens uppercase.
 */
function randomCode(): string {
  let raw = "";
  for (let i = 0; i < CODE_BLOCK_SIZE * CODE_BLOCKS; i++) {
    raw += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return raw;
}

export function formatCode(raw: string): string {
  // AFXKQ9M2CX1Z → AFXK-Q9M2-CX1Z
  const blocks: string[] = [];
  for (let i = 0; i < raw.length; i += CODE_BLOCK_SIZE) {
    blocks.push(raw.slice(i, i + CODE_BLOCK_SIZE));
  }
  return blocks.join("-");
}

export function parseCode(formatted: string): string {
  return formatted.replace(/-/g, "").toUpperCase();
}

/**
 * Tenta gerar um código único (até 5 tentativas). Lança se colidir.
 */
export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await db.checkoutSession.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("não conseguiu gerar code único em 5 tentativas");
}

export function expirationFromNow(): Date {
  return new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000);
}

export interface CheckoutPricing {
  amount: number; // centavos
  feeBps: number;
  feeCents: number;
  totalCents: number;
}

export function calculatePricing(amountCents: number): CheckoutPricing {
  const feeCents = Math.round((amountCents * FEE_BPS) / 10000);
  return {
    amount: amountCents,
    feeBps: FEE_BPS,
    feeCents,
    totalCents: amountCents + feeCents,
  };
}

export const PRAZO_OPTIONS_LIST = PRAZO_OPTIONS;
export { CODE_ALPHABET, CHECKOUT_TTL_MINUTES, FEE_BPS };
```

- [ ] **Step 3: Validar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 4: Smoke test via tsx**

Criar arquivo temp `scripts/checkout-smoke.ts`:

```ts
import {
  formatCode,
  parseCode,
  isValidPrazo,
  calculatePricing,
} from "../src/lib/checkout";

console.log("formatCode AFXKQ9M2CX1Z →", formatCode("AFXKQ9M2CX1Z"));
console.log("parseCode AFXK-Q9M2-CX1Z →", parseCode("AFXK-Q9M2-CX1Z"));
console.log("isValidPrazo 30 →", isValidPrazo(30));
console.log("isValidPrazo 99 →", isValidPrazo(99));
console.log("pricing R$ 574 →", calculatePricing(57400));
```

Rodar:

```bash
pnpm tsx scripts/checkout-smoke.ts
```

Esperado:
```
formatCode AFXKQ9M2CX1Z → AFXK-Q9M2-CX1Z
parseCode AFXK-Q9M2-CX1Z → AFXKQ9M2CX1Z
isValidPrazo 30 → true
isValidPrazo 99 → false
pricing R$ 574 → { amount: 57400, feeBps: 500, feeCents: 2870, totalCents: 60270 }
```

Apagar `scripts/checkout-smoke.ts` depois de validar.

```bash
rm scripts/checkout-smoke.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/checkout.ts
git commit -m "feat(checkout): lib/checkout — code gen, pricing, prazo validation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.3: Endpoint POST /api/v1/checkout (criar)

**Files:**
- Create: `src/app/api/v1/checkout/route.ts`

- [ ] **Step 1: Criar arquivo**

```ts
// src/app/api/v1/checkout/route.ts
// POST cria uma CheckoutSession. Aceita 2 modos:
// - QR_PRESENCIAL: chamado por lojista logado via server action interna
//   (autoriza por sessão httpOnly)
// - API_MARKETPLACE: chamado por marketplace externo (Bearer token mock pro MVP)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
  isValidPrazo,
} from "@/lib/checkout";

const ItemSchema = z.object({
  name: z.string().min(1).max(120),
  qty: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

const CreateCheckoutSchema = z.object({
  supplierId: z.string().min(1).optional(),
  amount: z.number().int().positive(),
  items: z.array(ItemSchema).min(1),
  prazo: z.number().int(),
  entrepreneurCpf: z.string().optional(),
  marketplaceId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = CreateCheckoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  if (!isValidPrazo(body.prazo)) {
    return NextResponse.json(
      { error: "invalid_prazo", allowed: [15, 30, 45, 60] },
      { status: 400 },
    );
  }

  // Determinar fonte e supplierId
  let supplierId: string;
  let source: "QR_PRESENCIAL" | "API_MARKETPLACE";

  if (body.marketplaceId) {
    source = "API_MARKETPLACE";
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing_token" }, { status: 401 });
    }
    if (!body.supplierId) {
      return NextResponse.json(
        { error: "supplierId_required_for_marketplace" },
        { status: 400 },
      );
    }
    supplierId = body.supplierId;
  } else {
    source = "QR_PRESENCIAL";
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPPLIER" || !user.supplierId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    supplierId = user.supplierId;
  }

  // Resolver entrepreneurId via CPF (cnpj no schema atual representa o doc)
  let entrepreneurId: string | undefined;
  if (body.entrepreneurCpf) {
    const ent = await db.entrepreneurProfile.findUnique({
      where: { cnpj: body.entrepreneurCpf },
      select: { id: true },
    });
    entrepreneurId = ent?.id;
  }

  const code = await generateUniqueCode();

  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId,
      entrepreneurId,
      amount: BigInt(body.amount),
      items: body.items,
      prazo: body.prazo,
      source,
      expiresAt: expirationFromNow(),
      marketplaceId: body.marketplaceId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      webhookUrl: body.webhookUrl,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3010";
  const payUrl = `${baseUrl}/pay/${formatCode(code)}`;

  return NextResponse.json({
    id: session.id,
    code: formatCode(code),
    payUrl,
    expiresAt: session.expiresAt.toISOString(),
    status: session.status,
  });
}
```

- [ ] **Step 2: Validar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Smoke test manual**

Levantar dev server (`pnpm dev`) em outro terminal. Pegar um supplierId de um seed user existente:

```bash
pnpm prisma studio
# anotar um id de SupplierProfile
```

Cancelar studio. Testar:

```bash
curl -X POST http://localhost:3010/api/v1/checkout \
  -H "content-type: application/json" \
  -H "authorization: Bearer demo-token" \
  -d '{"supplierId":"<id-do-supplier>","marketplaceId":"feirapreta","amount":18900,"items":[{"name":"Turbante","qty":1,"priceCents":18900}],"prazo":30,"successUrl":"https://demo.com/ok","cancelUrl":"https://demo.com/cancel"}'
```

Esperado: JSON `{ code: "AFXK-Q9M2-CX1Z", payUrl: "...", status: "PENDING" }`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/checkout/route.ts
git commit -m "feat(api): POST /api/v1/checkout — cria sessão (QR ou marketplace)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.4: Endpoint GET /api/v1/checkout/[code]

**Files:**
- Create: `src/app/api/v1/checkout/[code]/route.ts`

- [ ] **Step 1: Criar arquivo**

```ts
// src/app/api/v1/checkout/[code]/route.ts
// GET retorna dados pra MEI confirmar fiado.
// Público — qualquer um com o code pode ler (UX: link compartilhável).

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { calculatePricing, formatCode, parseCode } from "@/lib/checkout";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const code = parseCode(rawCode);

  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          addressNeighborhood: true,
          addressCity: true,
          addressState: true,
          logoUrl: true,
          category: true,
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const expired =
    session.status === "PENDING" && session.expiresAt < new Date();

  const pricing = calculatePricing(Number(session.amount));

  return NextResponse.json({
    code: formatCode(session.code),
    status: expired ? "EXPIRED" : session.status,
    amount: pricing.amount,
    feeCents: pricing.feeCents,
    totalCents: pricing.totalCents,
    prazo: session.prazo,
    items: session.items,
    expiresAt: session.expiresAt.toISOString(),
    confirmedAt: session.confirmedAt?.toISOString() ?? null,
    supplier: session.supplier,
    source: session.source,
    successUrl: session.successUrl,
    cancelUrl: session.cancelUrl,
  });
}
```

- [ ] **Step 2: Validar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Smoke test**

```bash
curl http://localhost:3010/api/v1/checkout/AFXK-Q9M2-CX1Z
```

(Substituir pelo code retornado em Task 1.3 Step 3.)

Esperado: JSON com `supplier`, `pricing`, `items`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/checkout/[code]/route.ts
git commit -m "feat(api): GET /api/v1/checkout/[code] — leitura pública

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.5: Endpoint POST /api/v1/checkout/[code]/confirm

**Files:**
- Create: `src/app/api/v1/checkout/[code]/confirm/route.ts`

- [ ] **Step 1: Criar arquivo**

```ts
// src/app/api/v1/checkout/[code]/confirm/route.ts
// POST confirma fiado: cria Order, atualiza sessão, dispara webhook (best-effort).
// Requer MEI logada (sessão).

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePricing, parseCode } from "@/lib/checkout";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ENTREPRENEUR" || !user.entrepreneurId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code: rawCode } = await params;
  const code = parseCode(rawCode);

  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: { supplier: true },
  });

  if (!session) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (session.status !== "PENDING") {
    return NextResponse.json(
      { error: "not_pending", status: session.status },
      { status: 409 },
    );
  }
  if (session.expiresAt < new Date()) {
    await db.checkoutSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  const pricing = calculatePricing(Number(session.amount));
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + session.prazo);

  const order = await db.order.create({
    data: {
      entrepreneurId: user.entrepreneurId,
      supplierId: session.supplierId,
      status: "FUNDED",
      subtotalCents: BigInt(pricing.amount),
      supplierDiscountBps: 300,
      supplierReceiveCents: BigInt(
        pricing.amount - Math.round((pricing.amount * 300) / 10000),
      ),
      customerInterestBps: pricing.feeBps,
      customerPayCents: BigInt(pricing.totalCents),
      termDays: session.prazo,
      platformFeeCents: BigInt(pricing.feeCents),
      captureRateBps: 3000,
      confirmedAt: new Date(),
      fundedAt: new Date(),
      dueDate,
    },
  });

  await db.checkoutSession.update({
    where: { id: session.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      entrepreneurId: user.entrepreneurId,
      orderId: order.id,
    },
  });

  // Webhook best-effort
  if (session.source === "API_MARKETPLACE" && session.webhookUrl) {
    fetch(session.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: session.code,
        status: "CONFIRMED",
        amount: pricing.amount,
        orderId: order.id,
        confirmedAt: new Date().toISOString(),
      }),
    }).catch(() => {
      // log silencioso pro MVP
    });
  }

  return NextResponse.json({
    orderId: order.id,
    status: "CONFIRMED",
    dueDate: dueDate.toISOString(),
    totalCents: pricing.totalCents,
    successUrl: session.successUrl,
  });
}
```

- [ ] **Step 2: Validar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/v1/checkout/[code]/confirm/route.ts
git commit -m "feat(api): POST /api/v1/checkout/[code]/confirm — confirma fiado

Cria Order com status FUNDED, marca sessão CONFIRMED, dispara webhook
best-effort se source = API_MARKETPLACE.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.6: Enriquecer seed com geo + serviceTags

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Ler estado atual do seed**

```bash
head -200 prisma/seed.ts
```

- [ ] **Step 2: Adicionar geo + tags nos suppliers existentes**

Localizar a criação de SupplierProfile no seed e adicionar campos. Exemplo (adaptar à estrutura real do arquivo):

```ts
// Para cada criação de supplier, adicionar:
{
  // ... campos existentes
  latitude: -23.6105,    // Heliópolis
  longitude: -46.6121,
  serviceTags: ["têxtil", "biquíni", "moda praia"],
}
```

Coordenadas sugeridas pros 3 suppliers do seed:
- `Distribuidora Tropical Brás` → `lat: -23.5275, lng: -46.6394` (Brás/SP), tags: `["têxtil", "atacado", "estampa"]`
- `Atacado Afro Cosméticos` → `lat: -23.5587, lng: -46.6520` (Bela Vista/SP), tags: `["cosméticos", "cabelo crespo", "beleza preta"]`
- `Brás Têxteis Estampas` → `lat: -23.5280, lng: -46.6310` (Brás/SP), tags: `["têxtil", "estampa", "atacado"]`

- [ ] **Step 3: Rodar seed**

```bash
pnpm db:reset
pnpm db:seed
```

Esperado: seed roda sem erro.

- [ ] **Step 4: Verificar via studio**

```bash
pnpm db:studio
```

Abrir `SupplierProfile` — confirmar lat/lng/serviceTags preenchidos.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(seed): adicionar geo + serviceTags aos suppliers seed

Necessário pro mapa em /app/lojistas com filtros por tipo de serviço.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2 — Tela do lojista: cobrar fiado

### Task 2.1: Estrutura base da página /fornecedor/cobrar

**Files:**
- Create: `src/app/(supplier)/fornecedor/cobrar/page.tsx`
- Create: `src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx`
- Create: `src/app/(supplier)/fornecedor/cobrar/_actions.ts`
- Modify: `src/app/(supplier)/fornecedor/_nav.ts`

- [ ] **Step 1: Criar `page.tsx` (server component)**

```tsx
// src/app/(supplier)/fornecedor/cobrar/page.tsx
import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";

import { CobrarForm } from "./cobrar-form";

export default async function CobrarPage() {
  const user = await requireSupplier();

  const supplier = await db.supplierProfile.findUnique({
    where: { id: user.supplierId },
    select: { id: true, businessName: true },
  });

  if (!supplier) {
    throw new Error("supplier não encontrado");
  }

  return (
    <CobrarForm
      supplierId={supplier.id}
      supplierName={supplier.businessName}
    />
  );
}
```

- [ ] **Step 2: Criar `_actions.ts`**

```ts
// src/app/(supplier)/fornecedor/cobrar/_actions.ts
"use server";

import { revalidatePath } from "next/cache";

import { requireSupplier } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
  isValidPrazo,
} from "@/lib/checkout";

export interface CobrarItem {
  name: string;
  qty: number;
  priceCents: number;
}

export interface CobrarResult {
  code: string;
  payUrl: string;
  expiresAt: string;
}

export async function createCheckoutAction(input: {
  entrepreneurCpf?: string;
  items: CobrarItem[];
  prazo: number;
}): Promise<{ ok: true; data: CobrarResult } | { ok: false; error: string }> {
  const user = await requireSupplier();

  if (!input.items.length) {
    return { ok: false, error: "adicione pelo menos um item" };
  }
  if (!isValidPrazo(input.prazo)) {
    return { ok: false, error: "prazo inválido (use 15, 30, 45 ou 60)" };
  }

  const amount = input.items.reduce(
    (sum, it) => sum + it.priceCents * it.qty,
    0,
  );
  if (amount <= 0) {
    return { ok: false, error: "valor total deve ser positivo" };
  }

  let entrepreneurId: string | undefined;
  if (input.entrepreneurCpf) {
    const ent = await db.entrepreneurProfile.findUnique({
      where: { cnpj: input.entrepreneurCpf.replace(/\D/g, "") },
      select: { id: true },
    });
    entrepreneurId = ent?.id;
  }

  const code = await generateUniqueCode();
  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId: user.supplierId,
      entrepreneurId,
      amount: BigInt(amount),
      items: input.items,
      prazo: input.prazo,
      source: "QR_PRESENCIAL",
      expiresAt: expirationFromNow(),
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3010";
  const formatted = formatCode(code);

  revalidatePath("/fornecedor/cobrar");

  return {
    ok: true,
    data: {
      code: formatted,
      payUrl: `${baseUrl}/pay/${formatted}`,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}

export async function getCheckoutStatus(code: string) {
  await requireSupplier();
  const raw = code.replace(/-/g, "").toUpperCase();
  const session = await db.checkoutSession.findUnique({
    where: { code: raw },
    select: { status: true, confirmedAt: true, orderId: true },
  });
  return session;
}
```

- [ ] **Step 3: Criar `cobrar-form.tsx` (skeleton; UI nas próximas tasks)**

```tsx
// src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createCheckoutAction, type CobrarItem } from "./_actions";

interface Props {
  supplierId: string;
  supplierName: string;
}

export function CobrarForm({ supplierName }: Props) {
  const [items, setItems] = useState<CobrarItem[]>([]);
  const [cpf, setCpf] = useState("");
  const [prazo, setPrazo] = useState<number>(30);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    payUrl: string;
  } | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    const res = await createCheckoutAction({
      entrepreneurCpf: cpf || undefined,
      items,
      prazo,
    });
    setGenerating(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setResult(res.data);
    toast.success("QrCode gerado");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-0 min-h-[calc(100vh-120px)]">
      <div className="p-8 bg-[var(--af-creme)]">
        <p className="af-eb">nova cobrança · {supplierName}</p>
        <h1 className="af-display text-[28px] mt-2 mb-6 text-[var(--af-preto)]">
          Quem é a cliente?
        </h1>
        {/* form vai aqui — preenchido em 2.2-2.4 */}
        <button
          onClick={handleGenerate}
          disabled={generating || items.length === 0}
          className="w-full mt-4 p-3 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold disabled:opacity-40"
        >
          {generating ? "gerando..." : "gerar QrCode →"}
        </button>
      </div>
      <div className="bg-[var(--af-preto)] p-9 text-[var(--af-branco)] flex flex-col items-center justify-center text-center">
        {result ? (
          <p className="font-mono text-sm">{result.payUrl}</p>
        ) : (
          <p className="af-eb text-[var(--af-cinza-soft)]">
            preencha e gere o QrCode
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Adicionar entrada no _nav.ts do fornecedor**

Ler `src/app/(supplier)/fornecedor/_nav.ts` e adicionar item "Cobrar fiado" apontando pra `/fornecedor/cobrar` na primeira posição (ou onde fizer sentido como destaque).

- [ ] **Step 5: Verificar tipos + rota**

```bash
pnpm tsc --noEmit
pnpm dev
# Navegar pra http://localhost:3010/fornecedor/cobrar (logado como supplier)
```

Esperado: página carrega com skeleton.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(supplier\)/fornecedor/cobrar src/app/\(supplier\)/fornecedor/_nav.ts
git commit -m "feat(lojista): rota /fornecedor/cobrar + skeleton form

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2.2: Campo de busca de cliente MEI

**Files:**
- Modify: `src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx`

- [ ] **Step 1: Adicionar campo de CPF/nome com hint**

Substituir o comentário `{/* form vai aqui — preenchido em 2.2-2.4 */}` por:

```tsx
<div className="mb-5">
  <label className="af-eb block mb-2">CPF ou nome da MEI (opcional)</label>
  <input
    type="text"
    value={cpf}
    onChange={(e) => setCpf(e.target.value)}
    placeholder="132.456.789-90 · Joana Bezerra"
    className="w-full bg-[var(--af-branco)] border border-[var(--af-borda)] rounded-[8px] px-3.5 py-3 text-sm text-[var(--af-preto)]"
  />
  <p className="text-[11px] text-[var(--af-cinza)] mt-1.5 font-mono">
    se a cliente ainda não tem cadastro, ela cria no momento de pagar
  </p>
</div>
```

- [ ] **Step 2: Validar visualmente**

```bash
pnpm dev
```

Abrir página. Campo aparece, tipa e estado atualiza.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(supplier\)/fornecedor/cobrar/cobrar-form.tsx
git commit -m "feat(lojista): campo CPF/nome cliente no cobrar form

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2.3: Lista editável de itens

**Files:**
- Modify: `src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx`

- [ ] **Step 1: Adicionar lista + form de novo item**

Inserir após o campo de CPF (antes do botão gerar):

```tsx
<p className="af-eb mb-2 mt-6">itens da venda</p>
<div className="bg-[var(--af-branco)] rounded-[10px] overflow-hidden border border-[var(--af-borda)]">
  {items.map((item, i) => (
    <div
      key={i}
      className="flex items-center px-3.5 py-3 border-b border-[var(--af-borda)] last:border-b-0 text-[13.5px]"
    >
      <span className="flex-1">{item.name}</span>
      <span className="font-mono text-[12px] text-[var(--af-cinza)] mr-4">
        ×{item.qty}
      </span>
      <span className="af-display text-[18px]">
        R$ {(item.priceCents / 100).toFixed(2).replace(".", ",")}
      </span>
      <button
        onClick={() => setItems(items.filter((_, j) => j !== i))}
        className="ml-3.5 text-[var(--af-cinza)]"
        aria-label="remover"
      >
        ×
      </button>
    </div>
  ))}
  <NewItemRow
    onAdd={(item) => setItems((prev) => [...prev, item])}
  />
</div>
```

Adicionar componente auxiliar abaixo do `CobrarForm`:

```tsx
function NewItemRow({
  onAdd,
}: {
  onAdd: (item: CobrarItem) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  const priceCents = Math.round(
    Number(price.replace(/[^\d,]/g, "").replace(",", ".")) * 100,
  );
  const canAdd = name.trim().length > 0 && qty > 0 && priceCents > 0;

  return (
    <div className="flex items-center gap-2 px-3.5 py-3 bg-[var(--af-creme)]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="nome do item"
        className="flex-1 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-12 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1 text-right font-mono"
        min={1}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="R$ 0,00"
        className="w-24 text-[13px] bg-transparent border-b border-[var(--af-borda)] outline-none py-1 text-right font-mono"
      />
      <button
        onClick={() => {
          if (!canAdd) return;
          onAdd({ name: name.trim(), qty, priceCents });
          setName("");
          setQty(1);
          setPrice("");
        }}
        disabled={!canAdd}
        className="text-[13px] font-medium text-[var(--af-dourado-dark)] disabled:opacity-30"
      >
        + add
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Testar manualmente**

```bash
pnpm dev
```

Adicionar 2-3 itens, remover um, ver state atualizar.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(supplier\)/fornecedor/cobrar/cobrar-form.tsx
git commit -m "feat(lojista): lista editável de itens no cobrar form

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2.4: Seleção de prazo + total

**Files:**
- Modify: `src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx`

- [ ] **Step 1: Adicionar prazo + total antes do botão**

Inserir após a lista de itens:

```tsx
<p className="af-eb mt-6 mb-2">prazo de pagamento</p>
<div className="flex gap-2">
  {[15, 30, 45, 60].map((d) => (
    <button
      key={d}
      onClick={() => setPrazo(d)}
      className={`flex-1 text-center py-2.5 rounded-[8px] font-mono text-[13px] border ${
        prazo === d
          ? "bg-[var(--af-preto)] text-[var(--af-branco)] border-[var(--af-preto)]"
          : "bg-[var(--af-branco)] text-[var(--af-preto)] border-[var(--af-borda)]"
      }`}
    >
      {d}d
    </button>
  ))}
</div>

<div className="mt-4 flex justify-between items-center bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[10px] px-3.5 py-4">
  <span className="af-eb text-[var(--af-cinza-soft)]">Total fiado</span>
  <span className="af-display text-[28px]">
    R${" "}
    {(
      items.reduce((s, it) => s + it.priceCents * it.qty, 0) / 100
    )
      .toFixed(2)
      .replace(".", ",")}
  </span>
</div>
```

- [ ] **Step 2: Validar visualmente**

```bash
pnpm dev
```

Adicionar itens, escolher prazo, ver total atualizar.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(supplier\)/fornecedor/cobrar/cobrar-form.tsx
git commit -m "feat(lojista): seleção de prazo + total fiado

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 2.5: QR Display + polling de confirmação

**Files:**
- Create: `src/components/checkout/qr-display.tsx`
- Modify: `src/app/(supplier)/fornecedor/cobrar/cobrar-form.tsx`

- [ ] **Step 1: Criar componente `qr-display.tsx`**

```tsx
// src/components/checkout/qr-display.tsx
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  payUrl: string;
  code: string;
  amountCents: number;
  prazoDays: number;
  entrepreneurName?: string;
  onConfirmed?: () => void;
  pollFor?: string; // code raw (sem hífens) pra GET status
}

export function QrDisplay({
  payUrl,
  code,
  amountCents,
  prazoDays,
  entrepreneurName,
  onConfirmed,
  pollFor,
}: Props) {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    QRCode.toString(payUrl, {
      type: "svg",
      color: { dark: "#0a0a0a", light: "#fafafa" },
      margin: 1,
      width: 220,
    }).then(setQrSvg);
  }, [payUrl]);

  useEffect(() => {
    if (!pollFor || confirmed) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/v1/checkout/${pollFor}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "CONFIRMED") {
        setConfirmed(true);
        clearInterval(id);
        onConfirmed?.();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [pollFor, confirmed, onConfirmed]);

  const amountFmt = `R$ ${(amountCents / 100)
    .toFixed(2)
    .replace(".", ",")}`;

  return (
    <div className="flex flex-col items-center text-center w-full">
      <p
        className="af-eb"
        style={{ color: "var(--af-dourado)" }}
      >
        {confirmed ? "fiado confirmado ✓" : "aguardando escaneio"}
      </p>
      <h2 className="af-display text-[24px] my-3 text-[var(--af-branco)]">
        {confirmed
          ? "Pode entregar a venda"
          : "Peça pra cliente apontar a câmera"}
      </h2>
      <div
        className="rounded-[14px] bg-[var(--af-branco)] p-4 mt-2 mb-5"
        style={{ width: 240, height: 240 }}
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p
        className="af-display text-[36px]"
        style={{ color: "var(--af-dourado)" }}
      >
        {amountFmt}
      </p>
      <p className="text-[13px] text-[var(--af-branco)]/80 mt-1.5">
        {entrepreneurName ? `${entrepreneurName} · ` : ""}prazo {prazoDays}d
      </p>
      <p
        className="font-mono text-[11px] mt-5"
        style={{ color: "rgba(250,250,250,0.5)" }}
      >
        aceitofiado.com/pay/{code}
      </p>
      <p
        className="font-mono text-[11px] mt-1"
        style={{ color: "var(--af-dourado)" }}
      >
        ▸ compartilhar no whatsapp
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Trocar o placeholder no `cobrar-form.tsx`**

Substituir o bloco `{result ? ... : ...}` no lado direito por:

```tsx
{result ? (
  <QrDisplay
    payUrl={result.payUrl}
    code={result.code}
    amountCents={items.reduce((s, it) => s + it.priceCents * it.qty, 0)}
    prazoDays={prazo}
    pollFor={result.code.replace(/-/g, "")}
    onConfirmed={() => toast.success("MEI confirmou! Pode liberar a venda.")}
  />
) : (
  <p className="af-eb text-[var(--af-cinza-soft)]">
    preencha e gere o QrCode
  </p>
)}
```

Adicionar import no topo:

```tsx
import { QrDisplay } from "@/components/checkout/qr-display";
```

- [ ] **Step 3: Tipos + smoke test**

```bash
pnpm tsc --noEmit
pnpm dev
```

Logado como supplier, abrir `/fornecedor/cobrar`, adicionar item, gerar QR. QR aparece com URL real.

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout/qr-display.tsx src/app/\(supplier\)/fornecedor/cobrar/cobrar-form.tsx
git commit -m "feat(lojista): QR Display + polling de confirmação

Cliente component que gera QR via lib qrcode (svg), faz polling de 2s
contra /api/v1/checkout/[code] pra detectar quando MEI confirma. Mostra
estado visual de confirmado quando vem.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Tela do MEI: pagar fiado

### Task 3.1: Rota /pay/[code] e leitura

**Files:**
- Create: `src/app/pay/[code]/page.tsx`
- Create: `src/app/pay/[code]/_actions.ts`

- [ ] **Step 1: Criar server action de leitura**

```ts
// src/app/pay/[code]/_actions.ts
"use server";

import { db } from "@/lib/db";
import { calculatePricing, parseCode } from "@/lib/checkout";

export async function loadCheckout(formattedCode: string) {
  const code = parseCode(formattedCode);
  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: {
      supplier: {
        select: {
          businessName: true,
          addressNeighborhood: true,
          addressCity: true,
          addressState: true,
          category: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!session) return { ok: false as const, reason: "not_found" as const };

  const expired =
    session.status === "PENDING" && session.expiresAt < new Date();

  const pricing = calculatePricing(Number(session.amount));

  return {
    ok: true as const,
    data: {
      code: formattedCode.toUpperCase(),
      status: expired ? ("EXPIRED" as const) : (session.status),
      amount: pricing.amount,
      feeCents: pricing.feeCents,
      totalCents: pricing.totalCents,
      prazo: session.prazo,
      items: session.items as Array<{ name: string; qty: number; priceCents: number }>,
      supplier: session.supplier,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}
```

- [ ] **Step 2: Criar `page.tsx`**

```tsx
// src/app/pay/[code]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

import { loadCheckout } from "./_actions";
import { PayConfirm } from "./pay-confirm";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PayPage({ params }: Props) {
  const { code } = await params;
  const res = await loadCheckout(code);

  if (!res.ok) notFound();
  const data = res.data;

  const user = await getCurrentUser();

  if (data.status === "EXPIRED") {
    return (
      <ExpiredState />
    );
  }

  if (data.status === "CONFIRMED") {
    return <AlreadyConfirmedState code={data.code} />;
  }

  return <PayConfirm data={data} loggedIn={!!user && user.role === "ENTREPRENEUR"} />;
}

function ExpiredState() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">link expirado</p>
        <h1 className="af-display text-[36px] mt-2 mb-3">
          Esse QrCode já expirou.
        </h1>
        <p className="text-[var(--af-cinza)] max-w-xs mx-auto">
          Peça à lojista pra gerar um novo. QRs valem 30 minutos por segurança.
        </p>
      </div>
    </div>
  );
}

function AlreadyConfirmedState({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">já confirmado</p>
        <h1 className="af-display text-[36px] mt-2 mb-3">
          Esse fiado já foi pago.
        </h1>
        <p className="text-[var(--af-cinza)] max-w-xs mx-auto">
          Code <span className="font-mono">{code}</span>.{" "}
          <Link href="/app" className="text-[var(--af-dourado-dark)] underline">
            Veja em /app
          </Link>.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar `pay-confirm.tsx` (skeleton; UI cresce em 3.2)**

```tsx
// src/app/pay/[code]/pay-confirm.tsx
"use client";

import { useState } from "react";

interface Props {
  data: {
    code: string;
    amount: number;
    feeCents: number;
    totalCents: number;
    prazo: number;
    items: Array<{ name: string; qty: number; priceCents: number }>;
    supplier: {
      businessName: string;
      addressNeighborhood: string;
      addressCity: string;
      addressState: string;
    } | null;
  };
  loggedIn: boolean;
}

export function PayConfirm({ data, loggedIn }: Props) {
  const [_step, _setStep] = useState<"confirm" | "auth" | "done">(
    loggedIn ? "confirm" : "auth",
  );
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-6 shadow-[var(--af-shadow-lift)]">
        <p className="af-eb">você vai comprar fiado</p>
        <h1 className="af-display text-[24px] mt-2 mb-4">
          Confirma a compra na {data.supplier?.businessName}?
        </h1>
        <p className="text-center af-display text-[56px] text-[var(--af-preto)]">
          R$ {(data.amount / 100).toFixed(2).replace(".", ",")}
        </p>
        <p className="text-center text-[var(--af-cinza)] text-sm mt-2">
          prazo {data.prazo} dias
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

```bash
pnpm tsc --noEmit
pnpm dev
```

Pegar um code de um checkout pendente (gerado em /fornecedor/cobrar). Abrir `http://localhost:3010/pay/AFXK-Q9M2-CX1Z`.

Esperado: tela mobile-style com valor.

- [ ] **Step 5: Commit**

```bash
git add src/app/pay
git commit -m "feat(checkout): rota /pay/[code] com estados expired/confirmed/pending

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 3.2: Tela de confirmação completa

**Files:**
- Modify: `src/app/pay/[code]/pay-confirm.tsx`

- [ ] **Step 1: Completar o JSX da confirmação**

Substituir o conteúdo de `PayConfirm` por versão completa:

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { confirmCheckoutAction } from "./_actions";

interface Item {
  name: string;
  qty: number;
  priceCents: number;
}

interface Props {
  data: {
    code: string;
    amount: number;
    feeCents: number;
    totalCents: number;
    prazo: number;
    items: Item[];
    supplier: {
      businessName: string;
      addressNeighborhood: string;
      addressCity: string;
      addressState: string;
    } | null;
  };
  loggedIn: boolean;
}

const BRL = (cents: number) =>
  `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

export function PayConfirm({ data, loggedIn }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ dueDate: string; total: number } | null>(
    null,
  );

  async function handleConfirm() {
    if (!loggedIn) {
      window.location.href = `/entrar?next=/pay/${data.code}`;
      return;
    }
    setSubmitting(true);
    const res = await confirmCheckoutAction(data.code);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDone({ dueDate: res.data.dueDate, total: res.data.totalCents });
  }

  if (done) {
    return <PaySuccess
      total={done.total}
      dueDate={done.dueDate}
      supplierName={data.supplier?.businessName ?? ""}
    />;
  }

  const dueDate = new Date(Date.now() + data.prazo * 86400000);
  const dueLabel = dueDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-6 shadow-[var(--af-shadow-lift)]">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-1.5 text-[14px] af-display">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ background: "var(--af-dourado)" }}
            />
            <span>AceitoFiado</span>
          </div>
          <span className="text-[var(--af-cinza)] text-lg">×</span>
        </div>

        <p className="af-eb">você vai comprar fiado</p>
        <h1 className="af-display text-[22px] leading-[1.05] mt-2 mb-5">
          Confirma a compra<br />
          na <span style={{ color: "var(--af-dourado)" }}>
            {data.supplier?.businessName ?? "loja"}
          </span>?
        </h1>

        <p className="text-center af-display text-[56px] text-[var(--af-preto)] leading-none">
          {BRL(data.amount).split(",")[0]}
          <span
            className="af-display"
            style={{ fontSize: 22, color: "var(--af-cinza)" }}
          >
            ,{BRL(data.amount).split(",")[1]}
          </span>
        </p>

        {data.supplier && (
          <div className="flex items-center gap-3 p-3 mt-4 bg-[var(--af-creme)] rounded-[10px]">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center af-display text-[16px]"
              style={{
                background: "var(--af-preto)",
                color: "var(--af-dourado)",
              }}
            >
              {data.supplier.businessName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-[12px]">
              <div className="font-semibold">
                {data.supplier.businessName}
              </div>
              <div className="text-[var(--af-cinza)] font-mono text-[10px] mt-0.5">
                {data.supplier.addressNeighborhood} ·{" "}
                {data.supplier.addressState.toLowerCase()} · {data.items.length}{" "}
                {data.items.length === 1 ? "item" : "itens"}
              </div>
            </div>
          </div>
        )}

        <div className="border border-[var(--af-borda)] rounded-[10px] p-3 mt-4 text-[12px]">
          {[
            ["Total da compra", BRL(data.amount)],
            ["Prazo", `${data.prazo} dias · ${dueLabel}`],
            ["Taxa AceitoFiado", BRL(data.feeCents)],
            ["Você paga", BRL(data.totalCents), true],
          ].map(([label, value, bold], i) => (
            <div
              key={i}
              className={`flex justify-between py-1.5 ${
                i < 3 ? "border-b border-dashed border-[var(--af-borda)]" : ""
              } ${bold ? "font-semibold" : ""}`}
            >
              <span>{label}</span>
              <span className="font-mono">{value}</span>
            </div>
          ))}
        </div>

        <button
          disabled={submitting}
          onClick={handleConfirm}
          className="w-full mt-4 py-3.5 bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[12px] font-semibold text-[14px] disabled:opacity-50"
        >
          {submitting
            ? "confirmando..."
            : loggedIn
            ? `confirmar e pagar em ${data.prazo}d`
            : "entrar pra confirmar"}
        </button>
        <p className="text-center font-mono text-[10px] text-[var(--af-cinza)] mt-3">
          não precisa cartão · sem consulta a bureau
        </p>
      </div>
    </div>
  );
}

function PaySuccess({
  total,
  dueDate,
  supplierName,
}: {
  total: number;
  dueDate: string;
  supplierName: string;
}) {
  const due = new Date(dueDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-[var(--af-branco)] rounded-[18px] p-8 shadow-[var(--af-shadow-lift)] text-center">
        <div
          className="w-[72px] h-[72px] rounded-full mx-auto mb-4 flex items-center justify-center af-display text-[36px]"
          style={{
            background: "var(--af-dourado)",
            color: "var(--af-preto)",
          }}
        >
          ✓
        </div>
        <h1 className="af-display text-[26px] mb-2">
          Fiado<br />aprovado.
        </h1>
        <p className="text-[var(--af-cinza)] text-sm max-w-[220px] mx-auto mb-5">
          A {supplierName} recebeu o valor agora. Você paga{" "}
          {BRL(total)} até {due}.
        </p>
        <div className="bg-[var(--af-creme)] rounded-[10px] p-3.5 text-left">
          <div className="af-eb">próximo passo</div>
          <div className="text-[13px] mt-1.5 leading-[1.4]">
            A trava do seu Pix começa a recolher 30% até zerar a dívida. Acompanhe em{" "}
            <a
              href="/app"
              style={{ color: "var(--af-dourado-dark)" }}
              className="font-semibold"
            >
              app.aceitofiado.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar `confirmCheckoutAction` ao `_actions.ts`**

Atualizar o bloco de imports no topo de `src/app/pay/[code]/_actions.ts` pra incluir `getCurrentUser`:

```ts
"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePricing, parseCode } from "@/lib/checkout";
```

Depois adicionar a função no final do arquivo (após `loadCheckout`):

```ts
export async function confirmCheckoutAction(
  formattedCode: string,
): Promise<
  | { ok: true; data: { dueDate: string; totalCents: number; orderId: string } }
  | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ENTREPRENEUR" || !user.entrepreneurId) {
    return { ok: false, error: "precisa estar logada como MEI pra confirmar" };
  }

  const code = parseCode(formattedCode);
  const session = await db.checkoutSession.findUnique({
    where: { code },
    include: { supplier: true },
  });
  if (!session) return { ok: false, error: "checkout não encontrado" };
  if (session.status !== "PENDING")
    return { ok: false, error: `status inesperado: ${session.status}` };
  if (session.expiresAt < new Date()) {
    await db.checkoutSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    return { ok: false, error: "expirou" };
  }

  const pricing = calculatePricing(Number(session.amount));
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + session.prazo);

  const order = await db.order.create({
    data: {
      entrepreneurId: user.entrepreneurId,
      supplierId: session.supplierId,
      status: "FUNDED",
      subtotalCents: BigInt(pricing.amount),
      supplierDiscountBps: 300,
      supplierReceiveCents: BigInt(
        pricing.amount - Math.round((pricing.amount * 300) / 10000),
      ),
      customerInterestBps: pricing.feeBps,
      customerPayCents: BigInt(pricing.totalCents),
      termDays: session.prazo,
      platformFeeCents: BigInt(pricing.feeCents),
      captureRateBps: 3000,
      confirmedAt: new Date(),
      fundedAt: new Date(),
      dueDate,
    },
  });

  await db.checkoutSession.update({
    where: { id: session.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      entrepreneurId: user.entrepreneurId,
      orderId: order.id,
    },
  });

  return {
    ok: true,
    data: {
      dueDate: dueDate.toISOString(),
      totalCents: pricing.totalCents,
      orderId: order.id,
    },
  };
}
```

- [ ] **Step 3: Smoke test fim-a-fim**

```bash
pnpm dev
```

1. Logar como lojista, ir em `/fornecedor/cobrar`, gerar QR pra Joana.
2. Em outra aba, deslogar, abrir o `payUrl`.
3. Tela mostra "entrar pra confirmar".
4. Logar como Joana (`joana@ondapreta.com.br` / `aceito123`), voltar pro `/pay/[code]`.
5. Clicar "confirmar e pagar em 30d".
6. Tela de sucesso aparece. Na aba do lojista, polling detecta confirmação.

- [ ] **Step 4: Commit**

```bash
git add src/app/pay/[code]/pay-confirm.tsx src/app/pay/[code]/_actions.ts
git commit -m "feat(checkout): tela MEI de confirmação + sucesso

Fluxo completo: confirmação → server action cria Order FUNDED →
sucesso com mensagem sobre trava começar.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 3.3: Cadastro express integrado em /entrar?next=/pay/...

**Files:**
- Modify: `src/app/(auth)/entrar/page.tsx`
- Modify: `src/app/(auth)/entrar/login-form.tsx`

- [ ] **Step 1: Aceitar parâmetro `next` no login**

Em `src/app/(auth)/entrar/page.tsx`, ler `searchParams.next` e passar pra `LoginForm`:

```tsx
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm nextUrl={sp.next ?? "/app"} />;
}
```

Em `LoginForm`, aceitar prop e redirecionar pra `nextUrl` após sucesso (em vez de `/app`).

- [ ] **Step 2: Adicionar link "criar conta" passando next**

No componente do form, garantir que link "criar conta" vai pra `/cadastro?next={nextUrl}`. Idem em `/cadastro` aceitar `next` e redirecionar após signup.

- [ ] **Step 3: Smoke test**

Deslogada, abrir `/pay/[code]`, clicar "entrar pra confirmar" → vai pra `/entrar?next=/pay/...`. Logar → volta pra `/pay/[code]`. Cadastrar → idem.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/entrar src/app/\(auth\)/cadastro
git commit -m "feat(auth): aceitar ?next= em entrar e cadastro pra deep link

Habilita retorno automático pra /pay/[code] após login express.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 — Landing v3

**Files affected:** `src/app/page.tsx`, `src/components/marketing/*`

### Task 4.1: Reset da landing + Hero v3

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/marketing/hero-v3.tsx`

- [ ] **Step 1: Criar `hero-v3.tsx`**

```tsx
// src/components/marketing/hero-v3.tsx
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const PHOTO_URL =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=85&auto=format&fit=crop";

export function HeroV3() {
  return (
    <div className="bg-[var(--af-preto)] text-[var(--af-branco)]">
      {/* nav */}
      <div className="flex items-center justify-between px-9 py-5 border-b border-white/5">
        <Logo color="var(--af-branco)" />
        <div className="hidden md:flex gap-7 text-[13.5px] text-white/70">
          <a href="#como">como funciona</a>
          <a href="#lojista">pra lojista</a>
          <a href="#mei">pra MEI</a>
          <a href="#api">API</a>
        </div>
        <Link
          href="/cadastro"
          className="text-[12px] px-4 py-2.5 rounded-[8px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold"
        >
          criar conta →
        </Link>
      </div>

      {/* hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
        <div className="p-12 lg:p-16 flex flex-col justify-between gap-9">
          <div>
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-wider border"
              style={{
                background: "rgba(212, 160, 23, 0.12)",
                borderColor: "rgba(212, 160, 23, 0.3)",
                color: "var(--af-dourado)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--af-dourado)" }}
              />
              aberto · 1.847 mei aceitos
            </span>
            <h1
              className="af-display mt-7"
              style={{
                fontSize: "clamp(54px, 7vw, 88px)",
                maxWidth: 580,
              }}
            >
              Banco te disse{" "}
              <span
                style={{
                  textDecoration: "line-through",
                  textDecorationThickness: 6,
                  textDecorationColor: "var(--af-dourado)",
                  opacity: 0.6,
                }}
              >
                não
              </span>
              <br />
              <span style={{ color: "var(--af-dourado)" }}>aqui</span> se aceita
              fiado.
            </h1>
            <p
              className="text-[17px] leading-[1.5] mt-6"
              style={{ color: "rgba(250,250,250,0.75)", maxWidth: 460 }}
            >
              Checkout pra lojista cobrar fiado de MEI preta. Você recebe à
              vista, ela paga no tempo dela, e a gente toma o risco. Sem
              Serasa, sem peneira, sem letrinha miúda.
            </p>
          </div>
          <div>
            <div className="flex gap-3.5">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[14px]"
              >
                criar conta de lojista →
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[10px] border border-white/25 text-[14px] font-semibold"
              >
                ▸ ver demo
              </a>
            </div>
            <p className="font-mono text-[11.5px] mt-4 text-white/45">
              grátis pra cadastrar · sem mensalidade · taxa só quando o fiado é pago
            </p>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-[var(--af-preto-soft)] to-[var(--af-preto)] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${PHOTO_URL})`,
              filter: "grayscale(0.1) contrast(1.05)",
              backgroundPosition: "center 30%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, rgba(10,10,10,0.55) 0%, transparent 35%, transparent 60%, rgba(10,10,10,0.9) 100%)",
            }}
          />
          {/* Receipt floating */}
          <div
            className="absolute top-9 right-9 bg-[var(--af-branco)] text-[var(--af-preto)] rounded-[12px] px-5 py-4 min-w-[240px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="font-mono text-[10px] text-[var(--af-cinza)] tracking-wider uppercase">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"
                style={{ background: "var(--af-sucesso)" }}
              />
              fiado aprovado
            </div>
            <div className="af-display text-[36px] mt-2 leading-none">
              R$ 1.240
              <span className="text-[16px] text-[var(--af-cinza)]">,00</span>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-dashed border-black/10 font-mono text-[11px] text-[var(--af-cinza)]">
              <span>Joana B. → Onda Preta</span>
              <span>28d</span>
            </div>
          </div>
          {/* Quote bottom */}
          <div className="absolute bottom-9 left-9 right-9 z-10">
            <div
              className="af-display text-[22px] leading-[1.08]"
              style={{ maxWidth: 380 }}
            >
              "primeira vez<br />
              que{" "}
              <span style={{ color: "var(--af-dourado)" }}>crédito</span>
              <br />
              foi pra mim."
            </div>
            <div className="font-mono text-[11px] text-white/60 mt-3.5 tracking-wide">
              JOANA BEZERRA · ONDA PRETA BIQUÍNIS · HELIÓPOLIS/SP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Reset do `src/app/page.tsx`** pra usar `HeroV3`

```tsx
// src/app/page.tsx
import { HeroV3 } from "@/components/marketing/hero-v3";

export default function HomePage() {
  return (
    <div className="af-screen">
      <HeroV3 />
      {/* outras seções adicionadas em 4.2-4.9 */}
    </div>
  );
}
```

- [ ] **Step 3: Verificar visualmente**

```bash
pnpm dev
```

`http://localhost:3010/` mostra hero novo (preto + foto + Anton). Sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/hero-v3.tsx src/app/page.tsx
git commit -m "feat(landing): Hero v3 — preto + foto Joana + Anton + dourado

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 4.2: Manifesto strip + numbers grid

**Files:**
- Create: `src/components/marketing/manifesto-strip.tsx`
- Create: `src/components/marketing/numbers-grid.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Criar `manifesto-strip.tsx`**

```tsx
// src/components/marketing/manifesto-strip.tsx
export function ManifestoStrip() {
  return (
    <div className="bg-[var(--af-dourado)] text-[var(--af-preto)] px-9 py-7 flex items-center justify-between gap-9 flex-wrap">
      <div
        className="af-display text-[24px] leading-[1.05]"
        style={{ maxWidth: 720 }}
      >
        Empreendedor preto recebe não 3x mais que branco no banco. Aqui a
        porta começa aberta.
      </div>
      <span className="af-display text-[28px]">→</span>
    </div>
  );
}
```

- [ ] **Step 2: Criar `numbers-grid.tsx`**

```tsx
// src/components/marketing/numbers-grid.tsx
const NUMBERS = [
  {
    label: "girados na rede",
    value: "R$ 4,2",
    unit: "M",
    gold: true,
  },
  { label: "MEIs afro aceitas", value: "1.847", unit: "" },
  { label: "lojistas parceiros", value: "312", unit: "" },
  { label: "consultas serasa", value: "0", unit: "" },
];

export function NumbersGrid() {
  return (
    <div className="bg-[var(--af-preto)] px-9 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5">
      {NUMBERS.map((n) => (
        <div key={n.label}>
          <div className="font-mono text-[10.5px] tracking-wider text-white/50 uppercase">
            {n.label}
          </div>
          <div
            className="af-display text-[48px] leading-none mt-3"
            style={{ color: n.gold ? "var(--af-dourado)" : "var(--af-branco)" }}
          >
            {n.value}
            {n.unit && (
              <span className="text-[22px] text-white/50 ml-1">{n.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Adicionar à landing**

Em `src/app/page.tsx`:

```tsx
import { HeroV3 } from "@/components/marketing/hero-v3";
import { ManifestoStrip } from "@/components/marketing/manifesto-strip";
import { NumbersGrid } from "@/components/marketing/numbers-grid";

export default function HomePage() {
  return (
    <div className="af-screen">
      <HeroV3 />
      <ManifestoStrip />
      <NumbersGrid />
    </div>
  );
}
```

- [ ] **Step 4: Validar visualmente**

```bash
pnpm dev
```

Landing mostra hero + strip dourado + numbers em preto.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/manifesto-strip.tsx src/components/marketing/numbers-grid.tsx src/app/page.tsx
git commit -m "feat(landing): manifesto strip + numbers grid

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 4.3: Seção "Como funciona" (2 colunas)

**Files:**
- Create: `src/components/marketing/how-it-works-v3.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/marketing/how-it-works-v3.tsx
const COLS = [
  {
    tag: "você · lojista",
    tagBg: "var(--af-mata)",
    title: "Cobre fiado em 3 toques",
    steps: [
      "Cliente afro MEI chega na loja. Quer pagar fiado.",
      "Você abre o AceitoFiado, digita produtos e valor.",
      "Gera o QrCode. Cliente escaneia. Você recebe à vista.",
    ],
  },
  {
    tag: "cliente · MEI afro",
    tagBg: "var(--af-laranja)",
    title: "Pague no tempo da sua loja",
    steps: [
      "Achou a loja pelo nosso chatbot do WhatsApp.",
      "Escaneia o QrCode do lojista. Vê parcelas claras.",
      "Paga no vencimento. Sem cartão. Sem dívida-banco.",
    ],
  },
];

export function HowItWorksV3() {
  return (
    <div
      id="como"
      className="bg-[var(--af-creme)] px-9 py-20"
    >
      <div className="max-w-[1280px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-wider uppercase"
          style={{ color: "var(--af-laranja)" }}
        >
          como funciona
        </span>
        <h2
          className="af-display mt-3.5"
          style={{ fontSize: "clamp(36px, 5vw, 56px)", maxWidth: 720 }}
        >
          Dois lados,{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "var(--af-mata)",
              fontWeight: 800,
            }}
          >
            um fluxo
          </span>{" "}
          que cabe na palma da mão.
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-9">
          {COLS.map((col) => (
            <div
              key={col.title}
              className="bg-[var(--af-creme-2)] rounded-[14px] p-7 border border-[var(--af-borda)]"
            >
              <span
                className="inline-block px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase text-[var(--af-branco)]"
                style={{ background: col.tagBg }}
              >
                {col.tag}
              </span>
              <h3 className="af-display text-[22px] my-4">{col.title}</h3>
              {col.steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex gap-3 py-3 text-sm ${
                    i > 0 ? "border-t border-[var(--af-borda)]" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] text-[var(--af-cinza)] min-w-[22px]">
                    0{i + 1}
                  </span>
                  <span className="leading-[1.45]">{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar à landing**

```tsx
import { HowItWorksV3 } from "@/components/marketing/how-it-works-v3";
// ...
<HowItWorksV3 />
```

- [ ] **Step 3: Validar + commit**

```bash
pnpm dev
git add src/components/marketing/how-it-works-v3.tsx src/app/page.tsx
git commit -m "feat(landing): seção como funciona (2 cols lojista/MEI)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 4.4: Seção API com code snippet

**Files:**
- Create: `src/components/marketing/api-section.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/marketing/api-section.tsx
import Link from "next/link";

const CODE = `import { aceitofiado } from "@aceito/sdk";

const checkout = await aceitofiado.checkout({
  amount: 18900,         // R$ 189,00
  items: [{ name: "Turbante Imbondeiro", qty: 1, priceCents: 18900 }],
  prazo: 30,             // dias
  cliente_cpf: cpf,
  success_url: "/obrigado",
  webhook_url: "/api/webhook",
});

// → marketplace redireciona pra checkout.payUrl
// → recebe webhook em "/api/webhook" quando MEI confirma`;

export function ApiSection() {
  return (
    <div id="api" className="bg-[var(--af-preto)] text-[var(--af-branco)] px-9 py-24">
      <div className="max-w-[1280px] mx-auto grid md:grid-cols-[1fr_1.2fr] gap-14 items-center">
        <div>
          <span
            className="font-mono text-[11px] tracking-wider uppercase"
            style={{ color: "var(--af-dourado)" }}
          >
            pra marketplaces
          </span>
          <h2
            className="af-display mt-3.5"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Pluga "Pagar com{" "}
            <span style={{ color: "var(--af-dourado)" }}>AceitoFiado</span>"
            no seu checkout.
          </h2>
          <p className="text-white/70 text-[15.5px] mt-5 leading-[1.55] max-w-md">
            SDK leve, ZDR (zero data retention), retorno via webhook. Compatível
            com qualquer stack — Node, Python, Ruby, Go.
          </p>
          <div className="flex gap-3.5 mt-7">
            <Link
              href="/demo-marketplace"
              className="px-5 py-3 rounded-[8px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[13.5px]"
            >
              ver demo viva →
            </Link>
            <Link
              href="/docs/api"
              className="px-5 py-3 rounded-[8px] border border-white/25 text-[13.5px] font-semibold"
            >
              docs da API
            </Link>
          </div>
        </div>
        <pre
          className="font-mono text-[12.5px] leading-[1.6] rounded-[14px] p-7 overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <code className="text-white/85">{CODE}</code>
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Adicionar à landing**

```tsx
import { ApiSection } from "@/components/marketing/api-section";
// ...
<ApiSection />
```

- [ ] **Step 3: Validar + commit**

```bash
pnpm dev
git add src/components/marketing/api-section.tsx src/app/page.tsx
git commit -m "feat(landing): seção API com code snippet Stripe-like

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 4.5: Testimonial + CTA final + Footer v3

**Files:**
- Create: `src/components/marketing/testimonial-v3.tsx`
- Create: `src/components/marketing/cta-final.tsx`
- Create: `src/components/marketing/footer-v3.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Criar `testimonial-v3.tsx`**

```tsx
// src/components/marketing/testimonial-v3.tsx
export function TestimonialV3() {
  return (
    <div className="bg-[var(--af-creme)] px-9 py-24">
      <div className="max-w-[1080px] mx-auto">
        <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--af-cinza)]">
          vozes
        </span>
        <blockquote
          className="af-display mt-5"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.15 }}
        >
          "Banco me disse não três vezes em 2024 sem motivo. Mês passado fechei
          o{" "}
          <span style={{ color: "var(--af-dourado)" }}>
            maior pedido da loja
          </span>{" "}
          e a AceitoFiado liquidou em 11 dias sem eu ter que ligar pra
          ninguém. É a primeira vez que crédito serviu pra mim."
        </blockquote>
        <div className="flex items-center gap-4 mt-8">
          <div
            className="w-12 h-12 rounded-full af-placeholder"
            aria-hidden
          />
          <div>
            <div className="font-semibold">Joice Oliveira</div>
            <div className="font-mono text-[12px] text-[var(--af-cinza)] mt-0.5">
              moda joice · capão redondo · sp · cliente desde out/2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `cta-final.tsx`**

```tsx
// src/components/marketing/cta-final.tsx
import Link from "next/link";

export function CtaFinal() {
  return (
    <div className="bg-[var(--af-preto)] px-9 py-28 text-center">
      <div className="max-w-[1080px] mx-auto">
        <span
          className="font-mono text-[11px] tracking-wider uppercase"
          style={{ color: "var(--af-dourado)" }}
        >
          comece em 90 segundos
        </span>
        <h2
          className="af-display mt-5 text-[var(--af-branco)]"
          style={{ fontSize: "clamp(48px, 7vw, 88px)" }}
        >
          Cobre fiado<br />
          <span style={{ color: "var(--af-dourado)" }}>sem peneira.</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link
            href="/cadastro"
            className="px-7 py-4 rounded-[10px] bg-[var(--af-dourado)] text-[var(--af-preto)] font-semibold text-[14px]"
          >
            criar conta de lojista →
          </Link>
          <Link
            href="/demo-marketplace"
            className="px-7 py-4 rounded-[10px] border border-white/25 text-[var(--af-branco)] font-semibold text-[14px]"
          >
            ▸ ver demo de 60s
          </Link>
        </div>
        <p className="font-mono text-[12px] text-white/45 mt-6">
          grátis · sem CNPJ · sem consulta a bureau · contrato em pt-br claro
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar `footer-v3.tsx`**

```tsx
// src/components/marketing/footer-v3.tsx
import { Logo } from "@/components/brand/logo";

const COLS = [
  ["produto", ["Checkout presencial", "API marketplace", "Trava de recebíveis", "Mudanças recentes"]],
  ["empresa", ["Manifesto", "Imprensa", "Carreira", "Contato"]],
  ["recursos", ["Documentação", "Status", "Termos", "Privacidade"]],
  ["social", ["Instagram", "LinkedIn", "Newsletter", "GitHub"]],
] as const;

export function FooterV3() {
  return (
    <footer className="bg-[var(--af-preto)] text-[var(--af-branco)] px-9 py-20 border-t border-white/8">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-[1.5fr_repeat(4,1fr)] gap-12">
          <div>
            <Logo color="var(--af-branco)" />
            <p
              className="text-[13.5px] text-white/60 mt-4 leading-[1.5]"
              style={{ maxWidth: 320 }}
            >
              Checkout pra MEI afro comprar fiado em lojistas parceiros e em
              marketplaces que integram nossa API. Construído de Heliópolis,
              Capão Redondo e Brasilândia.
            </p>
          </div>
          {COLS.map(([title, items]) => (
            <div key={title}>
              <div className="font-mono text-[11px] tracking-wider uppercase text-white/50">
                {title}
              </div>
              <div className="flex flex-col gap-2.5 mt-4">
                {items.map((it) => (
                  <span
                    key={it}
                    className="text-[14px] text-white/85 hover:text-[var(--af-dourado)] cursor-pointer"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-7 border-t border-white/10 flex justify-between items-center flex-wrap gap-3 font-mono text-[11px] text-white/50">
          <span>
            AceitoFiado · Tecnologia LTDA · CNPJ XX.XXX.XXX/0001-XX · v0.5
          </span>
          <span>© 2026 · São Paulo</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Compor landing final**

```tsx
// src/app/page.tsx
import { ApiSection } from "@/components/marketing/api-section";
import { CtaFinal } from "@/components/marketing/cta-final";
import { FooterV3 } from "@/components/marketing/footer-v3";
import { HeroV3 } from "@/components/marketing/hero-v3";
import { HowItWorksV3 } from "@/components/marketing/how-it-works-v3";
import { ManifestoStrip } from "@/components/marketing/manifesto-strip";
import { NumbersGrid } from "@/components/marketing/numbers-grid";
import { TestimonialV3 } from "@/components/marketing/testimonial-v3";

export default function HomePage() {
  return (
    <div className="af-screen">
      <HeroV3 />
      <ManifestoStrip />
      <NumbersGrid />
      <HowItWorksV3 />
      <ApiSection />
      <TestimonialV3 />
      <CtaFinal />
      <FooterV3 />
    </div>
  );
}
```

- [ ] **Step 5: Validar visualmente + grep "score"**

```bash
pnpm dev
# inspecionar a landing inteira no browser

# garantir que nenhum componente novo de marketing usa "score"
grep -ri "score" src/components/marketing/ src/app/page.tsx
# esperado: zero match
```

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/testimonial-v3.tsx src/components/marketing/cta-final.tsx src/components/marketing/footer-v3.tsx src/app/page.tsx
git commit -m "feat(landing): testimonial + CTA + footer v3 — landing completa

Landing inteira em direção v3 (preto + dourado + Anton + foto real).
Zero ocorrência de 'score' em código de marketing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5 — Demo marketplace + Docs API

### Task 5.1: Página /demo-marketplace

**Files:**
- Create: `src/app/demo-marketplace/page.tsx`
- Create: `src/app/demo-marketplace/_actions.ts`

- [ ] **Step 1: Criar action que gera checkout fake**

```ts
// src/app/demo-marketplace/_actions.ts
"use server";

import { db } from "@/lib/db";
import {
  expirationFromNow,
  formatCode,
  generateUniqueCode,
} from "@/lib/checkout";

const FAKE_ITEM = {
  name: "Turbante Imbondeiro · médio",
  qty: 1,
  priceCents: 18900,
};

export async function createDemoCheckout() {
  // Pegar o primeiro supplier do seed pra usar como vendedor
  const supplier = await db.supplierProfile.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!supplier) throw new Error("nenhum supplier no seed");

  const code = await generateUniqueCode();
  const session = await db.checkoutSession.create({
    data: {
      code,
      supplierId: supplier.id,
      amount: BigInt(FAKE_ITEM.priceCents),
      items: [FAKE_ITEM],
      prazo: 30,
      source: "API_MARKETPLACE",
      expiresAt: expirationFromNow(),
      marketplaceId: "feirapreta-demo",
      successUrl: "/demo-marketplace/obrigado",
      cancelUrl: "/demo-marketplace",
    },
  });

  return {
    code: formatCode(session.code),
    payUrl: `/pay/${formatCode(session.code)}?from=marketplace`,
  };
}
```

- [ ] **Step 2: Criar `page.tsx`**

```tsx
// src/app/demo-marketplace/page.tsx
import { DemoMarketplace } from "./demo-marketplace";

export default function DemoMarketplacePage() {
  return <DemoMarketplace />;
}
```

- [ ] **Step 3: Criar `demo-marketplace.tsx` client**

```tsx
// src/app/demo-marketplace/demo-marketplace.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createDemoCheckout } from "./_actions";

export function DemoMarketplace() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePagar() {
    setLoading(true);
    const res = await createDemoCheckout();
    router.push(res.payUrl);
  }

  return (
    <div className="min-h-screen bg-[var(--af-creme)]">
      <div className="bg-[var(--af-laranja)] text-[var(--af-branco)] px-6 py-2.5 font-mono text-[12px] flex justify-between max-w-[900px] mx-auto md:rounded-b-[12px]">
        <span>feirapreta.com.br · checkout</span>
        <span className="bg-white/20 px-2 py-0.5 rounded">demo</span>
      </div>
      <div className="max-w-[900px] mx-auto p-7 grid md:grid-cols-[1.2fr_1fr] gap-7">
        <div
          className="aspect-[4/3] rounded-[12px] flex items-center justify-center af-display text-[18px] text-center px-5"
          style={{
            background:
              "linear-gradient(135deg, var(--af-creme-2) 0%, var(--af-dourado) 100%)",
            color: "var(--af-preto)",
          }}
        >
          Turbante Imbondeiro<br />em cera de carnaúba
        </div>
        <div>
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--af-cinza)]">
            finalizar compra
          </span>
          <h1 className="af-display text-[28px] mt-2">
            Turbante Imbondeiro · médio
          </h1>
          <p className="font-mono text-[12px] text-[var(--af-cinza)] mt-1">
            vendido por · Atelier Aruanda (Salvador/BA)
          </p>
          <div className="af-display text-[38px] mt-4">
            R$ 189
            <span className="text-[14px] text-[var(--af-cinza)] ml-2 font-mono">
              ,00 à vista no pix
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <PayOption
              icon="P"
              title="Pix à vista"
              right="R$ 189,00"
            />
            <PayOption
              icon="A"
              iconBg="var(--af-preto)"
              iconColor="var(--af-dourado)"
              title="Pagar com AceitoFiado"
              badge="novo"
              right="R$ 198,45 em 30d"
              subtitle="30 dias · sem cartão · só pra MEI afro"
              selected
            />
            <PayOption icon="C" title="Cartão" right="até 3x sem juros" />
          </div>

          <button
            disabled={loading}
            onClick={handlePagar}
            className="w-full mt-4 py-3.5 bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[10px] font-semibold text-[14px]"
          >
            {loading ? "abrindo checkout..." : "continuar com "}
            <span style={{ color: "var(--af-dourado)" }}>AceitoFiado</span> →
          </button>
          <p className="font-mono text-[10.5px] text-[var(--af-cinza)] text-center mt-2.5">
            powered by aceito.fiado · ssl · não consultamos serasa
          </p>
        </div>
      </div>
    </div>
  );
}

function PayOption({
  icon,
  iconBg,
  iconColor,
  title,
  badge,
  right,
  subtitle,
  selected,
}: {
  icon: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  badge?: string;
  right: string;
  subtitle?: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-[10px] cursor-pointer ${
        selected
          ? "border-2 border-[var(--af-dourado)] bg-[var(--af-dourado-soft)]"
          : "border border-[var(--af-borda)]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center af-display text-[14px]"
          style={{
            background: iconBg ?? "var(--af-creme-2)",
            color: iconColor ?? "var(--af-preto)",
          }}
        >
          {icon}
        </div>
        <div>
          <div className="font-semibold text-[13px]">
            {title}
            {badge && (
              <span
                className="ml-2 px-1.5 py-[2px] rounded text-[9px] font-mono tracking-wider uppercase"
                style={{
                  background: "var(--af-dourado)",
                  color: "var(--af-preto)",
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="font-mono text-[10.5px] text-[var(--af-cinza)]">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="font-mono text-[11px] text-[var(--af-cinza)]">
        {right}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `obrigado/page.tsx`** (pra success_url do demo)

```tsx
// src/app/demo-marketplace/obrigado/page.tsx
import Link from "next/link";

export default function DemoObrigado() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">demo · feirapreta</p>
        <h1 className="af-display text-[44px] mt-2 mb-3">
          Obrigado!
        </h1>
        <p className="text-[var(--af-cinza)] max-w-sm mx-auto mb-7">
          O marketplace receberia agora um webhook de confirmação e mostraria
          essa tela à cliente.
        </p>
        <Link
          href="/demo-marketplace"
          className="px-5 py-3 rounded-[8px] bg-[var(--af-preto)] text-[var(--af-branco)] font-semibold text-[13px]"
        >
          ← voltar pro demo
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Smoke test fim-a-fim**

```bash
pnpm dev
```

1. Logada como Joana.
2. Abrir `/demo-marketplace`.
3. Clicar "continuar com AceitoFiado".
4. Vai pra `/pay/[code]?from=marketplace`.
5. Confirma fiado.
6. Tela de sucesso. (Em produção real, voltaria pra `successUrl`. Pro MVP, mostra sucesso e link manual pra obrigado.)

- [ ] **Step 6: Commit**

```bash
git add src/app/demo-marketplace
git commit -m "feat(demo): página /demo-marketplace com checkout integrado

Fake checkout estilo Feira Preta. Botão 'Pagar com AceitoFiado' cria
CheckoutSession source=API_MARKETPLACE e redireciona pra /pay/[code].

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 5.2: Página /docs/api

**Files:**
- Create: `src/app/docs/api/page.tsx`

- [ ] **Step 1: Criar página markdown-style**

```tsx
// src/app/docs/api/page.tsx
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/checkout",
    desc: "Cria uma sessão de checkout fiado.",
    req: `{
  "amount": 18900,
  "items": [{ "name": "Turbante", "qty": 1, "priceCents": 18900 }],
  "prazo": 30,
  "supplierId": "<seu-id>",
  "marketplaceId": "feirapreta",
  "entrepreneurCpf": "13245678990",
  "successUrl": "https://loja.com/ok",
  "cancelUrl": "https://loja.com/cancel",
  "webhookUrl": "https://loja.com/api/webhook"
}`,
    res: `{
  "code": "AFXK-Q9M2-CX1Z",
  "payUrl": "https://aceitofiado.com/pay/AFXK-Q9M2-CX1Z",
  "expiresAt": "2026-05-24T15:30:00Z",
  "status": "PENDING"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/checkout/{code}",
    desc: "Consulta status e dados de uma sessão. Público (qualquer um com o code).",
    res: `{
  "code": "AFXK-Q9M2-CX1Z",
  "status": "PENDING",
  "amount": 18900,
  "feeCents": 945,
  "totalCents": 19845,
  "prazo": 30,
  "items": [...],
  "supplier": { "businessName": "Atelier Aruanda", ... }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/checkout/{code}/confirm",
    desc: "Confirma fiado. Requer MEI logada (cookie httpOnly).",
    res: `{
  "orderId": "ord_...",
  "status": "CONFIRMED",
  "dueDate": "2026-06-23T...",
  "totalCents": 19845,
  "successUrl": "https://loja.com/ok"
}`,
  },
];

export default function DocsApiPage() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)]">
      <div className="px-9 py-5 border-b border-[var(--af-borda)] flex justify-between items-center">
        <Logo />
        <Link
          href="/"
          className="font-mono text-[12px] text-[var(--af-cinza)]"
        >
          ← voltar pro site
        </Link>
      </div>
      <div className="max-w-[920px] mx-auto px-7 py-14">
        <span className="af-eb">docs · api v1</span>
        <h1 className="af-display text-[48px] mt-3 mb-3">
          AceitoFiado API
        </h1>
        <p className="text-[var(--af-cinza)] text-[15.5px] leading-[1.6] max-w-xl">
          Integre "Pagar com AceitoFiado" no seu marketplace. 3 endpoints,
          autenticação Bearer, retorno via webhook. Pt-BR. ZDR.
        </p>

        <h2 className="af-display text-[24px] mt-12 mb-3">autenticação</h2>
        <p className="text-sm leading-[1.6] mb-3">
          Todo request usa header{" "}
          <code className="bg-[var(--af-creme-2)] px-1.5 py-0.5 rounded font-mono text-[12px]">
            Authorization: Bearer &lt;sua-chave&gt;
          </code>
          . Chaves emitidas após cadastro em{" "}
          <Link href="/cadastro" className="underline">
            /cadastro
          </Link>
          .
        </p>

        <h2 className="af-display text-[24px] mt-12 mb-3">endpoints</h2>
        <div className="flex flex-col gap-7 mt-5">
          {ENDPOINTS.map((e) => (
            <div
              key={e.path}
              className="bg-[var(--af-branco)] border border-[var(--af-borda)] rounded-[12px] p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-[10.5px] px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    background:
                      e.method === "POST" ? "var(--af-dourado)" : "var(--af-mata)",
                    color:
                      e.method === "POST" ? "var(--af-preto)" : "var(--af-branco)",
                  }}
                >
                  {e.method}
                </span>
                <code className="font-mono text-[14px]">{e.path}</code>
              </div>
              <p className="text-sm text-[var(--af-cinza)] mt-3">{e.desc}</p>
              {e.req && (
                <>
                  <div className="font-mono text-[10.5px] tracking-wider uppercase text-[var(--af-cinza)] mt-4 mb-1">
                    request
                  </div>
                  <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
                    {e.req}
                  </pre>
                </>
              )}
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-[var(--af-cinza)] mt-4 mb-1">
                response 200
              </div>
              <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
                {e.res}
              </pre>
            </div>
          ))}
        </div>

        <h2 className="af-display text-[24px] mt-12 mb-3">webhook</h2>
        <p className="text-sm leading-[1.6] mb-3">
          Quando MEI confirma, fazemos{" "}
          <code className="bg-[var(--af-creme-2)] px-1.5 py-0.5 rounded font-mono text-[12px]">
            POST {`{webhookUrl}`}
          </code>{" "}
          com payload:
        </p>
        <pre className="bg-[var(--af-preto)] text-[var(--af-branco)] rounded-[8px] p-4 font-mono text-[12px] overflow-x-auto">
{`{
  "code": "AFXK-Q9M2-CX1Z",
  "status": "CONFIRMED",
  "amount": 18900,
  "orderId": "ord_...",
  "confirmedAt": "2026-05-24T15:32:00Z"
}`}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Validar visualmente**

```bash
pnpm dev
# abrir http://localhost:3010/docs/api
```

- [ ] **Step 3: Commit**

```bash
git add src/app/docs/api
git commit -m "feat(docs): página /docs/api com 3 endpoints + webhook

Doc curta estilo Stripe pra positioning da API. Sem palavra 'score'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Final QA

### Task QA.1: Sanity check de palavra "score" no site público

- [ ] **Step 1: Grep agressivo em código de marketing + páginas de cliente**

```bash
grep -rni "score" src/app/page.tsx src/app/pay src/app/demo-marketplace src/app/docs src/components/marketing 2>&1
```

Esperado: zero match.

Se houver match em algum desses caminhos, abrir e renomear pra "saúde financeira", "limite", "atividade na rede" conforme contexto.

```bash
grep -rni "score" src/app/\(entrepreneur\) src/app/\(supplier\) 2>&1
```

Para os apps internos: tolerar matches em arquivos de backend (`scoring.ts` import) mas remover qualquer string user-facing.

- [ ] **Step 2: Commit ajustes se houve**

```bash
git add -A
git diff --cached
git commit -m "chore: limpar referências a 'score' em copy user-facing

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task QA.2: Walkthrough Playwright dos 3 fluxos

- [ ] **Step 1: Iniciar dev**

```bash
pnpm dev
```

- [ ] **Step 2: Walkthrough manual (sem script — usar browser via Playwright MCP se disponível)**

Verificar:
1. `/` carrega com hero Anton, foto preta, manifesto dourado, números, como funciona, API, testimonial, CTA, footer. Sem console error.
2. `/cadastro` carrega; cadastrar novo lojista (testar pelo menos uma vez).
3. Logar como lojista existente. `/fornecedor/cobrar` carrega. Adicionar 2 itens, escolher 30d, gerar QR. QR aparece com URL.
4. Em janela anônima, abrir o `payUrl`. Tela de confirmação aparece, pede login.
5. Logar como Joana. Volta pra `/pay/[code]`. Confirma. Tela de sucesso.
6. Voltar à janela do lojista: polling pegou confirmação, toast aparece.
7. `/demo-marketplace`: clica "Pagar com AceitoFiado", abre `/pay/[code]?from=marketplace`. Confirma. Sucesso.
8. `/docs/api`: 3 endpoints renderizados, code blocks legíveis.

- [ ] **Step 3: Tirar screenshot de cada uma das 8 telas** (opcional, pra registro do hackathon)

Salvar em `.playwright-mcp/<n>-<tela>.png`. Já está no .gitignore.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit --allow-empty -m "chore: QA fim-a-fim — 3 fluxos críticos validados

Walkthrough: landing v3, lojista cobrar, MEI pay, demo marketplace,
docs API. Sem regressões. Sem 'score' em copy pública.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Push pro origin**

```bash
git push origin main
```

---

## Out of scope (planos sequenciais)

Tudo abaixo fica para um plano separado (P1/P2 do spec):

- **P1 — refresh apps internos:** dashboard cliente MEI v3 sem "score", `/app/saude`, `/app/lojistas` com mapa Leaflet + filtros, refresh `/fornecedor/operacoes`, `/fornecedor/pedidos`, `/fornecedor/produtos`.
- **P1 — auth refresh:** repaginar `/cadastro` e `/entrar` na direção v3.
- **P2 — QA estendido:** suite Playwright automatizada com asserts visuais por screen.

---

## Self-Review Notes

- ✅ Spec coverage: todas as restrições do spec mapeadas (paleta v3, Anton/Inter/Geist Mono, palavra "score" proibida, fluxos lojista/MEI/marketplace, CheckoutSession + geo no schema, `/api/v1/checkout/*`, `/demo-marketplace`, `/docs/api`).
- ✅ Sem placeholders TBD/TODO. Cada step de código tem código completo.
- ✅ Type consistency: `code` é sempre o raw (sem hífens) no DB; `formattedCode` é com hífens (display + URL); `parseCode`/`formatCode` convertem entre eles. `entrepreneurCpf` no API é o campo `cnpj` do schema (legado).
- ✅ Commits frequentes (1 commit por task, frequentemente 1 por step lógico).
- ✅ Out of scope explícito.

Fora deste plano (assumido): refresh dos apps internos (`/app/*` e `/fornecedor/operacoes`, `/fornecedor/pedidos`) com a nova direção visual. Isso vai precisar de um plano sequencial.
