// Centavos → string BRL formatada
export function formatBRL(
  cents: bigint | number,
  options: { withSymbol?: boolean; compact?: boolean } = {},
): string {
  const { withSymbol = true, compact = false } = options;
  const value = typeof cents === "bigint" ? Number(cents) / 100 : cents / 100;
  if (compact && Math.abs(value) >= 1000) {
    const formatter = new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return (withSymbol ? "R$ " : "") + formatter.format(value);
  }
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: withSymbol ? "currency" : "decimal",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, "").padStart(14, "0").slice(-14);
  return clean.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  );
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "").padStart(11, "0").slice(-11);
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, "").padStart(8, "0").slice(-8);
  return clean.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11)
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (clean.length === 10)
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
}

export function formatDate(date: Date | string, withTime = false): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  if (!withTime) return dateStr;
  const timeStr = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${dateStr} às ${timeStr}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86400000);
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / 3600000);
    if (Math.abs(diffHours) < 1) {
      const diffMin = Math.round(diffMs / 60000);
      return diffMin === 0 ? "agora" : `${Math.abs(diffMin)} min`;
    }
    return diffHours > 0
      ? `em ${diffHours}h`
      : `há ${Math.abs(diffHours)}h`;
  }
  if (diffDays > 0) return `em ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
  return `há ${Math.abs(diffDays)} dia${Math.abs(diffDays) === 1 ? "" : "s"}`;
}

export function formatBps(bps: number): string {
  return (bps / 100).toFixed(2).replace(".", ",") + "%";
}

export function formatPercent(decimal: number, digits = 1): string {
  return (decimal * 100).toFixed(digits).replace(".", ",") + "%";
}

export function cnpjDigitsOnly(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function maskCNPJInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function maskCEPInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
