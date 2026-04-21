"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storageService } from '@/services/storage';
import Navbar from './Navbar';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Inicializa o estado sincronamente se estiver no cliente para evitar flashes de conteúdo não autorizado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return storageService.getSession();
    }
    return false;
  });
  
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const session = storageService.getSession();
    
    // Lógica para garantir que o sistema inicie SEMPRE no Dashboard (/)
    // quando o sistema é aberto pela primeira vez na sessão do navegador
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem('alfa_initialized')) {
      window.sessionStorage.setItem('alfa_initialized', 'true');
      if (session && pathname !== '/') {
        router.push('/');
        return;
      }
    }
    
    if (!session && !isLoginPage) {
      router.push('/login');
    } else if (session && isLoginPage) {
      router.push('/');
    } else {
      setIsAuthenticated(session);
    }
    
    setIsChecking(false);
  }, [pathname, router, isLoginPage]);

  if (isChecking && !isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Previne renderização das páginas protegidas antes do redirect (evita flash)
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
