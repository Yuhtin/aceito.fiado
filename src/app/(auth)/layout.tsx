import Link from "next/link";

import { AfLogo } from "@/components/af";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--af-creme)", color: "var(--af-preto)" }}
    >
      {/* mobile header */}
      <header
        className="flex items-center px-6 py-5 lg:hidden"
        style={{ borderBottom: "1px solid var(--af-borda)" }}
      >
        <Link href="/" className="inline-flex items-center gap-2">
          <AfLogo size={22} />
        </Link>
      </header>

      {children}
    </div>
  );
}
