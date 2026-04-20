import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Alfa São Mateus",
  description: "Sistema Avançado de Gestão Financeira Corporativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} antialiased scrollbar-thin`}>
      <body className="font-sans min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-primary selection:text-white">
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
