const SESSION_KEY = 'alfa_session';

export const authService = {
  /**
   * Verifica se existe uma sessão ativa no navegador
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(SESSION_KEY);
  },
  
  /**
   * Define uma nova sessão
   */
  setSession: (token: string = 'active'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, token);
  },
  
  /**
   * Encerra a sessão atual
   */
  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  }
};
