# Checkout Pivot · P1 (Apps Internos Refresh)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Refrescar todas as páginas internas dos apps (cliente MEI + lojista) e auth pra direção v3 (preto + dourado + Anton + Inter), zero "score" em copy, e adicionar `/app/lojistas` com mapa Leaflet.

**Architecture:** Apply tokens v3 já estabelecidos em P0/Phase 0. Pages internas mantêm lógica existente (queries, server actions) mas viram visual v3. `/app/score` é renomeado pra `/app/saude` (palavra "score" sai). `/app/fiado/[supplierId]` é removido (não somos marketplace, MEI não compra direto pelo nosso app).

**Tech Stack:** Mesmo de P0. Adiciona `react-leaflet` + `leaflet` (já instalados em PF.2). CSS do leaflet importado on-demand no componente que usa.

**Spec:** `docs/superpowers/specs/2026-05-24-checkout-pivot-design.md` (seções P1)
**Plano P0:** `docs/superpowers/plans/2026-05-24-checkout-pivot.md`

---

## Princípios pra todas as phases

1. **Tokens v3** já estão em `globals.css` desde Phase 0. Use `var(--af-preto)`, `var(--af-creme)`, `var(--af-dourado)`, `var(--af-cinza)`, `var(--af-branco)`, `var(--af-mata)`, `var(--af-laranja)`, `var(--af-borda)`. Use classes `af-display` (Anton uppercase), `af-eb` (eyebrow mono), `af-body` (Inter), `af-mono` (Geist Mono).
2. **Palavra "score" BANIDA em UI strings.** Substitua por:
   - "saúde financeira" — pra visualização da MEI
   - "limite aprovado" — pra valor de fiado
   - "atividade na rede" — pra histórico de comportamento
   - Variáveis internas (`scoring.ts`, `ScoreSnapshot`, etc.) podem permanecer.
3. **Preserve lógica/queries.** Só muda layout/cor/copy/tipografia.
4. **`pnpm tsc --noEmit` após cada Task.** Sem erros antes de commitar.
5. **Commit por Task** com `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

---

## Phase 6 — App MEI internals

### Task 6.1: Renomear /app/score → /app/saude

- [ ] Ler `src/app/(entrepreneur)/app/score/page.tsx` pra entender estrutura atual.
- [ ] `git mv src/app/\(entrepreneur\)/app/score src/app/\(entrepreneur\)/app/saude`
- [ ] Editar `saude/page.tsx`:
  - Substituir "Score" / "score" / "pontuação" por "Saúde financeira" / "limite" / "atividade na rede" em ALL copy strings.
  - Aplicar paleta v3: backgrounds `var(--af-creme)`, cards `var(--af-branco)`, texto `var(--af-preto)`, accents `var(--af-dourado)`, eyebrows `var(--af-cinza)`.
  - Headings com classe `af-display` (Anton uppercase).
  - Eyebrows com classe `af-eb`.
  - Manter cálculos e queries intactos.
- [ ] Atualizar `src/app/(entrepreneur)/app/_nav.ts`: trocar entry `score` por `saude` (label "Saúde financeira", path `/app/saude`).
- [ ] `pnpm tsc --noEmit` → zero erros.
- [ ] Commit: `feat(app-mei): renomear /score → /saude + tokens v3 + sem palavra score`

### Task 6.2: Remover /app/fiado/[supplierId] (não somos marketplace)

- [ ] `git rm -rf src/app/\(entrepreneur\)/app/fiado/\[supplierId\]`
- [ ] Editar `src/app/(entrepreneur)/app/fiado/page.tsx`:
  - Remover qualquer link/seção que dependia de `[supplierId]/catalog-shopper`.
  - Manter listagem de fiados/operations já existentes.
  - Aplicar tokens v3.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): remover catalog-shopper — MEI não compra no nosso app`

### Task 6.3: Refresh `/app` dashboard

- [ ] Ler `src/app/(entrepreneur)/app/page.tsx`.
- [ ] Substituir TODAS as ocorrências de "score" em copy por "saúde financeira" / "limite".
- [ ] Aplicar paleta v3: hero do dashboard com `var(--af-preto)` background ou `var(--af-creme)` claro (sua escolha — coerência com landing). Cards com `var(--af-branco)`. Accents dourados.
- [ ] Headings principais com `af-display`. Métricas com Anton big number + label mono cinza.
- [ ] Atualizar `src/components/shell/app-shell.tsx` e `page-header.tsx` pra tokens v3 (background creme, accent dourado).
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): dashboard /app refresh v3 sem palavra score`

### Task 6.4: Refresh `/app/trava` + trava-live-stream

- [ ] Editar `src/app/(entrepreneur)/app/trava/page.tsx` e `trava-live-stream.tsx`:
  - Aplicar tokens v3. Manter pulse dot dourado.
  - Headings com `af-display`.
  - Pix tickers em mono.
  - Background da seção live: `var(--af-preto)` com accent dourado (estilo similar à seção dark da landing v3).
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): trava live refresh v3`

### Task 6.5: Refresh `/app/historico`

- [ ] Editar `src/app/(entrepreneur)/app/historico/page.tsx`:
  - Aplicar tokens v3.
  - Headings `af-display`.
  - Tabela ou lista com bordas `var(--af-borda)`, hover `var(--af-creme-2)`.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): historico refresh v3`

### Task 6.6: Refresh `/app/fiado` + `/app/fiado/op/[id]`

- [ ] Editar `src/app/(entrepreneur)/app/fiado/page.tsx`:
  - Listar fiados em aberto + próximos vencimentos (já é o que faz). Aplicar v3.
  - Status badges: PENDING usa `var(--af-cinza)`, ACTIVE/FUNDED usa `var(--af-dourado)`, REPAID usa `var(--af-sucesso)`, OVERDUE usa `var(--af-vermelho)`.
- [ ] Editar `src/app/(entrepreneur)/app/fiado/op/[id]/page.tsx`:
  - Tokens v3. Headings `af-display`. Receipt-style.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): fiado list + detail refresh v3`

---

## Phase 7 — `/app/lojistas` com mapa

### Task 7.1: Server page + filtros

**Files:**
- Create: `src/app/(entrepreneur)/app/lojistas/page.tsx`
- Create: `src/app/(entrepreneur)/app/lojistas/lojistas-map.tsx`
- Create: `src/app/(entrepreneur)/app/lojistas/_actions.ts`

- [ ] Em `_actions.ts` server action que carrega lojistas filtrados:

```ts
"use server";

import { db } from "@/lib/db";

export interface LojistaCard {
  id: string;
  name: string;
  category: string;
  bairro: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  serviceTags: string[];
}

export async function listLojistas(filter?: {
  tag?: string;
  bairro?: string;
}): Promise<LojistaCard[]> {
  const rows = await db.supplierProfile.findMany({
    where: {
      ...(filter?.tag ? { serviceTags: { has: filter.tag } } : {}),
      ...(filter?.bairro
        ? { addressNeighborhood: { contains: filter.bairro, mode: "insensitive" } }
        : {}),
    },
    select: {
      id: true,
      businessName: true,
      category: true,
      addressNeighborhood: true,
      addressCity: true,
      addressState: true,
      latitude: true,
      longitude: true,
      serviceTags: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.businessName,
    category: r.category,
    bairro: r.addressNeighborhood,
    city: r.addressCity,
    state: r.addressState,
    lat: r.latitude,
    lng: r.longitude,
    serviceTags: r.serviceTags,
  }));
}
```

- [ ] Em `page.tsx` (server component):

```tsx
import { requireEntrepreneur } from "@/lib/auth";
import { listLojistas } from "./_actions";
import { LojistasView } from "./lojistas-map";

export default async function LojistasPage() {
  await requireEntrepreneur();
  const lojistas = await listLojistas();
  return <LojistasView initial={lojistas} />;
}
```

- [ ] Em `lojistas-map.tsx` (client component):
  - Header: title + filtros (input bairro + chips de serviceTags).
  - Lista lado esquerdo (40%), mapa Leaflet lado direito (60%).
  - Mapa: `MapContainer` + `TileLayer` (OSM) + `Marker` por lojista com lat/lng + `Popup` com nome.
  - **Import Leaflet com `dynamic` ssr:false:**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LojistaCard } from "./_actions";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);
```

  - **Fix do ícone do leaflet** (default broken no Next): no useEffect on mount, import L e seta L.Icon.Default.

```tsx
useEffect(() => {
  // @ts-expect-error leaflet hack
  import("leaflet").then((L) => {
    // @ts-expect-error _getIconUrl
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  });
}, []);
```

  - Centrar mapa em São Paulo: `[-23.55, -46.63]` zoom 11.
  - Estilo: cards de lojista com tokens v3. Filtros chips dourados quando ativos.
  - Header com `af-display` "Lojistas que aceitam fiado".

- [ ] Adicionar item ao `_nav.ts` do entrepreneur: "Lojistas" → `/app/lojistas`.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-mei): catálogo de lojistas com mapa Leaflet + filtros`

---

## Phase 8 — App fornecedor internals

### Task 8.1: Refresh `/fornecedor` dashboard

- [ ] Editar `src/app/(supplier)/fornecedor/page.tsx`:
  - Tokens v3. Headings `af-display`. Card "vendas hoje", "fiado em aberto", "recebíveis previstos".
  - Hero strip dourado destacando "Cobrar fiado" → CTA pra `/fornecedor/cobrar`.
- [ ] Atualizar `src/app/(supplier)/fornecedor/layout.tsx` se necessário pra tokens v3 (background creme).
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-fornecedor): dashboard refresh v3`

### Task 8.2: Refresh `/fornecedor/operacoes`

- [ ] Editar `src/app/(supplier)/fornecedor/operacoes/page.tsx`:
  - Tokens v3. Tabela com bordas `var(--af-borda)`.
  - Status badges como em Task 6.6.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-fornecedor): operacoes refresh v3`

### Task 8.3: Refresh `/fornecedor/pedidos` + `[id]`

- [ ] Editar `src/app/(supplier)/fornecedor/pedidos/page.tsx` e `[id]/page.tsx` e `[id]/confirm-button.tsx`:
  - Tokens v3.
  - Confirm button: variant primary dourada.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-fornecedor): pedidos list + detail refresh v3`

### Task 8.4: Refresh `/fornecedor/produtos`

- [ ] Editar `src/app/(supplier)/fornecedor/produtos/page.tsx`:
  - Tokens v3. Grid de produtos com cards `var(--af-branco)`.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(app-fornecedor): produtos refresh v3`

---

## Phase 9 — Auth refresh

### Task 9.1: Refresh `/entrar`

- [ ] Editar `src/app/(auth)/entrar/page.tsx` e `login-form.tsx` e `layout.tsx`:
  - Layout split: lado esquerdo formulário (creme), lado direito visual preto + dourado + Anton (similar ao hero v3).
  - Form com inputs `var(--af-branco)` border `var(--af-borda)`.
  - CTA preto.
  - Headings `af-display`.
  - Manter lógica de `?next=` que já adicionei em Phase 3.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(auth): /entrar repaginado v3`

### Task 9.2: Refresh `/cadastro`

- [ ] Editar `src/app/(auth)/cadastro/page.tsx` e `onboarding-flow.tsx`:
  - Aplicar tokens v3 em todas as 4 etapas do onboarding.
  - Buttons dourados.
  - Headings Anton.
  - Manter lógica.
- [ ] `pnpm tsc --noEmit`.
- [ ] Commit: `feat(auth): /cadastro repaginado v3`

---

## Phase 10 — Sweep final + push

- [ ] Grep "score" em todo `src/`:

```bash
grep -rni "score\|pontuação\|pontuacao" src/ --include="*.tsx" --include="*.ts" | grep -v generated | grep -v scoring.ts | grep -v ScoreSnapshot
```

Esperado: zero matches que sejam strings user-facing. Strings de import/var name de backend são OK.

- [ ] Rodar build de produção:

```bash
pnpm build 2>&1 | tail -30
```

Esperado: build bem-sucedido. Se falhar, fix.

- [ ] Screenshots finais via Playwright:

```bash
# Manualmente via mcp playwright:
# /app, /app/saude, /app/lojistas, /app/trava
# /fornecedor, /fornecedor/operacoes, /fornecedor/pedidos, /fornecedor/produtos
# /entrar, /cadastro
```

- [ ] Push:

```bash
git push origin main
```

- [ ] Commit final (se hover ajustes):

```bash
git commit -m "chore: sweep final P1 — refresh apps internos + auth + lojistas com mapa

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Out of scope

- Adicionar produtos novos pelo lojista (form de novo produto refinado) — fica pra P2.
- Bulk operações no /fornecedor/pedidos.
- Filtros avançados no /fornecedor/operacoes.
- Notificações in-app.
- Avatares de usuário customizáveis.
