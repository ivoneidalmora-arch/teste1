"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storageService } from '@/services/storage';
import Navbar from './Navbar';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    const session = storageService.getSession();
    
    if (!session && !isLoginPage) {
      router.push('/login');
    } else if (session && isLoginPage) {
      router.push('/');
    } else {
      setIsAuthenticated(session);
    }
    
    setIsChecking(false);
  }, [pathname, router, isLoginPage]);

  if (isChecking) {
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
