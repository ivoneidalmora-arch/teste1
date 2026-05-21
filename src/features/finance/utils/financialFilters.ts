import { normalizeDate } from './financialDateUtils';

/**
 * Filtra transações por período (global ou mês específico) e ano.
 */
export function filterByPeriodAndYear(
  items: any[], 
  selectedPeriod: string | number, 
  selectedYear: number
): any[] {
  return items.filter(item => {
    const date = normalizeDate(item);
    if (!date) return false;

    const itemYear = date.getUTCFullYear();
    
    // Se não for o ano selecionado, descarta (Mesmo no modo Global, conforme Requisito 12)
    if (itemYear !== selectedYear) return false;

    // Se o período for global/all, já passou no teste do ano, retorna true
    if (selectedPeriod === 'global' || selectedPeriod === 'all' || selectedPeriod === 'tudo') {
      return true;
    }

    // Se for um mês específico (formato YYYY-MM ou apenas MM)
    const itemMonth = date.getUTCMonth() + 1;
    const targetMonth = typeof selectedPeriod === 'string' && selectedPeriod.includes('-') 
      ? parseInt(selectedPeriod.split('-')[1])
      : parseInt(String(selectedPeriod));

    return itemMonth === targetMonth;
  });
}

/**
 * Retorna os meses que possuem lançamentos no ano selecionado.
 */
export type AvailableMonth = {
  value: string;
  label: string;
  monthIndex: number;
  count: number;
};

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function getAvailableMonths(
  transactions: any[],
  selectedYear: number
): AvailableMonth[] {
  const monthMap = new Map<number, number>();

  transactions.forEach((transaction) => {
    const date = normalizeDate(transaction);
    if (!date) return;

    if (date.getUTCFullYear() !== selectedYear) return;

    const monthIndex = date.getUTCMonth();
    monthMap.set(monthIndex, (monthMap.get(monthIndex) || 0) + 1);
  });

  return Array.from(monthMap.entries())
    .filter(([_, count]) => count > 0)
    .sort(([monthA], [monthB]) => monthA - monthB)
    .map(([monthIndex, count]) => ({
      value: String(monthIndex + 1).padStart(2, "0"),
      label: MONTH_NAMES[monthIndex],
      monthIndex,
      count,
    }));
}

/**
 * Retorna os anos disponíveis com base nas datas dos itens.
 */
export function getAvailableYears(items: any[]): number[] {
  const years = new Set<number>();

  items.forEach(item => {
    const date = normalizeDate(item);
    if (date) {
      years.add(date.getUTCFullYear());
    }
  });

  // Se não houver anos com dados, adiciona pelo menos o ano atual como padrão
  if (years.size === 0) {
    years.add(new Date().getFullYear());
  }

  return Array.from(years).sort((a, b) => b - a);
}
