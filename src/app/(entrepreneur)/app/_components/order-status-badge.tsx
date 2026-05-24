import type { OrderStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
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

const STATUS_TONE: Record<OrderStatus, string> = {
  AWAITING_SUPPLIER:
    "border-warning/40 bg-warning/15 text-warning-foreground",
  SUPPLIER_CONFIRMED:
    "border-warning/40 bg-warning/15 text-warning-foreground",
  FUNDED: "border-primary/30 bg-primary/10 text-primary",
  ACTIVE: "border-primary/30 bg-primary/10 text-primary",
  REPAID: "border-success/30 bg-success/10 text-success",
  OVERDUE: "border-destructive/30 bg-destructive/10 text-destructive",
  CANCELLED: "border-border bg-muted text-muted-foreground",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium", STATUS_TONE[status], className)}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
