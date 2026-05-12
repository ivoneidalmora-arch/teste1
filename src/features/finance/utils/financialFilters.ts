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
    
    // Se não for o ano selecionado, descarta
    if (itemYear !== selectedYear) return false;

    // Se o período for global/all, já passou no filtro de ano
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
 * Retorna os anos disponíveis com base nas datas dos itens.
 */
export function getAvailableYears(items: any[]): number[] {
  const years = new Set<number>();
  const currentYear = new Date().getFullYear();
  
  // Sempre garante o ano atual e o anterior
  years.add(currentYear);
  years.add(currentYear - 1);

  items.forEach(item => {
    const date = normalizeDate(item);
    if (date) {
      years.add(date.getUTCFullYear());
    }
  });

  return Array.from(years).sort((a, b) => b - a);
}
