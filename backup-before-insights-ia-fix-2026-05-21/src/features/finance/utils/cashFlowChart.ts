import { 
  normalizeDate, 
  getDaysInMonth, 
  getMonthLabel 
} from './financialDateUtils';
import { 
  isIncome, 
  isExpense, 
  getNetRevenueValue, 
  getExpenseValue,
  isExpensePaid,
  isExpensePending,
  getGrossRevenueValue
} from './financialValueUtils';

export type CashFlowChartItem = {
  label: string;
  entradas: number;
  saidas: number;
  saldo: number;
  receitaBruta?: number;
  receitaLiquida?: number;
  despesasPendentes?: number;
};

export type PrepareCashFlowParams = {
  transactions: any[];
  selectedPeriod: string | number;
  selectedYear: number;
};

export function prepareCashFlowChartData({
  transactions,
  selectedPeriod,
  selectedYear
}: PrepareCashFlowParams) {
  const isGlobal = selectedPeriod === 'global' || selectedPeriod === 'all' || selectedPeriod === 'tudo';
  
  if (isGlobal) {
    return prepareMonthlyData(transactions, selectedYear);
  } else {
    // Extrai o mês do período (YYYY-MM ou apenas MM)
    const month = typeof selectedPeriod === 'string' && selectedPeriod.includes('-')
      ? parseInt(selectedPeriod.split('-')[1]) - 1
      : parseInt(String(selectedPeriod)) - 1;
    
    return prepareDailyData(transactions, month, selectedYear);
  }
}

function prepareMonthlyData(transactions: any[], year: number) {
  const data: CashFlowChartItem[] = [];

  for (let m = 0; m < 12; m++) {
    const monthTransactions = transactions.filter(t => {
      const d = normalizeDate(t);
      return d && d.getUTCFullYear() === year && d.getUTCMonth() === m;
    });

    let entradas = 0;
    let saidas = 0;
    let receitaBruta = 0;
    let despesasPendentes = 0;

    monthTransactions.forEach(t => {
      if (isIncome(t)) {
        const net = getNetRevenueValue(t);
        entradas += net;
        receitaBruta += getGrossRevenueValue(t);
      } else if (isExpense(t)) {
        const val = getExpenseValue(t);
        if (isExpensePaid(t)) {
          saidas += val;
        } else if (isExpensePending(t)) {
          despesasPendentes += val;
        }
      }
    });

    data.push({
      label: getMonthLabel(m),
      entradas,
      saidas,
      saldo: entradas - saidas,
      receitaBruta,
      receitaLiquida: entradas,
      despesasPendentes
    });
  }

  // REQUISITO 15: Filtrar somente meses com movimentação real
  const filteredData = data.filter(d => d.entradas !== 0 || d.saidas !== 0);

  return {
    mode: "monthly" as const,
    title: "Fluxo de Caixa Global",
    subtitle: "Comparativo mensal consolidado de entradas e saídas",
    data: filteredData.length > 0 ? filteredData : data // Fallback para não quebrar layout se estiver tudo zerado
  };
}

function prepareDailyData(transactions: any[], month: number, year: number) {
  const daysInMonth = getDaysInMonth(month, year);
  const data: CashFlowChartItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayTransactions = transactions.filter(t => {
      const date = normalizeDate(t);
      return date && 
             date.getUTCFullYear() === year && 
             date.getUTCMonth() === month && 
             date.getUTCDate() === d;
    });

    let entradas = 0;
    let saidas = 0;

    dayTransactions.forEach(t => {
      if (isIncome(t)) {
        entradas += getNetRevenueValue(t);
      } else if (isExpense(t)) {
        if (isExpensePaid(t)) {
          saidas += getExpenseValue(t);
        }
      }
    });

    data.push({
      label: String(d),
      entradas,
      saidas,
      saldo: entradas - saidas
    });
  }

  return {
    mode: "daily" as const,
    title: "Fluxo de Caixa",
    subtitle: "Comparativo diário de entradas e saídas",
    data
  };
}
