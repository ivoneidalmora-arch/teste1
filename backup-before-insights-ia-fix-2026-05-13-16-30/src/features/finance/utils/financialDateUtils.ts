import { getDaysInMonth as dateFnsGetDaysInMonth, isValid, parseISO } from 'date-fns';

/**
 * Normaliza uma data para um objeto Date válido ou null.
 * Aceita múltiplos campos comuns em transações.
 */
export function normalizeDate(data: any): Date | null {
  if (!data) return null;

  const dateValue = 
    data.date || 
    data.data || 
    data.created_at || 
    data.createdAt || 
    data.updated_at || 
    data.vencimento || 
    data.paidAt || 
    data.paymentDate || 
    data.transactionDate;

  if (!dateValue) return null;

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  return isValid(date) ? date : null;
}

/**
 * Retorna o índice do mês (0-11) de uma data.
 */
export function getMonthIndex(date: Date): number {
  return date.getUTCMonth();
}

/**
 * Retorna o número de dias em um mês específico de um ano.
 */
export function getDaysInMonth(month: number, year: number): number {
  return dateFnsGetDaysInMonth(new Date(year, month, 1));
}

/**
 * Retorna o rótulo abreviado do mês em português.
 */
export function getMonthLabel(monthIndex: number): string {
  const labels = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  return labels[monthIndex];
}
