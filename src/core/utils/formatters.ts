/**
 * Formata um número para Real Brasileiro (R$)
 * Blindado contra valores NaN, null ou undefined.
 */
export const formatBRL = (val: number | null | undefined) => {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

/**
 * Formata uma variação percentual (ex: +5.2% ou 0.0%)
 */
export const formatVar = (val: number | null | undefined) => {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "0.0%";
  return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
};

/**
 * Utilitário para concatenação de classes Tailwind
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
