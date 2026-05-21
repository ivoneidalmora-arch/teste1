import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";
import { FinanceProvider } from "@/features/finance/contexts/FinanceContext";
import { Toaster } from "sonner";

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
    <html lang="pt-BR" className="antialiased scrollbar-thin">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-primary selection:text-white" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"' }}>
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
