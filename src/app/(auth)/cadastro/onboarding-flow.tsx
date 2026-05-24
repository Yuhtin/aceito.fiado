"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Banknote,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  formatBRL,
  maskCEPInput,
  maskCNPJInput,
  maskPhoneInput,
} from "@/lib/format";
import {
  calculateScore,
  SCORING_CONSTANTS,
} from "@/lib/scoring";
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
  { id: 1, title: "Sua conta", icon: Building2 },
  { id: 2, title: "Negócio", icon: Store },
  { id: 3, title: "Canais", icon: Smartphone },
  { id: 4, title: "Score", icon: Sparkles },
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

  // Cálculo de score em tempo real (preview)
  const livePreview = useMemo(() => {
    const totalRevenue = form.channels.reduce(
      (a, c) => a + parseRevenueCents(c.monthlyRevenue),
      0,
    );
    const valid = form.channels.filter(
      (c) => parseRevenueCents(c.monthlyRevenue) > 0,
    );
    if (valid.length === 0)
      return { score: 0, approved: false, limit: 0n, breakdown: null };
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
      breakdown: result.factors,
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
      toast.error("Adicione pelo menos um canal com faturamento.");
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
        toast.error(result.error ?? "Não conseguimos cadastrar agora");
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

  // Validação por step
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
        (c) => c.label.length > 0 && parseRevenueCents(c.monthlyRevenue) > 0,
      );
    }
    return true;
  }

  if (done) {
    return (
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden border-border/60 bg-card/90 p-10 shadow-soft-lg backdrop-blur">
          <div className="flex flex-col items-center text-center">
            {done.approved ? (
              <>
                <div className="flex size-20 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-10" />
                </div>
                <h1 className="mt-6 font-display text-3xl font-medium">
                  Você está aprovada, {form.name.split(" ")[0]} ✦
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sem consulta ao Serasa. Sem CEP no algoritmo.
                </p>
                <div className="mt-8 w-full rounded-2xl border border-border/60 bg-warm-gradient p-6">
                  <p className="text-xs uppercase tracking-widest text-primary">
                    Seu limite aprovado
                  </p>
                  <p className="mt-2 font-display text-5xl font-medium tabular-nums">
                    {formatBRL(done.limit)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Score {Math.round(done.score * 100)}% · disponível imediatamente
                  </p>
                </div>
                <Button
                  size="lg"
                  className="mt-8 gap-2 px-8"
                  onClick={() => router.push("/app")}
                >
                  Ver meu cockpit <ArrowRight className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex size-20 items-center justify-center rounded-full bg-warning/15 text-warning-foreground">
                  <Sparkles className="size-10" />
                </div>
                <h1 className="mt-6 font-display text-3xl font-medium">
                  Ainda não dá pra liberar limite
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
                  Seu score ficou em{" "}
                  <strong className="text-foreground">
                    {Math.round(done.score * 100)}%
                  </strong>
                  , abaixo do mínimo de{" "}
                  {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%. Não é
                  rejeição: é convite pra conectar mais canais. Cada canal
                  conectado vira sinal e aumenta seu limite.
                </p>
                <div className="mt-8 grid w-full gap-3 text-left text-sm">
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                    <p className="font-medium">Como subir seu score:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      <li>Conectar mais canais de venda (marketplace, feira, Pix)</li>
                      <li>Esperar 30 dias pra acumular histórico de fluxo</li>
                      <li>Construir relacionamento com um fornecedor da rede</li>
                    </ul>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="mt-8 gap-2 px-8"
                  onClick={() => router.push("/app")}
                >
                  Entrar mesmo assim <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Stepper */}
      <ol className="mb-8 grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const reached = s.id <= step;
          const active = s.id === step;
          return (
            <li
              key={s.id}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border px-3 py-2 transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : reached
                    ? "border-success/40 bg-success/5"
                    : "border-border/60 bg-card/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : reached
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {reached && !active ? "✓" : s.id}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-widest",
                    active
                      ? "text-primary"
                      : reached
                        ? "text-success"
                        : "text-muted-foreground",
                  )}
                >
                  Passo {s.id}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm font-medium",
                  active || reached
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {s.title}
              </p>
            </li>
          );
        })}
      </ol>

      <Card className="border-border/60 bg-card/90 shadow-soft-lg backdrop-blur">
        {/* STEP 1 — conta */}
        {step === 1 && (
          <div className="p-7 md:p-10">
            <h2 className="font-display text-2xl font-medium">
              Cria sua conta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua identificação na plataforma. Em 5 minutos a gente termina.
            </p>
            <div className="mt-6 grid gap-4">
              <Field
                label="Seu nome completo"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="Ex: Joana Bezerra"
              />
              <Field
                type="email"
                label="E-mail"
                value={form.email}
                onChange={(v) => update("email", v.toLowerCase())}
                placeholder="seunome@exemplo.com.br"
              />
              <Field
                type="password"
                label="Senha (mínimo 6 caracteres)"
                value={form.password}
                onChange={(v) => update("password", v)}
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        {/* STEP 2 — negócio */}
        {step === 2 && (
          <div className="p-7 md:p-10">
            <h2 className="font-display text-2xl font-medium">
              Sobre o seu negócio
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CNPJ + endereço pra emissão da duplicata. CEP não entra no score.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Razão social"
                value={form.businessName}
                onChange={(v) => update("businessName", v)}
                placeholder="Ex: Onda Preta Biquínis"
              />
              <Field
                label="CNPJ"
                value={form.cnpj}
                onChange={(v) => update("cnpj", maskCNPJInput(v))}
                placeholder="00.000.000/0000-00"
              />
              <Field
                label="WhatsApp"
                value={form.phone}
                onChange={(v) => update("phone", maskPhoneInput(v))}
                placeholder="(11) 99999-0000"
              />
              <div className="space-y-1.5">
                <Label>Há quanto tempo empreende?</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    value={form.monthsActive}
                    onChange={(e) =>
                      update("monthsActive", parseInt(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">meses</span>
                </div>
              </div>
              <Field
                label="CEP"
                value={form.addressCep}
                onChange={(v) => update("addressCep", maskCEPInput(v))}
                placeholder="00000-000"
              />
              <Field
                label="Bairro"
                value={form.addressNeighborhood}
                onChange={(v) => update("addressNeighborhood", v)}
                placeholder="Ex: Heliópolis"
              />
              <Field
                label="Cidade"
                value={form.addressCity}
                onChange={(v) => update("addressCity", v)}
                placeholder="Ex: São Paulo"
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

        {/* STEP 3 — canais */}
        {step === 3 && (
          <div className="p-7 md:p-10">
            <h2 className="font-display text-2xl font-medium">
              Conecte seus canais de venda
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              É daqui que o score sai. Cada canal vira sinal de receita.
            </p>

            <div className="mt-6 grid gap-3">
              {form.channels.map((channel, idx) => (
                <Card
                  key={idx}
                  className="border-border/60 bg-background p-4 shadow-soft"
                >
                  <div className="grid items-center gap-3 md:grid-cols-[140px_1fr_160px_auto]">
                    <select
                      value={channel.type}
                      onChange={(e) => {
                        const next = [...form.channels];
                        next[idx] = { ...next[idx], type: e.target.value };
                        update("channels", next);
                      }}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CHANNEL_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={channel.label}
                      placeholder="Apelido (ex: Pix Sicoob, Loja Shopee)"
                      onChange={(e) => {
                        const next = [...form.channels];
                        next[idx] = { ...next[idx], label: e.target.value };
                        update("channels", next);
                      }}
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        R$/mês
                      </span>
                      <Input
                        className="pl-16 font-mono tabular-nums"
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
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (form.channels.length === 1) return;
                        update(
                          "channels",
                          form.channels.filter((_, i) => i !== idx),
                        );
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  update("channels", [
                    ...form.channels,
                    { type: "SHOPEE", label: "", monthlyRevenue: "" },
                  ])
                }
              >
                <Plus className="size-4" /> Adicionar canal
              </Button>
            </div>

            {/* Preview do score em tempo real */}
            <div className="mt-6 rounded-2xl border border-primary/40 bg-warm-gradient p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    Prévia em tempo real
                  </p>
                  <p className="mt-1 font-display text-2xl font-medium">
                    Limite estimado{" "}
                    <span className="text-primary tabular-nums">
                      {formatBRL(livePreview.limit)}
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    livePreview.approved
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/40 bg-warning/15 text-warning-foreground"
                  }
                >
                  Score {Math.round(livePreview.score * 100)}%
                </Badge>
              </div>
              <Progress
                value={livePreview.score * 100}
                className="mt-3 h-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Mínimo pra aprovação: {Math.round(SCORING_CONSTANTS.APPROVAL_THRESHOLD * 100)}%.{" "}
                Quanto mais canais e mais histórico, maior o limite.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4 — confirmação */}
        {step === 4 && (
          <div className="p-7 md:p-10">
            <h2 className="font-display text-2xl font-medium">
              Pronta pra ver seu limite?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revise os dados. Ao confirmar, calculamos seu score e abrimos seu
              cockpit.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Summary
                title="Você"
                rows={[
                  ["Nome", form.name],
                  ["E-mail", form.email],
                ]}
              />
              <Summary
                title="Negócio"
                rows={[
                  ["Razão social", form.businessName],
                  ["CNPJ", form.cnpj],
                  ["Tempo de atividade", `${form.monthsActive} meses`],
                  [
                    "Endereço",
                    `${form.addressNeighborhood}, ${form.addressCity}/${form.addressState}`,
                  ],
                ]}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-background p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Canais
              </p>
              <ul className="mt-3 grid gap-2">
                {form.channels.map((c, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span>{c.label || "—"}</span>
                    <span className="font-mono tabular-nums">
                      {formatBRL(parseRevenueCents(c.monthlyRevenue))}/mês
                    </span>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Limite estimado</p>
                <p className="font-display text-2xl font-medium text-primary tabular-nums">
                  {formatBRL(livePreview.limit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 px-7 py-4 md:px-10">
          <Button
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="gap-2"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canContinue()}
              className="gap-2 px-6"
            >
              Continuar <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 px-6"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Calcular meu limite <Sparkles className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
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
    <div className="rounded-2xl border border-border/60 bg-background p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <dl className="mt-3 grid gap-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[1fr_1.5fr] gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v || "—"}</dd>
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
