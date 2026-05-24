import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "AceitoFiado — capital de giro pra cadeia afroempreendedora",
  description:
    "Crédito mercantil direto, sem score discriminatório: a empreendedora compra a prazo, o fornecedor recebe à vista, a gente cobra do recebível.",
  metadataBase: new URL("https://aceitofiado.com.br"),
  openGraph: {
    title: "AceitoFiado",
    description:
      "Capital de giro pra cadeia afroempreendedora. Sem Serasa no caminho.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
