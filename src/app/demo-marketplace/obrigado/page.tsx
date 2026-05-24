// src/app/demo-marketplace/obrigado/page.tsx
import Link from "next/link";

export default function DemoObrigado() {
  return (
    <div className="min-h-screen bg-[var(--af-creme)] flex items-center justify-center p-6 text-center">
      <div>
        <p className="af-eb">demo · feirapreta</p>
        <h1 className="af-display text-[44px] mt-2 mb-3">
          Obrigado!
        </h1>
        <p className="text-[var(--af-cinza)] max-w-sm mx-auto mb-7">
          O marketplace receberia agora um webhook de confirmação e mostraria
          essa tela à cliente.
        </p>
        <Link
          href="/demo-marketplace"
          className="px-5 py-3 rounded-[8px] bg-[var(--af-preto)] text-[var(--af-branco)] font-semibold text-[13px]"
        >
          ← voltar pro demo
        </Link>
      </div>
    </div>
  );
}
