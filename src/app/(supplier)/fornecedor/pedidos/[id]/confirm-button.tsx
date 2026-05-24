"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { confirmOrderAction } from "./_actions";

export function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmOrderAction({ orderId });
      if (!result.ok) {
        toast.error(result.error ?? "Não foi possível confirmar");
        return;
      }
      toast.success("Pedido confirmado", {
        description: `Pix de ${result.amountFormatted} sendo enviado. Duplicata ${result.duplicataNumero} emitida.`,
      });
      router.refresh();
    });
  }

  return (
    <Button
      size="lg"
      className="gap-2"
      onClick={handleConfirm}
      disabled={pending}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      Confirmar e receber
    </Button>
  );
}
