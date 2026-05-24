"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  AtSign,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import {
  completeOnboardingAction,
  type CompleteOnboardingResult,
} from "./_actions";

// ─────────────────────── Types ───────────────────────

type ChannelType =
  | "PIX"
  | "INSTAGRAM"
  | "FEIRA"
  | "MAQUININHA"
  | "SHOPEE"
  | "MERCADO_LIVRE"
  | "OUTRO";

type CreditAmount = 200 | 400 | 600 | 800;

type FormState = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  cnpj: string;
  businessName: string;
  declaredBusinessActivity: string;
  monthsActive: number;
  hasCadUnico: boolean;
  channelTypes: ChannelType[];
  monthlyRevenueCents: number;
  initialCreditAmount: CreditAmount;
  pluggyItemId: string;
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
  monthsActive: 0,
  hasCadUnico: false,
  channelTypes: [],
  monthlyRevenueCents: 0,
  initialCreditAmount: 400,
  pluggyItemId: "",
};

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

// ─────────────────────── Constants ───────────────────────

const ACTIVITY_SUGGESTIONS = [
  "marmitaria",
  "moda praia",
  "trança e cabelo crespo",
  "salão de beleza",
  "salgadinho e doceria",
  "bazar e brechó",
  "cosméticos afro",
  "acessórios artesanais",
  "comida de bairro",
  "feira presencial",
];

const CHANNELS: { value: ChannelType; label: string; icon: typeof Smartphone }[] =
  [
    { value: "PIX", label: "Pix direto", icon: Smartphone },
    { value: "INSTAGRAM", label: "Instagram", icon: AtSign },
    { value: "FEIRA", label: "Feira", icon: Store },
    { value: "MAQUININHA", label: "Maquininha", icon: Banknote },
    { value: "SHOPEE", label: "Shopee", icon: ShoppingBag },
    { value: "MERCADO_LIVRE", label: "Mercado Livre", icon: ShoppingBag },
    { value: "OUTRO", label: "Outro canal", icon: Sparkles },
  ];

const REVENUE_RANGES = [
  { label: "até R$ 2 mil", representative: 150_000 },
  { label: "R$ 2 a 5 mil", representative: 350_000 },
  { label: "R$ 5 a 10 mil", representative: 750_000 },
  { label: "R$ 10 a 25 mil", representative: 1_750_000 },
  { label: "R$ 25 a 50 mil", representative: 3_750_000 },
  { label: "R$ 50 mil ou mais", representative: 7_500_000 },
];

const TIME_RANGES = [
  { label: "menos de 6 meses", months: 3 },
  { label: "6 a 12 meses", months: 9 },
  { label: "1 a 2 anos", months: 18 },
  { label: "2 a 5 anos", months: 42 },
  { label: "mais de 5 anos", months: 72 },
];

const CREDIT_OPTIONS: CreditAmount[] = [200, 400, 600, 800];

// ─────────────────────── Masks ───────────────────────

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const maskCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskCNPJ = (v: string) => {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const brl = (cents: number | bigint) => {
  const v = typeof cents === "bigint" ? Number(cents) : cents;
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
};

// ─────────────────────── Step config ───────────────────────

interface StepDef {
  id: string;
  validate: (f: FormState) => boolean;
  optional?: boolean;
}

const STEPS: StepDef[] = [
  { id: "name", validate: (f) => f.name.trim().length >= 2 },
  { id: "email", validate: (f) => /^.+@.+\..+$/.test(f.email) },
  { id: "password", validate: (f) => f.password.length >= 6 },
  { id: "cpf", validate: (f) => onlyDigits(f.cpf).length === 11 },
  { id: "birthDate", validate: (f) => /^\d{4}-\d{2}-\d{2}$/.test(f.birthDate) },
  { id: "cnpj", validate: (f) => onlyDigits(f.cnpj).length === 14 },
  { id: "businessName", validate: (f) => f.businessName.trim().length >= 2 },
  {
    id: "activity",
    validate: (f) => f.declaredBusinessActivity.trim().length >= 2,
  },
  { id: "time", validate: (f) => f.monthsActive > 0 },
  { id: "channels", validate: (f) => f.channelTypes.length > 0 },
  { id: "revenue", validate: (f) => f.monthlyRevenueCents > 0 },
  { id: "credit", validate: () => true },
  { id: "pluggy", validate: () => true, optional: true },
];

const TOTAL_STEPS = STEPS.length;

// ─────────────────────── Animation variants ───────────────────────

const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
};

// ─────────────────────── Main ───────────────────────

export function OnboardingFlow({ nextUrl = "/app" }: { nextUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [calculating, setCalculating] = useState(false);
  const [done, setDone] = useState<DoneState | null>(null);
  const [pluggyLoading, setPluggyLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const currentStep = STEPS[step];
  const canAdvance = currentStep?.validate(form) ?? false;
  const isLast = step === TOTAL_STEPS - 1;

  function advance() {
    if (!canAdvance && !currentStep?.optional) return;
    if (isLast) {
      void submit();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function back() {
    if (step === 0) return;
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setCalculating(true);
    const start = Date.now();

    const result: CompleteOnboardingResult = await completeOnboardingAction({
      name: form.name,
      email: form.email,
      password: form.password,
      cpf: onlyDigits(form.cpf),
      birthDate: form.birthDate,
      cnpj: onlyDigits(form.cnpj),
      businessName: form.businessName,
      declaredBusinessActivity: form.declaredBusinessActivity,
      monthsActive: form.monthsActive,
      hasCadUnico: form.hasCadUnico,
      pluggyItemId: form.pluggyItemId || undefined,
      initialCreditAmount: form.initialCreditAmount,
      channels: form.channelTypes.map((t) => ({
        type: t,
        label: CHANNELS.find((c) => c.value === t)?.label ?? t,
        monthlyRevenueCents: Math.round(
          form.monthlyRevenueCents / Math.max(1, form.channelTypes.length),
        ),
      })),
      // Defaults pro MVP — UI não pede mais
      phone: "",
      addressCep: "00000000",
      addressCity: "São Paulo",
      addressState: "SP",
      addressNeighborhood: "—",
    });

    // Anima por no mínimo 2.5s pra a tela de calc respirar
    const elapsed = Date.now() - start;
    if (elapsed < 2500) {
      await new Promise((r) => setTimeout(r, 2500 - elapsed));
    }

    if (!result.ok) {
      setCalculating(false);
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
    setCalculating(false);
  }

  async function handleConnectPluggy() {
    setPluggyLoading(true);
    try {
      const res = await fetch("/api/connect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientUserId: onlyDigits(form.cpf) || "anon",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) {
        toast.error(
          data.message ?? "não foi possível conectar o Open Finance agora.",
        );
        setPluggyLoading(false);
        return;
      }
      const { PluggyConnect } = await import("pluggy-connect-sdk");
      const pc = new PluggyConnect({
        connectToken: data.accessToken as string,
        includeSandbox: true,
        connectorIds: [2, 4],
        onSuccess: (itemData) => {
          update("pluggyItemId", itemData.item.id);
          toast.success("conta conectada com segurança.");
          setPluggyLoading(false);
        },
        onError: (error) => {
          toast.error(error.message ?? "erro ao conectar Open Finance.");
          setPluggyLoading(false);
        },
        onClose: () => setPluggyLoading(false),
      });
      await pc.init();
    } catch {
      toast.error("não foi possível iniciar o Open Finance.");
      setPluggyLoading(false);
    }
  }

  // ── Calculating screen ──
  if (calculating) {
    return <CalculatingScreen />;
  }

  // ── Result screen ──
  if (done) {
    return (
      <ResultScreen
        done={done}
        userName={form.name.split(" ")[0]}
        onContinue={() => router.push(nextUrl)}
      />
    );
  }

  // ── Step flow ──
  return (
    <div className="flex flex-col px-6 py-8 lg:px-14 lg:py-12 min-h-[calc(100vh-110px)]">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="flex-1 flex items-center mt-12 lg:mt-16">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep.id} {...slide}>
              {renderStep(step, form, update, handleConnectPluggy, pluggyLoading)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <NavBar
        canBack={step > 0}
        onBack={back}
        canAdvance={canAdvance || !!currentStep.optional}
        onAdvance={advance}
        isLast={isLast}
        canSkip={!!currentStep.optional}
      />
    </div>
  );
}

// ─────────────────────── Step renderers ───────────────────────

function renderStep(
  step: number,
  form: FormState,
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void,
  handleConnectPluggy: () => void,
  pluggyLoading: boolean,
) {
  switch (STEPS[step].id) {
    case "name":
      return (
        <FieldShell
          eyebrow={`pergunta 1 de ${TOTAL_STEPS}`}
          question="como você se chama?"
          hint="seu nome completo, pra gente conhecer você."
        >
          <TextInput
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Joana Bezerra"
            autoFocus
          />
        </FieldShell>
      );
    case "email":
      return (
        <FieldShell
          eyebrow={`pergunta 2 de ${TOTAL_STEPS}`}
          question={
            <>
              prazer, <span style={{ color: "var(--af-dourado)" }}>
                {form.name.split(" ")[0] || "você"}
              </span>. qual seu melhor email?
            </>
          }
          hint="usamos só pra acessar sua conta. nada de spam."
        >
          <TextInput
            type="email"
            value={form.email}
            onChange={(v) => update("email", v.toLowerCase())}
            placeholder="seunome@exemplo.com.br"
            autoFocus
          />
        </FieldShell>
      );
    case "password":
      return (
        <FieldShell
          eyebrow={`pergunta 3 de ${TOTAL_STEPS}`}
          question="cria uma senha"
          hint="mínimo 6 caracteres. anota num lugar seguro."
        >
          <TextInput
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="••••••••"
            autoFocus
          />
        </FieldShell>
      );
    case "cpf":
      return (
        <FieldShell
          eyebrow={`pergunta 4 de ${TOTAL_STEPS}`}
          question="qual seu CPF?"
          hint="precisamos pra verificar sua identidade. seus dados ficam só com a gente."
        >
          <TextInput
            value={form.cpf}
            onChange={(v) => update("cpf", maskCPF(v))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoFocus
          />
        </FieldShell>
      );
    case "birthDate":
      return (
        <FieldShell
          eyebrow={`pergunta 5 de ${TOTAL_STEPS}`}
          question="quando você nasceu?"
          hint="ajuda a confirmar quem você é."
        >
          <TextInput
            type="date"
            value={form.birthDate}
            onChange={(v) => update("birthDate", v)}
            autoFocus
          />
        </FieldShell>
      );
    case "cnpj":
      return (
        <FieldShell
          eyebrow={`pergunta 6 de ${TOTAL_STEPS}`}
          question="qual o CNPJ do seu MEI?"
          hint="você precisa ser MEI pra usar a gente — é o que dá fé à duplicata."
        >
          <TextInput
            value={form.cnpj}
            onChange={(v) => update("cnpj", maskCNPJ(v))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            autoFocus
          />
        </FieldShell>
      );
    case "businessName":
      return (
        <FieldShell
          eyebrow={`pergunta 7 de ${TOTAL_STEPS}`}
          question="como o seu negócio se chama?"
          hint="o nome que as suas clientes conhecem."
        >
          <TextInput
            value={form.businessName}
            onChange={(v) => update("businessName", v)}
            placeholder="Onda Preta Biquínis"
            autoFocus
          />
        </FieldShell>
      );
    case "activity":
      return (
        <FieldShell
          eyebrow={`pergunta 8 de ${TOTAL_STEPS}`}
          question="o que você vende?"
          hint="ajuda a entender seu ramo. pode escolher uma sugestão ou digitar."
        >
          <TextInput
            value={form.declaredBusinessActivity}
            onChange={(v) => update("declaredBusinessActivity", v)}
            placeholder="moda praia"
            autoFocus
          />
          <SuggestionChips
            options={ACTIVITY_SUGGESTIONS}
            selected={form.declaredBusinessActivity}
            onSelect={(v) => update("declaredBusinessActivity", v)}
          />
        </FieldShell>
      );
    case "time":
      return (
        <FieldShell
          eyebrow={`pergunta 9 de ${TOTAL_STEPS}`}
          question="há quanto tempo você empreende?"
          hint="conta o tempo total — formal ou informal vale."
        >
          <RangeChips
            options={TIME_RANGES.map((t) => ({
              label: t.label,
              value: t.months,
            }))}
            selected={form.monthsActive}
            onSelect={(v) => update("monthsActive", v)}
          />
          <label
            className="af-mono mt-6 flex items-center gap-2"
            style={{ fontSize: 12, color: "var(--af-cinza)" }}
          >
            <input
              type="checkbox"
              checked={form.hasCadUnico}
              onChange={(e) => update("hasCadUnico", e.target.checked)}
              className="size-4 rounded accent-current"
              style={{ accentColor: "var(--af-dourado)" }}
            />
            tenho cadastro no CadÚnico
          </label>
        </FieldShell>
      );
    case "channels":
      return (
        <FieldShell
          eyebrow={`pergunta 10 de ${TOTAL_STEPS}`}
          question="por onde você vende?"
          hint="escolhe todos os canais. quanto mais variado, melhor."
        >
          <ChannelChips
            options={CHANNELS}
            selected={form.channelTypes}
            onToggle={(v) => {
              const has = form.channelTypes.includes(v);
              update(
                "channelTypes",
                has
                  ? form.channelTypes.filter((c) => c !== v)
                  : [...form.channelTypes, v],
              );
            }}
          />
        </FieldShell>
      );
    case "revenue":
      return (
        <FieldShell
          eyebrow={`pergunta 11 de ${TOTAL_STEPS}`}
          question="quanto entra por mês, somando tudo?"
          hint="média dos últimos 3 meses. sem pressão de precisão — escolhe a faixa."
        >
          <RangeChips
            options={REVENUE_RANGES.map((r) => ({
              label: r.label,
              value: r.representative,
            }))}
            selected={form.monthlyRevenueCents}
            onSelect={(v) => update("monthlyRevenueCents", v)}
            variant="big"
          />
        </FieldShell>
      );
    case "credit":
      return (
        <FieldShell
          eyebrow={`pergunta 12 de ${TOTAL_STEPS}`}
          question="de quanto você precisa pra começar?"
          hint="é o limite que você quer testar nas próximas compras. dá pra aumentar depois."
        >
          <CreditChips
            options={CREDIT_OPTIONS}
            selected={form.initialCreditAmount}
            onSelect={(v) => update("initialCreditAmount", v)}
          />
        </FieldShell>
      );
    case "pluggy":
      return (
        <FieldShell
          eyebrow={`última pergunta — opcional`}
          question="quer conectar Open Finance?"
          hint="se conectar, a gente analisa seu fluxo bancário real e te aprova melhor. é seguro (Pluggy, sandbox demo)."
        >
          <PluggyPanel
            connected={!!form.pluggyItemId}
            loading={pluggyLoading}
            onConnect={handleConnectPluggy}
          />
        </FieldShell>
      );
  }
}

// ─────────────────────── Reusable bits ───────────────────────

function FieldShell({
  eyebrow,
  question,
  hint,
  children,
}: {
  eyebrow: string;
  question: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="af-mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--af-dourado)",
        }}
      >
        {eyebrow}
      </p>
      <h1
        className="af-display mt-3"
        style={{
          fontSize: "clamp(34px, 4.5vw, 56px)",
          lineHeight: 0.98,
          color: "var(--af-preto)",
          letterSpacing: "-0.02em",
        }}
      >
        {question}
      </h1>
      {hint && (
        <p
          className="af-body mt-3"
          style={{
            fontSize: 15.5,
            color: "var(--af-cinza)",
            lineHeight: 1.5,
            maxWidth: 480,
          }}
        >
          {hint}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function TextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  inputMode,
  autoFocus,
  size = "md",
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  size?: "sm" | "md";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);
  return (
    <input
      ref={inputRef}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full bg-transparent outline-none transition-colors"
      style={{
        fontFamily: "var(--af-sans)",
        fontSize: size === "md" ? 26 : 18,
        fontWeight: 500,
        color: "var(--af-preto)",
        borderBottom: "2px solid var(--af-borda)",
        paddingBottom: size === "md" ? 12 : 10,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderBottomColor = "var(--af-dourado)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderBottomColor = "var(--af-borda)";
      }}
    />
  );
}

function SuggestionChips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {options.map((o) => {
        const isSelected = selected === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onSelect(o)}
            className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            style={{
              background: isSelected
                ? "var(--af-preto)"
                : "var(--af-creme-2)",
              color: isSelected ? "var(--af-branco)" : "var(--af-preto)",
              border: `1px solid ${
                isSelected ? "var(--af-preto)" : "var(--af-borda)"
              }`,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function RangeChips({
  options,
  selected,
  onSelect,
  variant = "default",
}: {
  options: { label: string; value: number }[];
  selected: number;
  onSelect: (v: number) => void;
  variant?: "default" | "big";
}) {
  return (
    <div
      className={
        variant === "big"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          : "flex flex-wrap gap-2"
      }
    >
      {options.map((o) => {
        const isSelected = selected === o.value;
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onSelect(o.value)}
            className="rounded-2xl px-5 py-4 text-left transition-all"
            style={{
              background: isSelected
                ? "var(--af-preto)"
                : "var(--af-branco)",
              color: isSelected ? "var(--af-branco)" : "var(--af-preto)",
              border: `2px solid ${
                isSelected ? "var(--af-dourado)" : "var(--af-borda)"
              }`,
              fontFamily: "var(--af-sans)",
              fontSize: variant === "big" ? 16 : 14,
              fontWeight: 600,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ChannelChips({
  options,
  selected,
  onToggle,
}: {
  options: { value: ChannelType; label: string; icon: typeof Smartphone }[];
  selected: ChannelType[];
  onToggle: (v: ChannelType) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {options.map((o) => {
        const isSelected = selected.includes(o.value);
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className="rounded-2xl px-4 py-4 transition-all flex items-center gap-2.5"
            style={{
              background: isSelected
                ? "var(--af-preto)"
                : "var(--af-branco)",
              color: isSelected ? "var(--af-branco)" : "var(--af-preto)",
              border: `2px solid ${
                isSelected ? "var(--af-dourado)" : "var(--af-borda)"
              }`,
              fontFamily: "var(--af-sans)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Icon className="size-4" />
            {o.label}
            {isSelected && <Check className="size-3.5 ml-auto" />}
          </button>
        );
      })}
    </div>
  );
}

function CreditChips({
  options,
  selected,
  onSelect,
}: {
  options: readonly CreditAmount[];
  selected: CreditAmount;
  onSelect: (v: CreditAmount) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map((v) => {
        const isSelected = selected === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(v)}
            className="rounded-2xl py-6 text-center transition-all"
            style={{
              background: isSelected
                ? "var(--af-preto)"
                : "var(--af-branco)",
              color: isSelected ? "var(--af-dourado)" : "var(--af-preto)",
              border: `2px solid ${
                isSelected ? "var(--af-dourado)" : "var(--af-borda)"
              }`,
            }}
          >
            <div
              className="af-display"
              style={{ fontSize: 28, lineHeight: 1 }}
            >
              R$ {v}
            </div>
            <div
              className="af-mono mt-1"
              style={{
                fontSize: 10.5,
                color: isSelected
                  ? "rgba(250,250,250,0.6)"
                  : "var(--af-cinza)",
                letterSpacing: "0.08em",
              }}
            >
              início
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PluggyPanel({
  connected,
  loading,
  onConnect,
}: {
  connected: boolean;
  loading: boolean;
  onConnect: () => void;
}) {
  return (
    <div>
      {connected ? (
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{
            background: "rgba(22, 163, 74, 0.08)",
            border: "1px solid rgba(22, 163, 74, 0.3)",
            color: "var(--af-sucesso)",
          }}
        >
          <CheckCircle2 className="size-5" />
          <span style={{ fontWeight: 600 }}>conta conectada com segurança</span>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onConnect}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-colors disabled:opacity-50"
            style={{
              background: "var(--af-preto)",
              color: "var(--af-branco)",
            }}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Smartphone className="size-4" />
            )}
            {loading ? "abrindo Pluggy..." : "conectar Open Finance"}
          </button>
          <p
            className="af-mono mt-3"
            style={{
              fontSize: 11,
              color: "var(--af-cinza)",
              lineHeight: 1.5,
            }}
          >
            modo sandbox · escolha &quot;Pluggy Bank&quot; e use{" "}
            <span style={{ color: "var(--af-preto)", fontWeight: 600 }}>
              user-good
            </span>{" "}
            /{" "}
            <span style={{ color: "var(--af-preto)", fontWeight: 600 }}>
              password-good
            </span>
          </p>
        </>
      )}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div
        className="af-mono"
        style={{
          fontSize: 11,
          color: "var(--af-cinza)",
          letterSpacing: "0.1em",
        }}
      >
        {current + 1}/{total}
      </div>
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ background: "var(--af-borda)" }}
      >
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "var(--af-dourado)" }}
        />
      </div>
    </div>
  );
}

function NavBar({
  canBack,
  onBack,
  canAdvance,
  onAdvance,
  isLast,
  canSkip,
}: {
  canBack: boolean;
  onBack: () => void;
  canAdvance: boolean;
  onAdvance: () => void;
  isLast: boolean;
  canSkip: boolean;
}) {
  // Atalho ENTER avança
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && canAdvance) {
        e.preventDefault();
        onAdvance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canAdvance, onAdvance]);

  return (
    <div className="mt-10 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack}
        className="inline-flex items-center gap-1.5 transition-opacity disabled:opacity-30"
        style={{
          color: "var(--af-cinza)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <ArrowLeft className="size-4" />
        voltar
      </button>

      <button
        type="button"
        onClick={onAdvance}
        disabled={!canAdvance}
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: canAdvance ? "var(--af-dourado)" : "var(--af-borda)",
          color: canAdvance ? "var(--af-preto)" : "var(--af-cinza)",
        }}
      >
        {isLast ? "ver meu limite" : canSkip ? "pular" : "continuar"}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

// ─────────────────────── Calculating + Result ───────────────────────

const CALC_STEPS = [
  "lendo seu cadastro",
  "olhando seus canais",
  "modelando seu fluxo",
  "aplicando travas de segurança",
  "definindo seu limite",
];

function CalculatingScreen() {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    if (activeIdx >= CALC_STEPS.length) return;
    const t = setTimeout(() => setActiveIdx((i) => i + 1), 480);
    return () => clearTimeout(t);
  }, [activeIdx]);

  return (
    <div className="flex min-h-[calc(100vh-110px)] flex-col items-center justify-center px-6 py-12 lg:px-14">
      <div className="w-full max-w-md">
        <p
          className="af-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--af-dourado)",
          }}
        >
          motor de análise · v1.0
        </p>
        <h1
          className="af-display mt-3"
          style={{
            fontSize: "clamp(36px, 4.5vw, 56px)",
            lineHeight: 0.98,
            color: "var(--af-preto)",
          }}
        >
          analisando seu negócio
        </h1>
        <p
          className="af-body mt-3"
          style={{
            fontSize: 15,
            color: "var(--af-cinza)",
            lineHeight: 1.55,
            maxWidth: 380,
          }}
        >
          sem consultar Serasa. sem CEP no algoritmo. seu fluxo manda no veredito.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {CALC_STEPS.map((label, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: done || active ? 1 : 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className="grid size-7 place-items-center rounded-full transition-colors"
                  style={{
                    background: done
                      ? "var(--af-dourado)"
                      : active
                        ? "var(--af-preto)"
                        : "var(--af-borda)",
                    color: done
                      ? "var(--af-preto)"
                      : active
                        ? "var(--af-dourado)"
                        : "var(--af-cinza)",
                  }}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : active ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <div
                      className="size-1.5 rounded-full"
                      style={{ background: "currentColor" }}
                    />
                  )}
                </div>
                <span
                  className="af-body"
                  style={{
                    fontSize: 16,
                    fontWeight: done ? 600 : 500,
                    color: done || active ? "var(--af-preto)" : "var(--af-cinza)",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({
  done,
  userName,
  onContinue,
}: {
  done: DoneState;
  userName: string;
  onContinue: () => void;
}) {
  const approved = done.decision === "APPROVED";
  const review = done.decision === "MANUAL_REVIEW";
  const animatedLimit = useAnimatedNumber(Number(done.recommendedLimitCents) / 100, 1200);

  return (
    <div className="flex min-h-[calc(100vh-110px)] flex-col px-6 py-10 lg:px-14 lg:py-14">
      <div className="flex-1 flex flex-col">
        <p
          className="af-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: approved
              ? "var(--af-dourado)"
              : review
                ? "var(--af-laranja)"
                : "var(--af-cinza)",
          }}
        >
          {approved
            ? "limite aprovado"
            : review
              ? "em análise manual"
              : "ainda não foi dessa"}
        </p>
        <h1
          className="af-display mt-3"
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 0.96,
            color: "var(--af-preto)",
          }}
        >
          {approved ? (
            <>
              boa, {userName || "você"}.
              <br />
              seu fiado vale até
            </>
          ) : review ? (
            <>
              quase lá, {userName || "você"}.
              <br />a gente vai dar uma olhada manual.
            </>
          ) : (
            <>
              vamos esperar um pouco
              <br />
              mais de movimento.
            </>
          )}
        </h1>

        {approved && (
          <div className="mt-4">
            <span
              className="af-display"
              style={{
                fontSize: "clamp(72px, 12vw, 140px)",
                color: "var(--af-dourado)",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
              }}
            >
              R$ {brl(Math.round(animatedLimit * 100)).replace("R$", "").replace(/ /g, "").trim()}
            </span>
            <p
              className="af-mono mt-3"
              style={{
                fontSize: 13,
                color: "var(--af-cinza)",
                letterSpacing: "0.04em",
              }}
            >
              taxa sugerida: {done.suggestedFeePercent.toFixed(2)}% · prazo 14-60 dias · confiança{" "}
              <span style={{ color: "var(--af-preto)" }}>
                {done.confidenceLevel.toLowerCase()}
              </span>
              {done.usedOpenFinance && (
                <>
                  {" "}·{" "}
                  <span style={{ color: "var(--af-dourado)" }}>
                    com Open Finance
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {done.userExplanation && (
          <p
            className="af-body mt-6"
            style={{
              fontSize: 16,
              color: "var(--af-preto)",
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            {done.userExplanation}
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 max-w-2xl">
          {done.positiveFactors.length > 0 && (
            <div>
              <p
                className="af-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--af-sucesso)",
                }}
              >
                pontos fortes
              </p>
              <ul className="mt-3 space-y-2.5">
                {done.positiveFactors.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ fontSize: 14, color: "var(--af-preto)" }}
                  >
                    <CheckCircle2
                      className="size-4 mt-0.5 flex-shrink-0"
                      style={{ color: "var(--af-sucesso)" }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {done.attentionFactors.length > 0 && (
            <div>
              <p
                className="af-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--af-laranja)",
                }}
              >
                pontos de atenção
              </p>
              <ul className="mt-3 space-y-2.5">
                {done.attentionFactors.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ fontSize: 14, color: "var(--af-preto)" }}
                  >
                    <AlertTriangle
                      className="size-4 mt-0.5 flex-shrink-0"
                      style={{ color: "var(--af-laranja)" }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className="af-mono mt-10 inline-flex items-center gap-3 self-start rounded-full px-4 py-2"
          style={{
            background: "var(--af-creme-2)",
            border: "1px solid var(--af-borda)",
            fontSize: 11,
            color: "var(--af-cinza)",
            letterSpacing: "0.06em",
          }}
        >
          {done.engine === "motor" ? (
            <Sparkles className="size-3.5" style={{ color: "var(--af-dourado)" }} />
          ) : (
            <Clock className="size-3.5" />
          )}
          motor: {done.engine === "motor" ? "v1.0 + open finance" : "v0.1 local"} · 0
          consultas a bureau
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-10 inline-flex items-center justify-center gap-2 self-start rounded-full px-7 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
        style={{
          background: "var(--af-preto)",
          color: "var(--af-branco)",
        }}
      >
        entrar no app
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function useAnimatedNumber(target: number, durationMs: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const progress = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

// Silence unused — useMemo é importado pra futuras otimizações.
void useMemo;
