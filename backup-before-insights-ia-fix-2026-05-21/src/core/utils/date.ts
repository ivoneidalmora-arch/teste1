import { parseISO, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma string de data para exibição amigável.
 * @param dateStr String de data (ISO ou YYYY-MM-DD)
 * @param formatStr Padrão de formatação do date-fns
 */
export function formatDisplayDate(dateStr: string | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!dateStr) return 'Data Inválida';
  
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Data Inválida';
    return format(date, formatStr, { locale: ptBR });
  } catch (error) {
    return 'Data Inválida';
  }
}

/**
 * Normaliza uma string de data para o formato de banco (YYYY-MM-DD)
 */
export function toStorageDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
