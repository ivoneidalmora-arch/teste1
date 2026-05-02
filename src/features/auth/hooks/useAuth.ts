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
      const currentSession = await authService.getSession();
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
    const { data: { subscription } } = authService.onAuthStateChange((session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      const hasAuth = !!session;

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

  return { session, loading, isAuthenticated: !!session, logout };
}
