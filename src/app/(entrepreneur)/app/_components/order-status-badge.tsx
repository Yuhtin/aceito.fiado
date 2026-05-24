import type { OrderStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  AWAITING_SUPPLIER: "Aguardando fornecedor",
  SUPPLIER_CONFIRMED: "Fornecedor confirmou",
  FUNDED: "Fornecedor pago",
  ACTIVE: "Ativa",
  REPAID: "Quitada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

// v3 semantic colors: cinza=pending, dourado=funded/active, sucesso=repaid, vermelho=overdue
const STATUS_STYLE: Record<OrderStatus, React.CSSProperties> = {
  AWAITING_SUPPLIER: {
    background: "oklch(from var(--af-cinza) l c h / 0.12)",
    color: "var(--af-cinza)",
    border: "1px solid oklch(from var(--af-cinza) l c h / 0.25)",
  },
  SUPPLIER_CONFIRMED: {
    background: "oklch(from var(--af-cinza) l c h / 0.12)",
    color: "var(--af-cinza)",
    border: "1px solid oklch(from var(--af-cinza) l c h / 0.25)",
  },
  FUNDED: {
    background: "var(--af-dourado-soft)",
    color: "var(--af-dourado-dark)",
    border: "1px solid oklch(from var(--af-dourado) l c h / 0.3)",
  },
  ACTIVE: {
    background: "var(--af-dourado-soft)",
    color: "var(--af-dourado-dark)",
    border: "1px solid oklch(from var(--af-dourado) l c h / 0.3)",
  },
  REPAID: {
    background: "oklch(from var(--af-sucesso) l c h / 0.1)",
    color: "var(--af-sucesso)",
    border: "1px solid oklch(from var(--af-sucesso) l c h / 0.25)",
  },
  OVERDUE: {
    background: "oklch(from var(--af-vermelho) l c h / 0.1)",
    color: "var(--af-vermelho)",
    border: "1px solid oklch(from var(--af-vermelho) l c h / 0.25)",
  },
  CANCELLED: {
    background: "var(--af-borda)",
    color: "var(--af-cinza)",
    border: "1px solid var(--af-borda)",
  },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "af-mono inline-flex items-center rounded-full px-2 py-0.5",
        className,
      )}
      style={{
        fontSize: 10,
        fontWeight: 500,
        ...STATUS_STYLE[status],
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
