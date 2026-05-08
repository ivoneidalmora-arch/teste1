// Build timestamp: 2026-05-04 11:42
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import React from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { FinanceProvider } from "@/features/finance/contexts/FinanceContext";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Alfa (PROD)",
  description: "Sistema Oficial Alfa Perícia e Vistoria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} antialiased scrollbar-thin`}>
      <body className="font-sans min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-primary selection:text-white">
        <AuthProvider>
          <AuthGuard>
            <React.Suspense fallback={null}>
              <FinanceProvider>
                {children}
              </FinanceProvider>
            </React.Suspense>
          </AuthGuard>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
