import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Parses a YYYY-MM-DD string into a Date object without timezone shifts.
 * This is done by appending a noon time to the string.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Se já for ISO completa, parseISO lida bem. Se for apenas YYYY-MM-DD, adicionamos o meio-dia
  const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  return new Date(normalized);
}

/**
 * Formats a date string safely for display.
 */
export function formatDisplayDate(dateStr: string, pattern: string = 'dd/MM/yyyy'): string {
  try {
    const date = parseLocalDate(dateStr);
    return format(date, pattern, { locale: ptBR });
  } catch (e) {
    return 'Data Inválida';
  }
}
