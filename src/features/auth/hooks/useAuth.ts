import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const { session, user, loading, logout, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      const isRegisterPage = pathname === '/register';
      const isForgotPasswordPage = pathname === '/forgot-password';
      const isPublicPage = isLoginPage || isRegisterPage || isForgotPasswordPage;

      if (isAuthenticated && isPublicPage) {
        router.push('/');
      } else if (!isAuthenticated && !isPublicPage) {
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, pathname, router]);

  return { 
    session, 
    user, 
    loading, 
    isAuthenticated, 
    logout 
  };
}
