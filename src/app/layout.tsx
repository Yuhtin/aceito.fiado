import type { Metadata } from "next";
import { Inter, Geist_Mono, Anton } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  variable: "--af-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--af-mono",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--af-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AceitoFiado · checkout pra MEI afro",
  description:
    "Checkout pra lojista cobrar fiado de MEI afro. Sem Serasa, sem peneira, sem letrinha miúda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
