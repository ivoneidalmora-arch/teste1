import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { supabase } from '@/services/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Tenta pegar do Supabase
      const currentSession = await authService.getSession();
      
      // 2. Se não tiver no Supabase, tenta o mock do localStorage (para persistência do mock)
      if (!currentSession && typeof window !== 'undefined') {
        const mockToken = localStorage.getItem('auth_token');
        if (mockToken) {
          // Criamos um objeto de sessão fake para satisfazer o sistema
          setSession({ access_token: mockToken, user: { id: 'mock-user' } } as any);
          setLoading(false);
          return;
        }
      }

      setSession(currentSession);
    } catch (error) {
      console.error('[useAuth] Error checking session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listener do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        if (pathname !== '/login') router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAuth, pathname, router]);

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      const hasAuth = !!session || (typeof window !== 'undefined' && !!localStorage.getItem('auth_token'));

      if (hasAuth && isLoginPage) {
        router.push('/');
      } else if (!hasAuth && !isLoginPage) {
        router.push('/login');
      }
    }
  }, [loading, session, pathname, router]);

  const logout = async () => {
    await authService.logout();
    setSession(null);
    router.push('/login');
  };

  return { session, loading, isAuthenticated: !!session || (typeof window !== 'undefined' && !!localStorage.getItem('auth_token')), logout };
}
