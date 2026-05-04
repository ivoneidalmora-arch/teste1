// Build timestamp: 2026-05-04 11:42
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

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
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
