import {
  AfButton,
  AfCard,
  AfLogo,
  BRLLive,
  CodeBlock,
  Counter,
  Eyebrow,
  GradientMesh,
  Money,
  PulseDot,
  Tag,
} from "@/components/af";
import { TopNav } from "@/components/marketing/top-nav";

export default function HomePage() {
  return (
    <div className="af-screen min-h-screen">
      <Hero />
      <TrustBar />
      <HowItWorks />
      <TravaSection />
      <Metrics />
      <Testimonial />
      <CTABanner />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <GradientMesh style={{ paddingBottom: 80 }}>
      <TopNav />
      <div className="px-14 pt-14 pb-0 mx-auto" style={{ maxWidth: 1320 }}>
        <div className="flex items-center gap-2.5 mb-7">
          <Tag color="var(--af-terra)">novo · v0.4</Tag>
          <span style={{ fontSize: 13.5, color: "var(--af-ink-2)" }}>
            Bacen autorizou o piloto.{" "}
            <span
              style={{
                borderBottom: "1px solid currentColor",
                cursor: "pointer",
              }}
            >
              Ler o memorando →
            </span>
          </span>
        </div>

        <h1
          className="af-h-tight text-balance"
          style={{
            fontSize: "clamp(48px, 7vw, 92px)",
            margin: 0,
            maxWidth: 1100,
            color: "var(--af-ink-deep)",
          }}
        >
          Capital de giro pra quem o algoritmo deixou de fora.
        </h1>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-9 mt-9">
          <p
            className="af-body text-pretty"
            style={{
              fontSize: 19,
              maxWidth: 560,
              color: "var(--af-ink-2)",
              margin: 0,
            }}
          >
            AceitoFiado é a infraestrutura de crédito produtivo embutido pra cadeia
            afroempreendedora brasileira. Fornecedores oferecem fiado seguro:
            a gente analisa risco, cobra automático e trava o Pix. Sem Serasa no
            meio.
          </p>
          <div className="flex gap-3 flex-shrink-0">
            <AfButton variant="primary" size="xl" href="/cadastro">
              conhecer o aceito
            </AfButton>
            <AfButton variant="outline" size="xl" icon="▸" href="/entrar?demo=joana">
              ver demo de 90s
            </AfButton>
          </div>
        </div>
      </div>

      {/* product preview + code block */}
      <div className="px-14 mt-16 mx-auto" style={{ maxWidth: 1320 }}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr] items-stretch">
          {/* phone preview tilted */}
          <div
            className="flex items-center justify-center relative overflow-hidden"
            style={{
              padding: 36,
              background: "oklch(0.972 0.008 75 / 0.4)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.21 0.025 250 / 0.06)",
              borderRadius: 20,
            }}
          >
            <div
              style={{
                width: 280,
                height: 580,
                background: "var(--af-paper)",
                borderRadius: 36,
                border: "1px solid var(--af-ink-12)",
                boxShadow: "var(--af-shadow-lift)",
                padding: "28px 22px",
                transform: "perspective(1200px) rotateY(-8deg) rotateX(2deg)",
                transformOrigin: "center",
              }}
            >
              <Eyebrow>limite agora</Eyebrow>
              <div style={{ marginTop: 12 }}>
                <Money cents={842000} size={52} />
              </div>
              <div
                style={{
                  marginTop: 18,
                  height: 5,
                  background: "var(--af-paper-3)",
                  borderRadius: 99,
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div style={{ width: "30%", background: "var(--af-terra)" }} />
                <div style={{ width: "70%", background: "var(--af-mata-2)" }} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <span
                  className="af-mono"
                  style={{ fontSize: 10, color: "var(--af-terra)" }}
                >
                  R$ 3.580 comprometido
                </span>
                <span
                  className="af-mono"
                  style={{ fontSize: 10, color: "var(--af-mata)" }}
                >
                  R$ 8.420 livre
                </span>
              </div>
              <div style={{ marginTop: 22 }}>
                <Eyebrow>operações ativas</Eyebrow>
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {(
                    [
                      ["Afroflora", 89],
                      ["Aruanda", 23],
                      ["Bahia Tempero", 89],
                    ] as const
                  ).map(([n, p]) => (
                    <div
                      key={n}
                      style={{
                        padding: 11,
                        background: "var(--af-paper-2)",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <span
                          className="af-body"
                          style={{ fontSize: 12, fontWeight: 500 }}
                        >
                          {n}
                        </span>
                        <span
                          className="af-mono"
                          style={{ fontSize: 10, color: "var(--af-mata)" }}
                        >
                          {p}%
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          height: 3,
                          background: "var(--af-ink-08)",
                          borderRadius: 99,
                        }}
                      >
                        <div
                          style={{
                            width: `${p}%`,
                            height: "100%",
                            background: "var(--af-mata-2)",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* code block — cálculo do limite como API */}
          <CodeBlock
            title="aceito.fiado · cálculo do limite"
            style={{
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <PulseDot color="var(--af-mata-2)" />
              <span
                className="af-mono"
                style={{
                  fontSize: 11,
                  color: "oklch(0.972 0.008 75 / 0.5)",
                }}
              >
                POST /v1/credit/score
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                color: "oklch(0.972 0.008 75 / 0.85)",
                whiteSpace: "pre",
              }}
            >
              {`{
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;empreendedora&quot;
              </span>
              {`: `}
              <span style={{ color: "var(--af-dende)" }}>
                &quot;joice@aceito.fiado&quot;
              </span>
              {`,
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;canais_conectados&quot;
              </span>
              {`: [
    `}
              <span style={{ color: "var(--af-dende)" }}>
                &quot;pix.cpf&quot;
              </span>
              {`,
    `}
              <span style={{ color: "var(--af-dende)" }}>
                &quot;instagram.shop&quot;
              </span>
              {`,
    `}
              <span style={{ color: "var(--af-dende)" }}>
                &quot;shopee.loja&quot;
              </span>
              {`
  ],
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;recebimento_medio_90d&quot;
              </span>
              {`: `}
              <span style={{ color: "var(--af-mata-2)" }}>1252000</span>
              {`,
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;fator_trava&quot;
              </span>
              {`: `}
              <span style={{ color: "var(--af-mata-2)" }}>0.30</span>
              {`,
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;prazo_medio_dias&quot;
              </span>
              {`: `}
              <span style={{ color: "var(--af-mata-2)" }}>21</span>
              {`,

  `}
              <span style={{ color: "oklch(0.972 0.008 75 / 0.4)" }}>
                // derivado · sem consultar bureau
              </span>
              {`
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;limite_aprovado&quot;
              </span>
              {`: `}
              <span
                style={{
                  color: "var(--af-terra-2)",
                  fontWeight: 600,
                }}
              >
                842000
              </span>
              {`,
  `}
              <span style={{ color: "var(--af-acafrao)" }}>
                &quot;score_serasa&quot;
              </span>
              {`: `}
              <span style={{ color: "var(--af-brasa)" }}>null</span>
              {`
}`}
            </pre>
            <div
              style={{
                marginTop: "auto",
                paddingTop: 16,
                borderTop: "1px solid oklch(0.972 0.008 75 / 0.08)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                className="af-mono"
                style={{
                  fontSize: 11,
                  color: "oklch(0.972 0.008 75 / 0.5)",
                }}
              >
                200 OK · 142ms
              </span>
              <span
                className="af-mono"
                style={{ fontSize: 11, color: "var(--af-mata-2)" }}
              >
                ↑ R$ 1.420 vs. último mês
              </span>
            </div>
          </CodeBlock>
        </div>
      </div>
    </GradientMesh>
  );
}

function TrustBar() {
  return (
    <div
      className="px-14 py-12"
      style={{
        background: "var(--af-paper)",
        borderTop: "1px solid var(--af-ink-08)",
        borderBottom: "1px solid var(--af-ink-08)",
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-center gap-12"
        style={{ maxWidth: 1320 }}
      >
        <span className="af-eb flex-shrink-0">
          1.847 empreendedoras operam de
        </span>
        <div className="flex flex-wrap gap-10 items-center justify-between flex-1 opacity-55">
          {[
            "Heliópolis",
            "Capão Redondo",
            "Brasilândia",
            "Brás",
            "Bom Retiro",
            "Diadema",
            "Guarulhos",
          ].map((c) => (
            <span
              key={c}
              style={{
                fontFamily: "var(--af-sans)",
                fontSize: 17,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div
      id="como-funciona"
      className="px-14 py-28"
      style={{ background: "var(--af-paper)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1320 }}>
        <Eyebrow>como funciona</Eyebrow>
        <h2
          className="af-h-tight text-balance"
          style={{
            fontSize: "clamp(40px, 5vw, 64px)",
            margin: "20px 0 0",
            maxWidth: 880,
            color: "var(--af-ink-deep)",
          }}
        >
          Três tempos. O Pix faz o último sozinho.
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              n: "01",
              t: "A empreendedora compra fiado.",
              d: "No catálogo do fornecedor parceiro, vê limite e prazo na hora. Decide quanto, quando, com qual fatia de trava. Assina contrato em linguagem de gente em 40 segundos.",
              tag: "PARA ELA",
              color: "var(--af-terra)",
            },
            {
              n: "02",
              t: "A gente paga o fornecedor à vista.",
              d: "No mesmo dia da compra, o atacadista recebe 100% do valor. Capital de giro dele não trava esperando D+30. Em troca, ele topa precificar pra rede de aceito.fiado.",
              tag: "PARA ELE",
              color: "var(--af-mata)",
            },
            {
              n: "03",
              t: "O Pix dela liquida automático.",
              d: "A maquininha continua igual. Cada Pix que entra, uma fatia (entre 15% e 50%, ela escolhe) volta pra liquidar a duplicata. Quando zera, acaba. Sem cobrança, sem ligação.",
              tag: "PARA A REDE",
              color: "var(--af-dende)",
            },
          ].map((it) => (
            <AfCard key={it.n} padding={28} radius={20}>
              <div className="flex items-center justify-between">
                <span
                  className="af-n"
                  style={{ fontSize: 32, color: it.color }}
                >
                  {it.n}
                </span>
                <Tag color={it.color}>{it.tag}</Tag>
              </div>
              <h3
                className="af-h"
                style={{
                  fontSize: 24,
                  margin: "40px 0 14px",
                  color: "var(--af-ink-deep)",
                }}
              >
                {it.t}
              </h3>
              <p
                className="af-body text-pretty"
                style={{
                  fontSize: 14.5,
                  color: "var(--af-ink-2)",
                  margin: 0,
                }}
              >
                {it.d}
              </p>
            </AfCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function TravaSection() {
  return (
    <GradientMesh dark style={{ padding: "130px 56px" }}>
      <div
        className="mx-auto grid md:grid-cols-2 gap-20 items-center"
        style={{ maxWidth: 1320 }}
      >
        <div>
          <Eyebrow color="oklch(0.972 0.008 75 / 0.6)">
            a engrenagem é visível
          </Eyebrow>
          <h2
            className="af-h-tight"
            style={{
              fontSize: "clamp(40px, 4.5vw, 60px)",
              margin: "20px 0 0",
              color: "var(--af-paper)",
            }}
          >
            A trava do Pix acontece ao vivo,
            <span style={{ color: "var(--af-acafrao)" }}> diante dela.</span>
          </h2>
          <p
            className="af-body text-pretty"
            style={{
              fontSize: 17,
              marginTop: 24,
              color: "oklch(0.972 0.008 75 / 0.7)",
              maxWidth: 540,
            }}
          >
            Cada Pix que entra na conta dela dispara um split em milissegundos:
            fatia da trava vai pro fornecedor; o resto fica com ela. Visível
            antes, durante e depois. Auditável a cada operação. Esta é a
            feature que substituiu o algoritmo de Serasa.
          </p>
          <div className="flex gap-3 mt-8">
            <AfButton variant="paper" size="lg" href="/app/trava">
              ver a trava ao vivo
            </AfButton>
            <AfButton
              variant="ghost"
              size="lg"
              icon="↗"
              style={{ color: "var(--af-paper)" }}
            >
              documentação da API
            </AfButton>
          </div>
        </div>

        <div
          style={{
            background: "oklch(0.972 0.008 75 / 0.06)",
            border: "1px solid oklch(0.972 0.008 75 / 0.1)",
            borderRadius: 20,
            padding: 28,
            color: "var(--af-paper)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Eyebrow color="oklch(0.972 0.008 75 / 0.55)">
              liquidação · hoje
            </Eyebrow>
            <PulseDot color="var(--af-acafrao)" label="ao vivo" />
          </div>
          <div className="af-n" style={{ fontSize: 64, lineHeight: 0.95 }}>
            <span
              style={{
                fontSize: 22,
                opacity: 0.4,
                marginRight: 5,
                verticalAlign: "0.55em",
              }}
            >
              R$
            </span>
            <BRLLive initial={1247.5} ratePerSec={0.32} jitter={0.6} />
          </div>
          <div
            style={{ display: "flex", gap: 18, marginTop: 10 }}
            className="af-mono"
          >
            <span style={{ fontSize: 12, color: "var(--af-acafrao)" }}>
              ↑ R$ 0,32/s
            </span>
            <span
              style={{
                fontSize: 12,
                color: "oklch(0.972 0.008 75 / 0.55)",
              }}
            >
              47% da meta · 1.847 empreendedoras
            </span>
          </div>
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                display: "flex",
                height: 56,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "30%",
                  background: "var(--af-terra)",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="af-mono"
                  style={{
                    fontSize: 10,
                    color: "oklch(0.972 0.008 75 / 0.7)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  30% trava
                </span>
                <span className="af-n" style={{ fontSize: 17 }}>
                  → fornecedor
                </span>
              </div>
              <div
                style={{
                  width: "70%",
                  background: "var(--af-mata-2)",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="af-mono"
                  style={{
                    fontSize: 10,
                    color: "oklch(0.972 0.008 75 / 0.7)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  70%
                </span>
                <span className="af-n" style={{ fontSize: 17 }}>
                  → empreendedora
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Eyebrow color="oklch(0.972 0.008 75 / 0.55)">
              últimos pix · 60s
            </Eyebrow>
            <div style={{ marginTop: 12 }}>
              {(
                [
                  ["Marcela P.", "pagou", "R$ 18,90", "30% → Afroflora", "agora"],
                  ["Loja Tia Cida", "pagou", "R$ 42,50", "30% → Afroflora", "12s"],
                  ["Renata S.", "pagou", "R$ 8,60", "25% → Aruanda", "34s"],
                ] as const
              ).map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom:
                      i < 2 ? "1px solid oklch(0.972 0.008 75 / 0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <PulseDot color="var(--af-mata-2)" size={5} />
                    <span style={{ fontSize: 13 }}>
                      {row[0]} {row[1]}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                    }}
                  >
                    <span
                      className="af-mono"
                      style={{
                        fontSize: 11,
                        color: "oklch(0.972 0.008 75 / 0.55)",
                      }}
                    >
                      {row[3]}
                    </span>
                    <span className="af-n" style={{ fontSize: 14 }}>
                      {row[2]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GradientMesh>
  );
}

function Metrics() {
  return (
    <div
      className="px-14 py-28"
      style={{ background: "var(--af-paper-2)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1320 }}>
        <Eyebrow>até hoje · maio de 2026</Eyebrow>
        <h2
          className="af-h-tight"
          style={{
            fontSize: "clamp(36px, 4.5vw, 56px)",
            margin: "20px 0 0",
            maxWidth: 720,
            color: "var(--af-ink-deep)",
          }}
        >
          Sem consultar Serasa, nem uma vez.
        </h2>
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            {
              v: (
                <>
                  <span style={{ fontSize: 32, opacity: 0.4 }}>R$</span>{" "}
                  <Counter to={4.2} decimals={1} suffix="M" />
                </>
              ),
              l: "girados na cadeia",
              sub: "+R$ 380k em 30 dias",
            },
            {
              v: <Counter to={1847} />,
              l: "empreendedoras ativas",
              sub: "em 12 bairros · SP",
            },
            {
              v: (
                <>
                  <Counter to={12} />
                  <span style={{ opacity: 0.5 }}>d</span>
                </>
              ),
              l: "prazo médio",
              sub: "liquida antes do venc.",
            },
            {
              v: <Counter to={0} />,
              l: "consultas a bureau",
              sub: "desde sempre",
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid var(--af-ink-12)",
                paddingTop: 24,
              }}
            >
              <div
                className="af-n"
                style={{
                  fontSize: 60,
                  lineHeight: 0.95,
                  color: "var(--af-ink-deep)",
                }}
              >
                {m.v}
              </div>
              <div
                className="af-body"
                style={{
                  fontSize: 15,
                  marginTop: 14,
                  color: "var(--af-ink-2)",
                }}
              >
                {m.l}
              </div>
              <div
                className="af-mono"
                style={{
                  fontSize: 11.5,
                  color: "var(--af-ink-soft)",
                  marginTop: 6,
                }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Testimonial() {
  return (
    <div
      className="px-14 py-28"
      style={{ background: "var(--af-paper)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        <Eyebrow>vozes</Eyebrow>
        <blockquote
          className="af-h-tight text-pretty"
          style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            lineHeight: 1.15,
            margin: "24px 0 0",
            color: "var(--af-ink-deep)",
          }}
        >
          “Banco me disse não três vezes em 2024 sem motivo. Mês passado fechei
          o
          <span style={{ color: "var(--af-terra)" }}>
            {" "}maior pedido da loja{" "}
          </span>
          e a AceitoFiado liquidou em 11 dias sem eu ter que ligar pra
          ninguém. É a primeira vez que crédito serviu pra mim.”
        </blockquote>
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            className="af-placeholder"
            style={{ width: 56, height: 56, borderRadius: 99 }}
          >
            foto
          </div>
          <div>
            <div
              className="af-body"
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--af-ink-deep)",
              }}
            >
              Joice Oliveira
            </div>
            <div
              className="af-mono"
              style={{
                fontSize: 12,
                color: "var(--af-ink-soft)",
                marginTop: 2,
              }}
            >
              moda joice · capão redondo · sp · cliente desde out/2024
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 12,
            }}
          >
            <AfButton variant="outline" size="md" icon="←">
              anterior
            </AfButton>
            <AfButton variant="outline" size="md">
              próximo
            </AfButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTABanner() {
  return (
    <GradientMesh style={{ padding: "120px 56px" }}>
      <div
        className="mx-auto text-center"
        style={{ maxWidth: 1100 }}
      >
        <Eyebrow>comece em 90 segundos</Eyebrow>
        <h2
          className="af-h-tight"
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            margin: "20px 0 0",
            color: "var(--af-ink-deep)",
          }}
        >
          Descubra seu limite
          <br />
          <span style={{ color: "var(--af-terra)" }}>
            sem ninguém consultar nada.
          </span>
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <AfButton variant="primary" size="xl" href="/cadastro">
            conhecer o aceito.fiado
          </AfButton>
          <AfButton variant="outline" size="xl" icon="▸" href="/entrar?demo=joana">
            demonstração de 90s
          </AfButton>
        </div>
        <p
          className="af-mono"
          style={{
            fontSize: 12,
            color: "var(--af-ink-soft)",
            marginTop: 24,
          }}
        >
          sem cartão · sem CNPJ · sem consulta a bureau · documento em pt-br
          claro
        </p>
      </div>
    </GradientMesh>
  );
}

function Footer() {
  return (
    <div
      className="px-14 py-20"
      style={{
        background: "var(--af-ink-deep)",
        color: "var(--af-paper)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1320 }}>
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12">
          <div>
            <AfLogo
              size={26}
              color="var(--af-paper)"
              accent="var(--af-acafrao)"
            />
            <p
              className="af-body text-pretty"
              style={{
                fontSize: 13.5,
                color: "oklch(0.972 0.008 75 / 0.6)",
                margin: "16px 0 0",
                maxWidth: 320,
              }}
            >
              Infraestrutura de crédito produtivo embutido pra cadeia
              afroempreendedora brasileira. Construído em Heliópolis, Capão e
              Brasilândia.
            </p>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <PulseDot
                color="var(--af-acafrao)"
                label="operando · todos os sistemas ok"
              />
            </div>
          </div>

          {(
            [
              [
                "produto",
                [
                  "Cockpit",
                  "Catálogo",
                  "Trava ao vivo",
                  "API para fornecedores",
                  "Mudanças recentes",
                ],
              ],
              [
                "empresa",
                ["Manifesto", "Imprensa", "Carreira (5)", "Contato"],
              ],
              [
                "recursos",
                ["Documentação", "Status", "Guia da empreendedora", "Termos"],
              ],
              [
                "social",
                ["Instagram", "LinkedIn", "Newsletter mensal", "GitHub"],
              ],
            ] as const
          ).map(([title, items]) => (
            <div key={title}>
              <div
                className="af-eb"
                style={{ color: "oklch(0.972 0.008 75 / 0.5)" }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                {items.map((it) => (
                  <span
                    key={it}
                    style={{
                      fontSize: 14,
                      color: "oklch(0.972 0.008 75 / 0.85)",
                      cursor: "pointer",
                    }}
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 60,
            paddingTop: 28,
            borderTop: "1px solid oklch(0.972 0.008 75 / 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            className="af-mono"
            style={{ fontSize: 11, color: "oklch(0.972 0.008 75 / 0.5)" }}
          >
            AceitoFiado · Tecnologia LTDA · 55.328.114/0001-92 · Bacen Proc. Nº
            XX.XXX/2024 · v0.4.2
          </span>
          <span
            className="af-mono"
            style={{ fontSize: 11, color: "oklch(0.972 0.008 75 / 0.5)" }}
          >
            © 2026 · São Paulo
          </span>
        </div>
      </div>
    </div>
  );
}
