"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Banknote,
  CheckCircle2,
  Loader2,
  Plus,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AfCard,
  Counter,
  Eyebrow,
  GradientMesh,
  Money,
  PulseDot,
} from "@/components/af";
import {
  formatBRL,
  maskCEPInput,
  maskCNPJInput,
  maskPhoneInput,
} from "@/lib/format";
import { calculateScore, SCORING_CONSTANTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

import { completeOnboardingAction } from "./_actions";

const CHANNEL_TYPES = [
  { value: "PIX", label: "Pix direto", icon: Smartphone },
  { value: "SHOPEE", label: "Shopee", icon: ShoppingBag },
  { value: "MERCADO_LIVRE", label: "Mercado Livre", icon: ShoppingBag },
  { value: "INSTAGRAM", label: "Instagram (DM)", icon: AtSign },
  { value: "FEIRA", label: "Feira presencial", icon: Store },
  { value: "MAQUININHA", label: "Maquininha", icon: Banknote },
] as const;

type FormState = {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  businessName: string;
  phone: string;
  addressCep: string;
  addressCity: string;
  addressState: string;
  addressNeighborhood: string;
  monthsActive: number;
  channels: { type: string; label: string; monthlyRevenue: string }[];
};

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  cnpj: "",
  businessName: "",
  phone: "",
  addressCep: "",
  addressCity: "",
  addressState: "",
  addressNeighborhood: "",
  monthsActive: 12,
  channels: [{ type: "PIX", label: "Pix Sicoob", monthlyRevenue: "" }],
};

const STEPS = [
  { id: 1, title: "sua conta" },
  { id: 2, title: "negócio" },
  { id: 3, title: "canais" },
  { id: 4, title: "score" },
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{
    score: number;
    limit: bigint;
    approved: boolean;
  } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const livePreview = useMemo(() => {
    const totalRevenue = form.channels.reduce(
      (a, c) => a + parseRevenueCents(c.monthlyRevenue),
      0,
    );
    const valid = form.channels.filter(
      (c) => parseRevenueCents(c.monthlyRevenue) > 0,
    );
    if (valid.length === 0)
      return { score: 0, approved: false, limit: 0n };
    const stability =
      valid.length >= 3 ? 0.85 : valid.length === 2 ? 0.7 : 0.55;
    const result = calculateScore({
      monthlyRevenueCents: BigInt(totalRevenue),
      monthsActive: form.monthsActive,
      channelsCount: valid.length,
      cashflowStabilityScore: stability,
      supplierHistoryScore: 0,
    });
    return {
      score: result.score,
      approved: result.approved,
      limit: result.approvedLimitCents,
    };
  }, [form.channels, form.monthsActive]);

  async function handleSubmit() {
    const validChannels = form.channels
      .map((c) => ({
        type: c.type,
        label: c.label.trim(),
        monthlyRevenueCents: parseRevenueCents(c.monthlyRevenue),
      }))
      .filter((c) => c.label.length > 0 && c.monthlyRevenueCents > 0);

    if (validChannels.length === 0) {
      toast.error("adicione pelo menos um canal com faturamento.");
      return;
    }

    (async () => {
      setSubmitting(true);
      const result = await completeOnboardingAction({
        name: form.name,
        email: form.email,
        password: form.password,
        cnpj: form.cnpj.replace(/\D/g, ""),
        businessName: form.businessName,
        phone: form.phone.replace(/\D/g, ""),
        addressCep: form.addressCep.replace(/\D/g, ""),
        addressCity: form.addressCity,
        addressState: form.addressState,
        addressNeighborhood: form.addressNeighborhood,
        monthsActive: form.monthsActive,
        channels: validChannels as Parameters<
          typeof completeOnboardingAction
        >[0]["channels"],
      });
      if (!result.ok) {
        setSubmitting(false);
        toast.error(result.error ?? "não conseguimos cadastrar agora");
        return;
      }
      setDone({
        score: result.score!,
        limit: BigInt(result.approvedLimitCents!),
        approved: !!result.approved,
      });
      setSubmitting(false);
    })();
  }

  function canContinue(): boolean {
    if (step === 1) {
      return (
        form.name.length >= 2 &&
        /^.+@.+\..+$/.test(form.email) &&
        form.password.length >= 6
      );
    }
    if (step === 2) {
      return (
        form.cnpj.replace(/\D/g, "").length === 14 &&
        form.businessName.length >= 2 &&
        form.phone.replace(/\D/g, "").length >= 10 &&
        form.addressCep.replace(/\D/g, "").length === 8 &&
        form.addressCity.length >= 2 &&
        form.addressState.length === 2 &&
        form.addressNeighborhood.length >= 2
      );
    }
    if (step === 3) {
      return form.channels.some(
        (c) =>
          c.label.length > 0 && parseRevenueCents(c.monthlyRevenue) > 0,
      );
    }
    return true;
  }

  if (done) {
    return (
      <div className="w-full max-w-2xl">
        <AfCard padding={40} radius={24} className="shadow-af-lift">
          <div className="flex flex-col items-center text-center">
            {done.approved ? (
              <>
                <div
                  className="flex size-20 items-center justify-center rounded-full"
                  style={{
                    background: "oklch(0.420 0.085 155 / 0.12)",
                    color: "var(--af-mata)",
                  }}
                >
                  <CheckCircle2 className="size-10" />
                </div>
                <h1
                  className="af-h-tight mt-6"
                  style={{
                    fontSize: 32,
                    margin: "24px 0 0",
                    color: "var(--af-ink-deep)",
                  }}
                >
                  você está aprovada,{" "}
                  <span style={{ color: "var(--af-terra)" }}>
                    {form.name.split(" ")[0]}
                  </span>{" "}
                  ✦
                </h1>
                <p
                  className="af-body"
                  style={{
                    fontSize: 14,
                    color: "var(--af-ink-soft)",
                    margin: "8px 0 0",
                  }}
                >
                  sem consulta ao Serasa. sem CEP no algoritmo.
                </p>
                <GradientMesh
                  className="mt-8 w-full overflow-hidden"
                  style={{ borderRadius: 18, padding: 28 }}
                >
                  <Eyebrow>seu limite aprovado</Eyebrow>
                  <div style={{ marginTop: 8 }}>
                    <Money cents={Number(done.limit)} size={56} weight={600} />
                  </div>
                  <p
                    className="af-mono"
                    style={{
                      fontSize: 12,
                      color: "var(--af-ink-soft)",
                      margin: "6px 0 0",
                    }}
                  >
                    score {Math.round(done.score * 100)}% · disponível
                    imediatamente
                  </p>
                </GradientMesh>
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium"
                  style={{
                    background: "var(--af-ink)",
                    color: "var(--af-paper)",
                    fontFamily: "var(--af-sans)",
                  }}
                >
                  ver meu cockpit
                  <ArrowRight className="size-4" />
                </button>
              </>
            ) : (
              <>
                <div
                  className="flex size-20 items-center justify-center rounded-full"
                  style={{
                    background: "oklch(0.795 0.130 85 / 0.15)",
                    color: "var(--af-acafrao)",
                  }}
                >
                  <Sparkles className="size-10" />
                </div>
                <h1
                  className="af-h-tight"
                  style={{
                    fontSize: 30,
                    margin: "24px 0 0",
                    color: "var(--af-ink-deep)",
                  }}
                >
                  ainda não dá pra liberar limite
                </h1>
                <p
                  className="af-body text-pretty"
                  style={{
                    fontSize: 14,
                    color: "var(--af-ink-soft)",
                    margin: "10px 0 0",
                    maxWidth: 440,
                  }}
                >
                  seu score ficou em{" "}
                  <strong style={{ color: "var(--af-ink)" }}>
                    {Math.round(done.score * 100)}%
                  </strong>
                  , abaixo do mínimo de{" "}
                  {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%. Não
                  é rejeição: é convite pra conectar mais canais.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
                  style={{
                    background: "transparent",
                    color: "var(--af-ink)",
                    border: "1px solid var(--af-ink-20)",
                    fontFamily: "var(--af-sans)",
                  }}
                >
                  entrar mesmo assim <ArrowRight className="size-4" />
                </button>
              </>
            )}
          </div>
        </AfCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      {/* stepper */}
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const reached = s.id <= step;
          const active = s.id === step;
          return (
            <li
              key={s.id}
              className="rounded-2xl px-3.5 py-2.5 transition-colors"
              style={{
                background: active
                  ? "var(--af-paper)"
                  : reached
                    ? "oklch(0.420 0.085 155 / 0.05)"
                    : "oklch(0.972 0.008 75 / 0.3)",
                border: `1px solid ${
                  active
                    ? "var(--af-terra)"
                    : reached
                      ? "oklch(0.420 0.085 155 / 0.3)"
                      : "var(--af-ink-08)"
                }`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="grid size-5 place-items-center rounded-full text-[10px] font-semibold"
                  style={{
                    background: active
                      ? "var(--af-terra)"
                      : reached
                        ? "var(--af-mata)"
                        : "var(--af-paper-3)",
                    color:
                      active || reached
                        ? "var(--af-paper)"
                        : "var(--af-ink-soft)",
                  }}
                >
                  {reached && !active ? "✓" : s.id}
                </span>
                <span
                  className="af-mono"
                  style={{
                    fontSize: 10,
                    color: active
                      ? "var(--af-terra)"
                      : reached
                        ? "var(--af-mata)"
                        : "var(--af-ink-soft)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  passo {s.id}
                </span>
              </div>
              <p
                className="af-body mt-1"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color:
                    active || reached
                      ? "var(--af-ink-deep)"
                      : "var(--af-ink-soft)",
                }}
              >
                {s.title}
              </p>
            </li>
          );
        })}
      </ol>

      <AfCard padding={0} radius={24} className="shadow-af-lift overflow-hidden">
        {step === 1 && (
          <div className="p-9">
            <Eyebrow>passo 1 de 4</Eyebrow>
            <h2
              className="af-h-tight"
              style={{
                fontSize: 28,
                margin: "10px 0 0",
                color: "var(--af-ink-deep)",
              }}
            >
              cria sua conta
            </h2>
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-ink-soft)",
                margin: "6px 0 0",
              }}
            >
              em 5 minutos a gente termina.
            </p>
            <div className="mt-7 space-y-4">
              <Field
                label="seu nome completo"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="ex: Joana Bezerra"
              />
              <Field
                type="email"
                label="e-mail"
                value={form.email}
                onChange={(v) => update("email", v.toLowerCase())}
                placeholder="seunome@exemplo.com.br"
              />
              <Field
                type="password"
                label="senha (mínimo 6 caracteres)"
                value={form.password}
                onChange={(v) => update("password", v)}
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-9">
            <Eyebrow>passo 2 de 4</Eyebrow>
            <h2
              className="af-h-tight"
              style={{
                fontSize: 28,
                margin: "10px 0 0",
                color: "var(--af-ink-deep)",
              }}
            >
              sobre seu negócio
            </h2>
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-ink-soft)",
                margin: "6px 0 0",
              }}
            >
              CNPJ + endereço pra emissão da duplicata. CEP não entra no score.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Field
                label="razão social"
                value={form.businessName}
                onChange={(v) => update("businessName", v)}
                placeholder="ex: Onda Preta Biquínis"
              />
              <Field
                label="CNPJ"
                value={form.cnpj}
                onChange={(v) => update("cnpj", maskCNPJInput(v))}
                placeholder="00.000.000/0000-00"
              />
              <Field
                label="whatsapp"
                value={form.phone}
                onChange={(v) => update("phone", maskPhoneInput(v))}
                placeholder="(11) 99999-0000"
              />
              <div className="space-y-2">
                <label
                  className="af-eb"
                  style={{ color: "var(--af-ink-soft)" }}
                >
                  há quanto tempo empreende?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={form.monthsActive}
                    onChange={(e) =>
                      update("monthsActive", parseInt(e.target.value) || 0)
                    }
                    className="w-24 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    style={{
                      background: "var(--af-paper-2)",
                      border: "1px solid var(--af-ink-08)",
                      fontFamily: "var(--af-sans)",
                      color: "var(--af-ink)",
                    }}
                  />
                  <span
                    className="af-body"
                    style={{ fontSize: 13, color: "var(--af-ink-soft)" }}
                  >
                    meses
                  </span>
                </div>
              </div>
              <Field
                label="CEP"
                value={form.addressCep}
                onChange={(v) => update("addressCep", maskCEPInput(v))}
                placeholder="00000-000"
              />
              <Field
                label="bairro"
                value={form.addressNeighborhood}
                onChange={(v) => update("addressNeighborhood", v)}
                placeholder="ex: Heliópolis"
              />
              <Field
                label="cidade"
                value={form.addressCity}
                onChange={(v) => update("addressCity", v)}
                placeholder="ex: São Paulo"
              />
              <Field
                label="UF"
                value={form.addressState}
                onChange={(v) =>
                  update("addressState", v.toUpperCase().slice(0, 2))
                }
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-9">
            <Eyebrow>passo 3 de 4</Eyebrow>
            <h2
              className="af-h-tight"
              style={{
                fontSize: 28,
                margin: "10px 0 0",
                color: "var(--af-ink-deep)",
              }}
            >
              conecte onde o{" "}
              <span style={{ color: "var(--af-terra)" }}>dinheiro entra.</span>
            </h2>
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-ink-soft)",
                margin: "6px 0 0",
              }}
            >
              cada canal que você liga vira mais limite. a gente olha
              recebimento — nunca histórico de dívida.
            </p>

            <div className="mt-6 space-y-3">
              {form.channels.map((channel, idx) => (
                <div
                  key={idx}
                  className="grid items-center gap-3 rounded-2xl p-3"
                  style={{
                    background: "var(--af-paper-2)",
                    border: "1px solid var(--af-ink-08)",
                    gridTemplateColumns: "150px 1fr 170px auto",
                  }}
                >
                  <select
                    value={channel.type}
                    onChange={(e) => {
                      const next = [...form.channels];
                      next[idx] = { ...next[idx], type: e.target.value };
                      update("channels", next);
                    }}
                    className="h-10 rounded-xl px-3 text-sm focus:outline-none"
                    style={{
                      background: "var(--af-paper)",
                      border: "1px solid var(--af-ink-08)",
                      fontFamily: "var(--af-sans)",
                      color: "var(--af-ink)",
                    }}
                  >
                    {CHANNEL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={channel.label}
                    placeholder="apelido (ex: Pix Sicoob)"
                    onChange={(e) => {
                      const next = [...form.channels];
                      next[idx] = { ...next[idx], label: e.target.value };
                      update("channels", next);
                    }}
                    className="h-10 rounded-xl px-3.5 text-sm focus:outline-none"
                    style={{
                      background: "var(--af-paper)",
                      border: "1px solid var(--af-ink-08)",
                      fontFamily: "var(--af-sans)",
                      color: "var(--af-ink)",
                    }}
                  />
                  <div className="relative">
                    <span
                      className="af-mono pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ fontSize: 11, color: "var(--af-ink-soft)" }}
                    >
                      R$/mês
                    </span>
                    <input
                      inputMode="numeric"
                      value={channel.monthlyRevenue}
                      placeholder="0,00"
                      onChange={(e) => {
                        const next = [...form.channels];
                        next[idx] = {
                          ...next[idx],
                          monthlyRevenue: e.target.value.replace(
                            /[^\d,.]/g,
                            "",
                          ),
                        };
                        update("channels", next);
                      }}
                      className="af-mono h-10 w-full rounded-xl pl-16 pr-3 text-right text-sm tabular-nums focus:outline-none"
                      style={{
                        background: "var(--af-paper)",
                        border: "1px solid var(--af-ink-08)",
                        color: "var(--af-ink)",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.channels.length === 1) return;
                      update(
                        "channels",
                        form.channels.filter((_, i) => i !== idx),
                      );
                    }}
                    className="grid size-10 place-items-center rounded-xl transition-colors hover:opacity-100 opacity-60"
                    style={{ color: "var(--af-ink-soft)" }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update("channels", [
                    ...form.channels,
                    { type: "SHOPEE", label: "", monthlyRevenue: "" },
                  ])
                }
                className="inline-flex items-center justify-center gap-2 w-full rounded-2xl py-3 text-sm font-medium transition-colors"
                style={{
                  background: "transparent",
                  border: "1px dashed var(--af-ink-12)",
                  color: "var(--af-ink-soft)",
                  fontFamily: "var(--af-sans)",
                }}
              >
                <Plus className="size-4" /> adicionar canal
              </button>
            </div>

            {/* preview score · GradientMesh dark */}
            <GradientMesh
              dark
              className="mt-6 overflow-hidden"
              style={{ borderRadius: 18, padding: 22, color: "var(--af-paper)" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Eyebrow color="oklch(0.972 0.008 75 / 0.55)">
                  prévia em tempo real
                </Eyebrow>
                <PulseDot color="var(--af-acafrao)" label="calculando" />
              </div>
              <div className="af-n" style={{ fontSize: 46, lineHeight: 0.95 }}>
                <span
                  style={{
                    fontSize: 18,
                    opacity: 0.4,
                    marginRight: 4,
                    verticalAlign: "0.5em",
                  }}
                >
                  R$
                </span>
                <Counter
                  to={Number(livePreview.limit) / 100}
                  duration={1200}
                  decimals={2}
                />
              </div>
              <div
                style={{ display: "flex", gap: 14, marginTop: 8 }}
                className="af-mono"
              >
                <span style={{ fontSize: 11, color: "var(--af-acafrao)" }}>
                  score {Math.round(livePreview.score * 100)}%
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "oklch(0.972 0.008 75 / 0.55)",
                  }}
                >
                  mínimo{" "}
                  {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%
                </span>
              </div>
              <div
                style={{
                  marginTop: 12,
                  height: 4,
                  background: "oklch(0.972 0.008 75 / 0.12)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, livePreview.score * 100)}%`,
                    height: "100%",
                    background: livePreview.approved
                      ? "var(--af-mata-2)"
                      : "var(--af-acafrao)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </GradientMesh>
          </div>
        )}

        {step === 4 && (
          <div className="p-9">
            <Eyebrow>passo 4 de 4 · última revisão</Eyebrow>
            <h2
              className="af-h-tight"
              style={{
                fontSize: 28,
                margin: "10px 0 0",
                color: "var(--af-ink-deep)",
              }}
            >
              pronta pra ver seu limite?
            </h2>
            <p
              className="af-body"
              style={{
                fontSize: 14,
                color: "var(--af-ink-soft)",
                margin: "6px 0 0",
              }}
            >
              revise os dados. ao confirmar, calculamos seu score e abrimos seu
              cockpit.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Summary
                title="você"
                rows={[
                  ["nome", form.name],
                  ["e-mail", form.email],
                ]}
              />
              <Summary
                title="negócio"
                rows={[
                  ["razão social", form.businessName],
                  ["CNPJ", form.cnpj],
                  ["tempo de atividade", `${form.monthsActive} meses`],
                  [
                    "endereço",
                    `${form.addressNeighborhood}, ${form.addressCity}/${form.addressState}`,
                  ],
                ]}
              />
            </div>
            <div
              className="mt-4 rounded-2xl p-5"
              style={{
                background: "var(--af-paper-2)",
                border: "1px solid var(--af-ink-08)",
              }}
            >
              <Eyebrow>canais</Eyebrow>
              <ul className="mt-3 grid gap-2">
                {form.channels.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{c.label || "—"}</span>
                    <span className="af-mono">
                      {formatBRL(parseRevenueCents(c.monthlyRevenue))}/mês
                    </span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  borderTop: "1px solid var(--af-ink-08)",
                  marginTop: 16,
                  paddingTop: 14,
                }}
                className="flex items-center justify-between"
              >
                <p
                  className="af-body"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  limite estimado
                </p>
                <Money cents={Number(livePreview.limit)} size={26} weight={600} color="var(--af-terra)" />
              </div>
            </div>
          </div>
        )}

        {/* footer nav */}
        <div
          className="flex items-center justify-between px-9 py-5"
          style={{ borderTop: "1px solid var(--af-ink-08)" }}
        >
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-30"
            style={{ color: "var(--af-ink-soft)" }}
          >
            <ArrowLeft className="size-4" /> voltar
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canContinue()}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{
                background: "var(--af-ink)",
                color: "var(--af-paper)",
                fontFamily: "var(--af-sans)",
              }}
            >
              continuar <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                background: "var(--af-terra)",
                color: "var(--af-paper)",
                fontFamily: "var(--af-sans)",
              }}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  calcular meu limite <Sparkles className="size-4" />
                </>
              )}
            </button>
          )}
        </div>
      </AfCard>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label
        className="af-eb"
        style={{ color: "var(--af-ink-soft)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
        style={{
          background: "var(--af-paper-2)",
          border: "1px solid var(--af-ink-08)",
          color: "var(--af-ink)",
          fontFamily: "var(--af-sans)",
        }}
      />
    </div>
  );
}

function Summary({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--af-paper-2)",
        border: "1px solid var(--af-ink-08)",
      }}
    >
      <Eyebrow>{title}</Eyebrow>
      <dl className="mt-3 grid gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[1fr_1.5fr] gap-3">
            <dt style={{ color: "var(--af-ink-soft)" }}>{k}</dt>
            <dd style={{ color: "var(--af-ink)" }}>{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function parseRevenueCents(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(clean);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}
