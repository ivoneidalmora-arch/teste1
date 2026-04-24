"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '@/core/components/Navbar';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Enquanto verifica a sessão, mostramos o loader apenas se não for a página de login
  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado e não for login, não renderiza nada (o hook redirecionará)
  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main className={!isLoginPage ? 'pt-16' : ''}>
        {children}
      </main>
    </>
  );
}
