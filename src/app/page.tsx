import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  HandCoins,
  Lock,
  ShieldOff,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-warm-radial">
        <div className="absolute inset-x-0 top-0 -z-10 h-[60vh] pattern-dots text-primary/[0.06]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_1fr] md:py-28 md:gap-16 lg:py-32">
          <div className="flex flex-col items-start">
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-primary/30 bg-primary/5 text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              AfroCapital Hack — protótipo funcional
            </Badge>
            <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-balance text-foreground md:text-6xl lg:text-7xl">
              Capital de giro pra quem o{" "}
              <span className="italic text-primary">Serasa</span> deixou
              de fora.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              A empreendedora compra a prazo do fornecedor parceiro. O fornecedor
              recebe à vista. A gente cobra direto do Pix dela. O bureau de
              crédito não decide nada na cadeia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 px-6">
                <Link href="/cadastro">
                  Quero capital de giro <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 px-6">
                <Link href="/entrar">
                  Entrar como fornecedor
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Sem consulta ao bureau
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Aprovação em segundos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Duplicata escritural registrada
              </div>
            </div>
          </div>

          {/* Card visual — preview do produto */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_50%_30%,_oklch(0.55_0.17_35_/_0.15),_transparent_70%)]" />
            <Card className="overflow-hidden border-border/60 bg-card shadow-soft-lg">
              <div className="border-b border-border/60 bg-muted/40 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-destructive/70" />
                  <div className="size-2.5 rounded-full bg-warning/70" />
                  <div className="size-2.5 rounded-full bg-success/70" />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  app.aceitofiado.com.br/app
                </p>
                <div className="w-8" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Limite disponível
                    </p>
                    <p className="mt-1 font-display text-3xl font-medium tabular-nums">
                      R$ 18.536,<span className="text-muted-foreground">37</span>
                    </p>
                  </div>
                  <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">
                    Score 76%
                  </Badge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Próximo vencimento
                    </p>
                    <p className="mt-1 font-medium tabular-nums text-sm">
                      em 40 dias
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      R$ 1.732,50
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Já capturado
                    </p>
                    <p className="mt-1 font-medium tabular-nums text-sm text-success">
                      R$ 1.732,50
                    </p>
                    <p className="text-xs text-muted-foreground">
                      100% via Pix travado
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-border/70 bg-gradient-to-br from-primary/5 to-accent/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <HandCoins className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Distribuidora Tropical aceita fiado
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        78 produtos disponíveis · 30, 45 ou 60 dias
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-border/70 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Captura do Pix nos últimos 7 dias</span>
                    <span className="text-success">+ R$ 1.732,50</span>
                  </div>
                  <div className="mt-3 flex h-12 items-end gap-1">
                    {[35, 48, 62, 41, 78, 56, 82].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* PROBLEMA: bureau penaliza */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                O problema
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium leading-tight md:text-4xl">
                Algoritmo decide o que CEP fala. CEP fala o que Brasil já decidiu.
              </h2>
            </div>
            <Card className="border-border/60 p-6 shadow-soft">
              <p className="font-display text-5xl font-medium tabular-nums text-primary">
                3<span className="text-2xl">×</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Empreendedor negro tem crédito negado três vezes mais que branco,
                em condições idênticas de faturamento (BID, 2022).
              </p>
            </Card>
            <Card className="border-border/60 p-6 shadow-soft">
              <p className="font-display text-5xl font-medium tabular-nums text-primary">
                60<span className="text-2xl">%</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Está na informalidade ou em CEP periférico — variável mais
                discriminatória dos modelos de score brasileiros.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-3 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Como funciona
          </p>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium leading-tight md:text-5xl text-balance">
            Três passos. Sem precisar passar pelo bureau.
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground text-pretty">
            A trava de recebíveis é o que faz a conta fechar — o risco é amarrado
            ao Pix dela, não ao CPF dela.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: TrendingUp,
              title: "Você conecta seus canais",
              body:
                "Pix, Shopee, Mercado Livre, Instagram. A gente lê o fluxo real, calcula um score auditável e dá um limite proporcional ao que você fatura. Sem consulta a Serasa.",
            },
            {
              n: "02",
              icon: HandCoins,
              title: "Compra a prazo, fornecedor recebe à vista",
              body:
                "Escolhe os produtos no catálogo dos fornecedores parceiros. Ele emite duplicata escritural e a gente liquida pra ele no mesmo dia. Você paga em 30, 45 ou 60 dias.",
            },
            {
              n: "03",
              icon: Lock,
              title: "Pix trava sozinho até quitar",
              body:
                "Cada Pix que entra na sua conta direciona uma fatia (até 35%) pra liquidar a duplicata. Registrado em B3. Você não precisa lembrar de boleto nenhum.",
            },
          ].map((step) => (
            <Card
              key={step.n}
              className="group relative overflow-hidden border-border/60 p-7 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <step.icon className="size-5" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-medium leading-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* POR QUE FUNCIONA — anti-bureau */}
      <section id="por-que" className="border-y border-border/60 bg-warm-gradient">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                Resposta estrutural
              </p>
              <h2 className="mt-2 font-display text-4xl font-medium leading-tight md:text-5xl text-balance">
                Não consertamos o algoritmo. Tiramos ele do caminho.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
                Construir um bureau alternativo melhor que Serasa é uma corrida
                de uma década. A jogada inteligente é construir uma cadeia onde
                ele não decide nada.
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                Como? <strong className="text-foreground">A gente é o lender.</strong> Não precisamos
                que ninguém aceite nossa decisão. Underwriting é cross-channel,
                o risco é amarrado ao recebível, e o produto financeiro
                (duplicata escritural) já é regulado.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: ShieldOff,
                  title: "Bureau não entra na decisão",
                  body:
                    "Score sai dos canais conectados, não do histórico de inadimplência registrado pelo Serasa.",
                },
                {
                  icon: Lock,
                  title: "Risco amarrado ao recebível",
                  body:
                    "Trava digital direciona até 35% do Pix da empreendedora. Default cai em uma ordem de magnitude.",
                },
                {
                  icon: CircleDollarSign,
                  title: "Estrutura financeira já existe",
                  body:
                    "Duplicata escritural (Lei 13.775/2018), trava B3 (Res. 4.734/2019), FIDC (Res. CVM 175). Nada inventado — só não aplicado nessa cadeia.",
                },
                {
                  icon: Users,
                  title: "Cadeia curada",
                  body:
                    "Fornecedores parceiros e empreendedoras na mesma plataforma. A liquidez circula dentro da cadeia afro.",
                },
              ].map((it) => (
                <Card
                  key={it.title}
                  className="border-border/60 bg-card/80 p-5 shadow-soft"
                >
                  <div className="flex gap-4">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
                      <it.icon className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold leading-snug">
                        {it.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {it.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARA FORNECEDORES */}
      <section
        id="para-fornecedores"
        className="mx-auto max-w-7xl px-6 py-20 md:py-28"
      >
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Para fornecedores
            </p>
            <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl text-balance">
              Vende mais. Recebe à vista. Sem risco de calote.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground text-pretty">
              Seu cliente compra a prazo. Você recebe na mesma hora, com pequeno
              desconto. A AceitoFiado assume o risco da duplicata. Você foca em
              produção e logística.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/cadastro?role=supplier">
                  Sou fornecedor <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2">
                <Link href="/entrar">Já tenho conta</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { kpi: "+R$ 0", label: "Custo de cadastro" },
              { kpi: "à vista", label: "Recebimento em até 24h" },
              { kpi: "3%", label: "Desconto médio cobrado" },
              { kpi: "0", label: "Risco de inadimplência" },
            ].map((item) => (
              <Card
                key={item.label}
                className="border-border/60 p-5 shadow-soft"
              >
                <p className="font-display text-3xl font-medium text-primary">
                  {item.kpi}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.label}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-[oklch(0.4_0.13_30)]" />
        <div className="absolute inset-0 -z-10 pattern-dots text-white/10" />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center text-primary-foreground md:py-28">
          <Logo size="lg" variant="mono" className="text-primary-foreground" />
          <h2 className="mt-8 font-display text-4xl font-medium leading-tight md:text-5xl text-balance">
            Sua cadeia. Sua liquidez. Sem bureau no caminho.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85 text-pretty">
            Conecte seus canais em 5 minutos. Veja um limite real, calculado pelo
            que você fatura — não pelo CEP que você mora.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/cadastro">
                Começar agora <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/entrar?demo=joana">
                Ver demo da Joana <Store className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
