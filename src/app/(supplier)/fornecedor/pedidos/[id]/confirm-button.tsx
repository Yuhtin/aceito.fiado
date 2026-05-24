"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { confirmOrderAction } from "./_actions";

export function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmOrderAction({ orderId });
      if (!result.ok) {
        toast.error(result.error ?? "não foi possível confirmar");
        return;
      }
      toast.success("pedido confirmado", {
        description: `Pix de ${result.amountFormatted} sendo enviado. duplicata ${result.duplicataNumero} emitida.`,
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-80"
      style={{
        background: "var(--af-dourado)",
        color: "var(--af-preto)",
        fontFamily: "var(--af-sans)",
      }}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Check className="size-4" />
      )}
      confirmar e receber
    </button>
  );
}
