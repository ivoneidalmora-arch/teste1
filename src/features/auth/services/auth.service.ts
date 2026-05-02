import { supabase } from '@/services/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  },

  async logout() {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('alfa_initialized');
    }
  },

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
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
