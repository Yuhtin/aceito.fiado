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
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
// Pluggy SDK importado dinamicamente dentro do handler — referencia `window`
// no load do módulo, o que quebra SSR no Next se importado no topo.

import {
  Counter,
  Eyebrow,
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

import { completeOnboardingAction } from "./_actions";
import type { CompleteOnboardingResult } from "./_actions";

const CHANNEL_TYPES = [
  { value: "PIX", label: "Pix direto", icon: Smartphone },
  { value: "SHOPEE", label: "Shopee", icon: ShoppingBag },
  { value: "MERCADO_LIVRE", label: "Mercado Livre", icon: ShoppingBag },
  { value: "INSTAGRAM", label: "Instagram (DM)", icon: AtSign },
  { value: "FEIRA", label: "Feira presencial", icon: Store },
  { value: "MAQUININHA", label: "Maquininha", icon: Banknote },
] as const;

const BUSINESS_ACTIVITY_SUGGESTIONS = [
  "marmitaria",
  "moda praia",
  "trança preta",
  "salão de beleza",
  "artesanato",
  "costura e confecção",
  "doceria",
  "venda de roupas",
  "estética",
  "salgadeira",
];

const CREDIT_AMOUNTS = [200, 400, 600, 800] as const;

type FormState = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  cnpj: string;
  businessName: string;
  declaredBusinessActivity: string;
  phone: string;
  addressCep: string;
  addressCity: string;
  addressState: string;
  addressNeighborhood: string;
  monthsActive: number;
  hasCadUnico: boolean;
  channels: { type: string; label: string; monthlyRevenue: string }[];
  pluggyItemId: string;
  initialCreditAmount: 200 | 400 | 600 | 800;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  cpf: "",
  birthDate: "",
  cnpj: "",
  businessName: "",
  declaredBusinessActivity: "",
  phone: "",
  addressCep: "",
  addressCity: "",
  addressState: "",
  addressNeighborhood: "",
  monthsActive: 12,
  hasCadUnico: false,
  channels: [{ type: "PIX", label: "Pix Sicoob", monthlyRevenue: "" }],
  pluggyItemId: "",
  initialCreditAmount: 400,
};

const STEPS = [
  { id: 1, title: "sua conta" },
  { id: 2, title: "negócio" },
  { id: 3, title: "canais" },
  { id: 4, title: "revisão" },
] as const;

type DoneState = {
  decision: "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  recommendedLimitCents: bigint;
  suggestedFeePercent: number;
  riskLevel: "BAIXO" | "MEDIO" | "ALTO";
  confidenceLevel: "ALTA" | "MEDIA" | "BAIXA";
  scoreFinal: number;
  usedOpenFinance: boolean;
  positiveFactors: string[];
  attentionFactors: string[];
  userExplanation: string;
  engine: "motor" | "fallback-local";
};

export function OnboardingFlow({ nextUrl = "/app" }: { nextUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<DoneState | null>(null);
  const [connectingPluggy, setConnectingPluggy] = useState(false);

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

  async function handleConnectPluggy() {
    setConnectingPluggy(true);
    try {
      const res = await fetch("/api/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUserId: form.cpf.replace(/\D/g, "") || "anon" }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) {
        toast.error(data.message ?? "não foi possível conectar o Open Finance agora.");
        setConnectingPluggy(false);
        return;
      }

      const { PluggyConnect } = await import("pluggy-connect-sdk");
      const pc = new PluggyConnect({
        connectToken: data.accessToken as string,
        includeSandbox: true,
        onSuccess: (itemData) => {
          update("pluggyItemId", itemData.item.id);
          toast.success("conta conectada com sucesso!");
          setConnectingPluggy(false);
        },
        onError: (error) => {
          toast.error(error.message ?? "erro ao conectar Open Finance.");
          setConnectingPluggy(false);
        },
        onClose: () => {
          setConnectingPluggy(false);
        },
      });
      await pc.init();
    } catch {
      toast.error("não foi possível iniciar o Open Finance.");
      setConnectingPluggy(false);
    }
  }

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
      const result: CompleteOnboardingResult = await completeOnboardingAction({
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ""),
        birthDate: form.birthDate,
        cnpj: form.cnpj.replace(/\D/g, ""),
        businessName: form.businessName,
        declaredBusinessActivity: form.declaredBusinessActivity,
        phone: form.phone.replace(/\D/g, ""),
        addressCep: form.addressCep.replace(/\D/g, ""),
        addressCity: form.addressCity,
        addressState: form.addressState,
        addressNeighborhood: form.addressNeighborhood,
        monthsActive: form.monthsActive,
        hasCadUnico: form.hasCadUnico,
        pluggyItemId: form.pluggyItemId || undefined,
        initialCreditAmount: form.initialCreditAmount,
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
        decision: result.decision!,
        recommendedLimitCents: BigInt(result.recommendedLimitCents!),
        suggestedFeePercent: result.suggestedFeePercent!,
        riskLevel: result.riskLevel!,
        confidenceLevel: result.confidenceLevel!,
        scoreFinal: result.scoreFinal!,
        usedOpenFinance: result.usedOpenFinance!,
        positiveFactors: result.positiveFactors!,
        attentionFactors: result.attentionFactors!,
        userExplanation: result.userExplanation!,
        engine: result.engine!,
      });
      setSubmitting(false);
    })();
  }

  function canContinue(): boolean {
    if (step === 1) {
      return (
        form.name.length >= 2 &&
        /^.+@.+\..+$/.test(form.email) &&
        form.password.length >= 6 &&
        form.cpf.replace(/\D/g, "").length === 11 &&
        /^\d{4}-\d{2}-\d{2}$/.test(form.birthDate)
      );
    }
    if (step === 2) {
      return (
        form.cnpj.replace(/\D/g, "").length === 14 &&
        form.businessName.length >= 2 &&
        form.declaredBusinessActivity.length >= 2 &&
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

  /* ─── success / done screen ─── */
  if (done) {
    const isApproved = done.decision === "APPROVED";
    const isManualReview = done.decision === "MANUAL_REVIEW";

    return (
      <div
        className="flex items-center justify-center px-6 py-10 lg:py-14"
        style={{ background: "var(--af-creme)" }}
      >
        <div
          className="w-full max-w-lg rounded-3xl p-10 shadow-xl"
          style={{
            background: "var(--af-branco)",
            border: "1px solid var(--af-borda)",
          }}
        >
          <div className="flex flex-col items-center text-center">
            {isApproved ? (
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
                  className="af-display mt-6"
                  style={{
                    fontSize: 36,
                    color: "var(--af-preto)",
                  }}
                >
                  limite aprovado:{" "}
                  <span style={{ color: "var(--af-dourado)" }}>
                    <Money
                      cents={Number(done.recommendedLimitCents)}
                      size={36}
                      weight={600}
                      color="var(--af-dourado)"
                    />
                  </span>
                </h1>
              </>
            ) : isManualReview ? (
              <>
                <div
                  className="flex size-20 items-center justify-center rounded-full"
                  style={{
                    background: "oklch(0.795 0.130 85 / 0.15)",
                    color: "var(--af-laranja)",
                  }}
                >
                  <Clock className="size-10" />
                </div>
                <h1
                  className="af-display mt-6"
                  style={{
                    fontSize: 34,
                    color: "var(--af-preto)",
                  }}
                >
                  em análise ✦
                </h1>
              </>
            ) : (
              <>
                <div
                  className="flex size-20 items-center justify-center rounded-full"
                  style={{
                    background: "oklch(0.795 0.130 85 / 0.15)",
                    color: "var(--af-laranja)",
                  }}
                >
                  <AlertTriangle className="size-10" />
                </div>
                <h1
                  className="af-display mt-6"
                  style={{
                    fontSize: 34,
                    color: "var(--af-preto)",
                  }}
                >
                  ainda não,{" "}
                  <span style={{ color: "var(--af-cinza)" }}>
                    {form.name.split(" ")[0]}
                  </span>
                </h1>
              </>
            )}

            <p
              className="af-body mt-2"
              style={{
                fontSize: 14,
                color: "var(--af-cinza)",
              }}
            >
              sem consulta ao Serasa. sem CEP no algoritmo.
            </p>

            {/* engine metadata strip */}
            <div
              className="mt-6 w-full rounded-2xl p-5"
              style={{
                background: "var(--af-preto)",
              }}
            >
              <Eyebrow color="var(--af-cinza-soft)">saúde financeira</Eyebrow>
              <div
                className="af-mono mt-3 grid grid-cols-3 gap-3"
                style={{ fontSize: 11 }}
              >
                <div className="flex flex-col gap-1">
                  <span style={{ color: "var(--af-cinza-soft)" }}>confiança</span>
                  <span
                    style={{
                      color:
                        done.confidenceLevel === "ALTA"
                          ? "var(--af-mata-2)"
                          : done.confidenceLevel === "MEDIA"
                            ? "var(--af-dourado)"
                            : "var(--af-laranja)",
                      fontWeight: 600,
                    }}
                  >
                    {done.confidenceLevel}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ color: "var(--af-cinza-soft)" }}>risco</span>
                  <span
                    style={{
                      color:
                        done.riskLevel === "BAIXO"
                          ? "var(--af-mata-2)"
                          : done.riskLevel === "MEDIO"
                            ? "var(--af-dourado)"
                            : "var(--af-laranja)",
                      fontWeight: 600,
                    }}
                  >
                    {done.riskLevel}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ color: "var(--af-cinza-soft)" }}>Open Finance</span>
                  <span
                    style={{
                      color: done.usedOpenFinance
                        ? "var(--af-mata-2)"
                        : "var(--af-cinza-soft)",
                      fontWeight: 600,
                    }}
                  >
                    {done.usedOpenFinance ? "sim" : "não"}
                  </span>
                </div>
              </div>
              <p
                className="af-mono mt-3"
                style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}
              >
                engine: {done.engine === "motor" ? "motor v1.0.0" : "fallback-local"}
              </p>
            </div>

            {/* positive factors */}
            {done.positiveFactors.length > 0 && (
              <div
                className="mt-4 w-full rounded-2xl p-5 text-left"
                style={{
                  background: "oklch(0.420 0.085 155 / 0.06)",
                  border: "1px solid oklch(0.420 0.085 155 / 0.2)",
                }}
              >
                <Eyebrow color="var(--af-mata)">pontos fortes</Eyebrow>
                <ul className="mt-2 space-y-1">
                  {done.positiveFactors.map((f, i) => (
                    <li
                      key={i}
                      className="af-body flex items-start gap-2"
                      style={{ fontSize: 13, color: "var(--af-preto)" }}
                    >
                      <span style={{ color: "var(--af-mata)", flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* attention factors */}
            {done.attentionFactors.length > 0 && (
              <div
                className="mt-3 w-full rounded-2xl p-5 text-left"
                style={{
                  background: "oklch(0.795 0.130 85 / 0.06)",
                  border: "1px solid oklch(0.795 0.130 85 / 0.2)",
                }}
              >
                <Eyebrow color="var(--af-laranja)">atenção</Eyebrow>
                <ul className="mt-2 space-y-1">
                  {done.attentionFactors.map((f, i) => (
                    <li
                      key={i}
                      className="af-body flex items-start gap-2"
                      style={{ fontSize: 13, color: "var(--af-preto)" }}
                    >
                      <span style={{ color: "var(--af-laranja)", flexShrink: 0 }}>△</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* user explanation */}
            {done.userExplanation && (
              <p
                className="af-body text-pretty mt-4"
                style={{
                  fontSize: 14,
                  color: "var(--af-cinza)",
                  maxWidth: 440,
                  textAlign: "left",
                }}
              >
                {done.userExplanation}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                router.push(
                  nextUrl && nextUrl.startsWith("/") ? nextUrl : "/app",
                )
              }
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
              style={{
                background: isApproved ? "var(--af-dourado)" : "transparent",
                color: isApproved ? "var(--af-preto)" : "var(--af-preto)",
                border: isApproved ? "none" : "1px solid var(--af-borda)",
                fontFamily: "var(--af-sans)",
              }}
            >
              ir pro app
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── multi-step form ─── */
  return (
    <div
      className="flex flex-col items-center px-6 py-10 lg:py-14"
      style={{ background: "var(--af-creme)" }}
    >
      <div className="w-full max-w-2xl">
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
                    ? "var(--af-branco)"
                    : reached
                      ? "rgba(212,160,23,0.06)"
                      : "var(--af-creme-2)",
                  border: `1px solid ${
                    active
                      ? "var(--af-dourado)"
                      : reached
                        ? "rgba(212,160,23,0.3)"
                        : "var(--af-borda)"
                  }`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="grid size-5 place-items-center rounded-full text-[10px] font-semibold"
                    style={{
                      background: active
                        ? "var(--af-dourado)"
                        : reached
                          ? "var(--af-mata)"
                          : "var(--af-borda)",
                      color:
                        active || reached
                          ? "var(--af-branco)"
                          : "var(--af-cinza)",
                    }}
                  >
                    {reached && !active ? "✓" : s.id}
                  </span>
                  <span
                    className="af-eb"
                    style={{
                      fontSize: 10,
                      color: active
                        ? "var(--af-dourado)"
                        : reached
                          ? "var(--af-mata)"
                          : "var(--af-cinza-soft)",
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
                        ? "var(--af-preto)"
                        : "var(--af-cinza)",
                  }}
                >
                  {s.title}
                </p>
              </li>
            );
          })}
        </ol>

        {/* card */}
        <div
          className="overflow-hidden rounded-3xl shadow-xl"
          style={{
            background: "var(--af-branco)",
            border: "1px solid var(--af-borda)",
          }}
        >
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="p-9">
              <p className="af-eb" style={{ color: "var(--af-cinza)" }}>
                passo 1 de 4
              </p>
              <h2
                className="af-display mt-2"
                style={{ fontSize: 36, color: "var(--af-preto)" }}
              >
                cria sua conta
              </h2>
              <p
                className="af-body mt-2"
                style={{ fontSize: 14, color: "var(--af-cinza)" }}
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
                <Field
                  label="CPF"
                  value={form.cpf}
                  onChange={(v) => update("cpf", maskCPFInput(v))}
                  placeholder="000.000.000-00"
                />
                <Field
                  type="date"
                  label="data de nascimento"
                  value={form.birthDate}
                  onChange={(v) => update("birthDate", v)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="p-9">
              <p className="af-eb" style={{ color: "var(--af-cinza)" }}>
                passo 2 de 4
              </p>
              <h2
                className="af-display mt-2"
                style={{ fontSize: 36, color: "var(--af-preto)" }}
              >
                sobre seu negócio
              </h2>
              <p
                className="af-body mt-2"
                style={{ fontSize: 14, color: "var(--af-cinza)" }}
              >
                CNPJ + endereço pra emissão da duplicata. CEP não entra na
                avaliação.
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
                <div className="space-y-2 md:col-span-2">
                  <label className="af-eb" style={{ color: "var(--af-cinza)" }}>
                    o que você vende / faz?
                  </label>
                  <input
                    type="text"
                    value={form.declaredBusinessActivity}
                    onChange={(e) => update("declaredBusinessActivity", e.target.value)}
                    placeholder="ex: marmitaria, moda praia, trança preta..."
                    list="activity-suggestions"
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{
                      background: "var(--af-branco)",
                      border: "1px solid var(--af-borda)",
                      color: "var(--af-preto)",
                      fontFamily: "var(--af-sans)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--af-dourado)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,160,23,0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--af-borda)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <datalist id="activity-suggestions">
                    {BUSINESS_ACTIVITY_SUGGESTIONS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <Field
                  label="whatsapp"
                  value={form.phone}
                  onChange={(v) => update("phone", maskPhoneInput(v))}
                  placeholder="(11) 99999-0000"
                />
                <div className="space-y-2">
                  <label
                    className="af-eb"
                    style={{ color: "var(--af-cinza)" }}
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
                        background: "var(--af-branco)",
                        border: "1px solid var(--af-borda)",
                        fontFamily: "var(--af-sans)",
                        color: "var(--af-preto)",
                      }}
                    />
                    <span
                      className="af-body"
                      style={{ fontSize: 13, color: "var(--af-cinza)" }}
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

              {/* CadÚnico checkbox */}
              <div className="mt-5">
                <label
                  className="flex cursor-pointer items-start gap-3"
                  style={{ userSelect: "none" }}
                >
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={form.hasCadUnico}
                      onChange={(e) => update("hasCadUnico", e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="grid size-5 place-items-center rounded transition-colors"
                      style={{
                        background: form.hasCadUnico ? "var(--af-mata)" : "var(--af-branco)",
                        border: `2px solid ${form.hasCadUnico ? "var(--af-mata)" : "var(--af-borda)"}`,
                      }}
                    >
                      {form.hasCadUnico && (
                        <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p
                      className="af-body"
                      style={{ fontSize: 14, fontWeight: 500, color: "var(--af-preto)" }}
                    >
                      tenho CadÚnico
                    </p>
                    <p
                      className="af-body"
                      style={{ fontSize: 12, color: "var(--af-cinza)" }}
                    >
                      cadastro único do governo federal — pode melhorar sua análise de crédito.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="p-9">
              <p className="af-eb" style={{ color: "var(--af-cinza)" }}>
                passo 3 de 4
              </p>
              <h2
                className="af-display mt-2"
                style={{ fontSize: 36, color: "var(--af-preto)" }}
              >
                conecte onde o{" "}
                <span style={{ color: "var(--af-dourado)" }}>
                  dinheiro entra.
                </span>
              </h2>
              <p
                className="af-body mt-2"
                style={{ fontSize: 14, color: "var(--af-cinza)" }}
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
                      background: "var(--af-creme)",
                      border: "1px solid var(--af-borda)",
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
                        background: "var(--af-branco)",
                        border: "1px solid var(--af-borda)",
                        fontFamily: "var(--af-sans)",
                        color: "var(--af-preto)",
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
                        background: "var(--af-branco)",
                        border: "1px solid var(--af-borda)",
                        fontFamily: "var(--af-sans)",
                        color: "var(--af-preto)",
                      }}
                    />
                    <div className="relative">
                      <span
                        className="af-mono pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ fontSize: 11, color: "var(--af-cinza)" }}
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
                          background: "var(--af-branco)",
                          border: "1px solid var(--af-borda)",
                          color: "var(--af-preto)",
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
                      className="grid size-10 place-items-center rounded-xl transition-opacity opacity-50 hover:opacity-100"
                      style={{ color: "var(--af-cinza)" }}
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
                    border: "1px dashed var(--af-borda)",
                    color: "var(--af-cinza)",
                    fontFamily: "var(--af-sans)",
                  }}
                >
                  <Plus className="size-4" /> adicionar canal
                </button>
              </div>

              {/* live preview strip */}
              <div
                className="mt-6 overflow-hidden rounded-2xl p-6"
                style={{ background: "var(--af-preto)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Eyebrow color="var(--af-cinza-soft)">
                    prévia em tempo real
                  </Eyebrow>
                  <PulseDot color="var(--af-dourado)" label="calculando" />
                </div>
                <div
                  className="af-n"
                  style={{ fontSize: 46, lineHeight: 0.95, color: "var(--af-branco)" }}
                >
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
                  className="af-mono flex gap-4 mt-2"
                  style={{ fontSize: 11 }}
                >
                  <span style={{ color: "var(--af-dourado)" }}>
                    atividade {Math.round(livePreview.score * 100)}%
                  </span>
                  <span style={{ color: "var(--af-cinza-soft)" }}>
                    mínimo{" "}
                    {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    height: 4,
                    background: "rgba(255,255,255,0.08)",
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
                        : "var(--af-dourado)",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* Open Finance section */}
              <div
                className="mt-6 rounded-2xl p-6"
                style={{
                  background: "var(--af-creme)",
                  border: "1px solid var(--af-borda)",
                }}
              >
                <Eyebrow>Open Finance (opcional)</Eyebrow>
                <p
                  className="af-body mt-2"
                  style={{ fontSize: 14, color: "var(--af-cinza)" }}
                >
                  Conectar sua conta Pix dá uma análise mais precisa do seu fluxo.
                </p>
                <div className="mt-4">
                  {form.pluggyItemId ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                        style={{
                          background: "oklch(0.420 0.085 155 / 0.1)",
                          border: "1px solid oklch(0.420 0.085 155 / 0.3)",
                          color: "var(--af-mata)",
                          fontFamily: "var(--af-sans)",
                        }}
                      >
                        <CheckCircle2 className="size-4" />
                        Conta conectada
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectPluggy}
                      disabled={connectingPluggy}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--af-preto)",
                        color: "var(--af-preto)",
                        fontFamily: "var(--af-sans)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(212,160,23,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "var(--af-dourado)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "var(--af-preto)";
                      }}
                    >
                      {connectingPluggy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Smartphone className="size-4" />
                      )}
                      Conectar Open Finance
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <div className="p-9">
              <p className="af-eb" style={{ color: "var(--af-cinza)" }}>
                passo 4 de 4 · última revisão
              </p>
              <h2
                className="af-display mt-2"
                style={{ fontSize: 36, color: "var(--af-preto)" }}
              >
                pronta pra ver seu limite?
              </h2>
              <p
                className="af-body mt-2"
                style={{ fontSize: 14, color: "var(--af-cinza)" }}
              >
                revise os dados. ao confirmar, calculamos sua atividade na rede
                e abrimos seu cockpit.
              </p>

              {/* Credit amount selector */}
              <div className="mt-7">
                <label className="af-eb" style={{ color: "var(--af-cinza)" }}>
                  qual limite você quer pedir?
                </label>
                <div className="mt-3 flex gap-3 flex-wrap">
                  {CREDIT_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => update("initialCreditAmount", amount)}
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        background:
                          form.initialCreditAmount === amount
                            ? "var(--af-preto)"
                            : "transparent",
                        border: `1px solid ${
                          form.initialCreditAmount === amount
                            ? "var(--af-preto)"
                            : "var(--af-borda)"
                        }`,
                        color:
                          form.initialCreditAmount === amount
                            ? "var(--af-branco)"
                            : "var(--af-preto)",
                        fontFamily: "var(--af-mono)",
                      }}
                    >
                      {formatBRL(amount * 100)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Summary
                  title="você"
                  rows={[
                    ["nome", form.name],
                    ["e-mail", form.email],
                    ["CPF", form.cpf],
                    ["nascimento", form.birthDate],
                  ]}
                />
                <Summary
                  title="negócio"
                  rows={[
                    ["razão social", form.businessName],
                    ["CNPJ", form.cnpj],
                    ["atividade", form.declaredBusinessActivity],
                    ["tempo de atividade", `${form.monthsActive} meses`],
                    [
                      "endereço",
                      `${form.addressNeighborhood}, ${form.addressCity}/${form.addressState}`,
                    ],
                    ["CadÚnico", form.hasCadUnico ? "sim" : "não"],
                  ]}
                />
              </div>
              <div
                className="mt-4 rounded-2xl p-5"
                style={{
                  background: "var(--af-creme)",
                  border: "1px solid var(--af-borda)",
                }}
              >
                <Eyebrow>canais</Eyebrow>
                <ul className="mt-3 grid gap-2">
                  {form.channels.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span style={{ color: "var(--af-preto)" }}>
                        {c.label || "—"}
                      </span>
                      <span className="af-mono" style={{ color: "var(--af-cinza)" }}>
                        {formatBRL(parseRevenueCents(c.monthlyRevenue))}/mês
                      </span>
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    borderTop: "1px solid var(--af-borda)",
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
                      color: "var(--af-preto)",
                    }}
                  >
                    limite estimado
                  </p>
                  <Money
                    cents={Number(livePreview.limit)}
                    size={26}
                    weight={600}
                    color="var(--af-dourado)"
                  />
                </div>
              </div>

              {/* Open Finance status */}
              <div
                className="mt-4 flex items-center justify-between rounded-2xl px-5 py-4"
                style={{
                  background: "var(--af-creme)",
                  border: "1px solid var(--af-borda)",
                }}
              >
                <div>
                  <p
                    className="af-body"
                    style={{ fontSize: 14, fontWeight: 500, color: "var(--af-preto)" }}
                  >
                    Open Finance
                  </p>
                  <p
                    className="af-body"
                    style={{ fontSize: 12, color: "var(--af-cinza)" }}
                  >
                    {form.pluggyItemId
                      ? "conta conectada — análise mais precisa"
                      : "não conectado — você pode conectar no passo 3"}
                  </p>
                </div>
                <span
                  className="af-mono text-xs font-semibold"
                  style={{
                    color: form.pluggyItemId ? "var(--af-mata)" : "var(--af-cinza-soft)",
                  }}
                >
                  {form.pluggyItemId ? "✓ sim" : "não"}
                </span>
              </div>
            </div>
          )}

          {/* footer nav */}
          <div
            className="flex items-center justify-between px-9 py-5"
            style={{ borderTop: "1px solid var(--af-borda)" }}
          >
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-30"
              style={{ color: "var(--af-cinza)" }}
            >
              <ArrowLeft className="size-4" /> voltar
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canContinue()}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{
                  background: "var(--af-preto)",
                  color: "var(--af-branco)",
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
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{
                  background: "var(--af-dourado)",
                  color: "var(--af-preto)",
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
        </div>
      </div>
    </div>
  );
}

function maskCPFInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9)
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
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
      <label className="af-eb" style={{ color: "var(--af-cinza)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
        style={{
          background: "var(--af-branco)",
          border: "1px solid var(--af-borda)",
          color: "var(--af-preto)",
          fontFamily: "var(--af-sans)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--af-dourado)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,160,23,0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--af-borda)";
          e.currentTarget.style.boxShadow = "none";
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
        background: "var(--af-creme)",
        border: "1px solid var(--af-borda)",
      }}
    >
      <Eyebrow>{title}</Eyebrow>
      <dl className="mt-3 grid gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[1fr_1.5fr] gap-3">
            <dt style={{ color: "var(--af-cinza)" }}>{k}</dt>
            <dd style={{ color: "var(--af-preto)" }}>{v || "—"}</dd>
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
