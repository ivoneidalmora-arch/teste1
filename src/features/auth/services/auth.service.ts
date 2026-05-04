import { supabase } from '@/services/supabase';

const INTERNAL_DOMAIN = '@alfa.com.br';

export const authService = {
  /**
   * Converte um nome de usuário simples em um formato de e-mail interno para o Supabase
   */
  formatEmail(username: string) {
    if (username.includes('@')) return username; // Se já for e-mail, mantém
    return `${username.trim().toLowerCase()}${INTERNAL_DOMAIN}`;
  },

  async login(username: string, password: string) {
    const email = this.formatEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(username: string, password: string) {
    const email = this.formatEmail(username);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return true;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
};
