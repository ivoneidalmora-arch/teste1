import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um número para Real Brasileiro (R$)
 */
export const formatBRL = (val: number) => 
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata uma variação percentual (ex: +5.2% ou Mantido)
 */
export const formatVar = (val: number) => {
  if (val === 0) return "Mantido";
  return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
};

/**
 * Formata data ISO para exibição (dd/MM/yyyy)
 */
export const formatDisplayDate = (dateStr: string, pattern: string = 'dd/MM/yyyy') => {
  if (!dateStr) return '';
  try {
    const date = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T12:00:00');
    return format(date, pattern, { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};
