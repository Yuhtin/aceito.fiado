// src/app/pay/[code]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

import { loadCheckout } from "./_actions";
import { PayConfirm } from "./pay-confirm";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PayPage({ params }: Props) {
  const { code } = await params;
  const res = await loadCheckout(code);

  if (!res.ok) notFound();
  const data = res.data;

  const user = await getCurrentUser();

  if (data.status === "EXPIRED") {
    return (
      <ExpiredState />
    );
  }

  if (data.status === "CONFIRMED") {
    return <AlreadyConfirmedState code={data.code} />;
  }

  return <PayConfirm data={data} loggedIn={!!user && user.role === "ENTREPRENEUR"} />;
}

function ExpiredState() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">link expirado</p>
        <h1 className="af-display text-[36px] mt-2 mb-3">
          Esse QrCode já expirou.
        </h1>
        <p className="text-[var(--af-cinza)] max-w-xs mx-auto">
          Peça à lojista pra gerar um novo. QRs valem 30 minutos por segurança.
        </p>
      </div>
    </div>
  );
}

function AlreadyConfirmedState({ code }: { code: string }) {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">já confirmado</p>
        <h1 className="af-display text-[36px] mt-2 mb-3">
          Esse fiado já foi pago.
        </h1>
        <p className="text-[var(--af-cinza)] max-w-xs mx-auto">
          Code <span className="font-mono">{code}</span>.{" "}
          <Link href="/app" className="text-[var(--af-dourado-dark)] underline">
            Veja em /app
          </Link>.
        </p>
      </div>
    </div>
  );
}
