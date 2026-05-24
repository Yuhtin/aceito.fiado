import Link from "next/link";

import { AfLogo, GradientMesh } from "@/components/af";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GradientMesh className="flex min-h-screen flex-col">
      <header className="px-8 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <AfLogo size={22} />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        {children}
      </main>
    </GradientMesh>
  );
}
