import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Parses a YYYY-MM-DD string into a Date object without timezone shifts.
 * This is done by appending a noon time to the string.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Dividimos a string manualmente para evitar que o fuso horário interfira.
  // Suporta formatos como "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", etc.
  const parts = dateStr.split(/[-T ]/);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-11
  const day = parseInt(parts[2], 10);
  
  // Criamos o objeto Date no horário local do navegador (meio-dia)
  // Isso garante que a data permaneça a mesma independente de deslocamentos UTC.
  return new Date(year, month, day, 12, 0, 0);
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
