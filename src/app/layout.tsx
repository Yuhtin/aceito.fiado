import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "AceitoFiado — infraestrutura de crédito produtivo embutido",
  description:
    "Fornecedores oferecem fiado seguro pra MEIs afro. Análise de risco, cobrança automática, trava de recebíveis no Pix, liquidez via parceiros financeiros. O Serasa não decide nada.",
  metadataBase: new URL("https://aceitofiado.com.br"),
  openGraph: {
    title: "AceitoFiado",
    description:
      "Capital de giro pra quem o algoritmo deixou de fora. Sem Serasa no caminho.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-af-paper text-af-ink">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
