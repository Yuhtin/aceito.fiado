import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-warm-radial">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo size="md" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
