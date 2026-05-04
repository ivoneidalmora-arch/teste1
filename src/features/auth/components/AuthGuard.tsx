"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '@/features/finance/components/dashboard/DashboardLayout';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  const isPublicPage = ['/login', '/register', '/forgot-password'].includes(pathname);

  // Enquanto verifica a sessão, mostramos o loader apenas se não for uma página pública
  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado e não for página pública, o hook redirecionará
  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  return (
    <>
      {!isPublicPage ? (
        <DashboardLayout>
          {children}
        </DashboardLayout>
      ) : (
        <main>
          {children}
        </main>
      )}
    </>
  );
}
