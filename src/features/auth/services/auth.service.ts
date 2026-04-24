import { supabase } from '@/services/supabase';

export const authService = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async logout() {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('alfa_initialized');
      localStorage.removeItem('auth_token');
    }
  },

  async setSession(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Aqui poderíamos usar o supabase.auth.setSession(token) se fosse um token real
    }
  },

  isInitialized() {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('alfa_initialized') === 'true';
  },

  setInitialized() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('alfa_initialized', 'true');
    }
  }
};
