import { 
  isIncome, 
  isExpense, 
  getGrossRevenueValue, 
  getNetRevenueValue, 
  getExpenseValue
} from '../../finance/utils/financialValueUtils';
import { formatBRL } from '@/core/utils/formatters';

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function calculateGrossRevenue(transactions: any[]): number {
  return transactions.reduce((acc, t) => acc + (isIncome(t) ? getGrossRevenueValue(t) : 0), 0);
}

export function calculateNetRevenue(transactions: any[]): number {
  return transactions.reduce((acc, t) => acc + (isIncome(t) ? getNetRevenueValue(t) : 0), 0);
}

export function calculateExpenses(transactions: any[]): number {
  return transactions.reduce((acc, t) => acc + (isExpense(t) ? getExpenseValue(t) : 0), 0);
}

export function calculateNetBalance(netRevenue: number, expenses: number): number {
  return netRevenue - expenses;
}

export function calculateNetMargin(netBalance: number, grossRevenue: number): number {
  if (grossRevenue <= 0) return 0;
  return (netBalance / grossRevenue) * 100;
}

export function calculateTicketAverage(grossRevenue: number, transactionCount: number): number {
  if (transactionCount <= 0) return 0;
  return grossRevenue / transactionCount;
}

export function groupCashFlowByMonth(transactions: any[]): Record<string, { income: number, expense: number, balance: number }> {
  const months: Record<string, { income: number, expense: number, balance: number }> = {};
  
  // Ordena para garantir que a ordem dos meses nos gráficos seja cronológica
  const sortedTrans = [...transactions].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  sortedTrans.forEach(t => {
    if (!t.date) return;
    const parts = t.date.split('-');
    if (parts.length < 2) return;
    const monthIndex = parseInt(parts[1]) - 1;
    if (monthIndex < 0 || monthIndex > 11) return;
    const monthName = MONTH_NAMES[monthIndex];
    
    if (!months[monthName]) {
      months[monthName] = { income: 0, expense: 0, balance: 0 };
    }
    
    if (isIncome(t)) {
      const net = getNetRevenueValue(t);
      months[monthName].income += net;
      months[monthName].balance += net;
    } else if (isExpense(t)) {
      const exp = getExpenseValue(t);
      months[monthName].expense += exp;
      months[monthName].balance -= exp;
    }
  });
  
  return months;
}

export function calculateBestMonth(transactions: any[]): { month: string; value: number } {
  const months = groupCashFlowByMonth(transactions);
  let bestMonth = '---';
  let maxValue = -Infinity;
  
  Object.entries(months).forEach(([month, data]) => {
    if (data.balance > maxValue) {
      maxValue = data.balance;
      bestMonth = month;
    }
  });
  
  return { month: bestMonth, value: maxValue === -Infinity ? 0 : maxValue };
}

export function calculateWorstMonth(transactions: any[]): { month: string; value: number } {
  const months = groupCashFlowByMonth(transactions);
  let worstMonth = '---';
  let minValue = Infinity;
  
  Object.entries(months).forEach(([month, data]) => {
    if (data.balance < minValue) {
      minValue = data.balance;
      worstMonth = month;
    }
  });
  
  return { month: worstMonth, value: minValue === Infinity ? 0 : minValue };
}

export function calculateYTDVariation(allTransactions: any[], selectedYear: number, start: string, end: string): number {
  if (!start || !end) return 0;
  
  const currentPeriodTransactions = allTransactions.filter(t => t.date >= start && t.date <= end);
  const currentNet = calculateNetRevenue(currentPeriodTransactions);
  
  const lastYearStart = start.replace(selectedYear.toString(), (selectedYear - 1).toString());
  const lastYearEnd = end.replace(selectedYear.toString(), (selectedYear - 1).toString());
  
  const lastPeriodTransactions = allTransactions.filter(t => t.date >= lastYearStart && t.date <= lastYearEnd);
  const lastNet = calculateNetRevenue(lastPeriodTransactions);
  
  if (lastNet <= 0) return 0;
  return ((currentNet - lastNet) / lastNet) * 100;
}

export function groupRevenueByCategory(transactions: any[]): { name: string; value: number }[] {
  const categoryMap: Record<string, number> = {};
  transactions.forEach(t => {
    if (isIncome(t)) {
      const category = t.category || t.categoria || 'Outros';
      const net = getNetRevenueValue(t);
      categoryMap[category] = (categoryMap[category] || 0) + net;
    }
  });
  return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
}

export function filterTransactionsByDateRange(transactions: any[], start: string, end: string): any[] {
  if (!start || !end) return transactions;
  return transactions.filter(t => t.date >= start && t.date <= end);
}

export function filterTransactionsByMode(
  transactions: any[],
  mode: string,
  selectedPeriod: string,
  selectedYear: number
): any[] {
  if (mode === 'monthly') {
    if (selectedPeriod === 'global') return transactions;
    const monthStr = selectedPeriod.padStart(2, '0');
    return transactions.filter(t => t.date && t.date.startsWith(`${selectedYear}-${monthStr}`));
  }
  return transactions.filter(t => t.date && t.date.startsWith(`${selectedYear}`));
}

export function formatCurrencyBRL(val: number): string {
  return formatBRL(val);
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`;
}

export interface ReportMetrics {
  totalIncome: number;
  totalExpense: number;
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalExpenses: number;
  netBalance: number;
  netMargin: number;
  transactionCount: number;
  ticketAverage: number;
  bestMonth: { month: string; value: number };
  worstMonth: { month: string; value: number };
  ytdVariation: number;
  incomeChart: { name: string; value: number }[];
  expenseChart: { name: string; value: number }[];
}

export function calculateReportMetrics(
  transactions: any[], 
  allTransactions: any[] = [], 
  selectedYear: number = new Date().getFullYear(),
  startDate: string = '',
  endDate: string = ''
): ReportMetrics {
  const totalGrossRevenue = calculateGrossRevenue(transactions);
  const totalNetRevenue = calculateNetRevenue(transactions);
  const totalExpenses = calculateExpenses(transactions);
  const netBalance = calculateNetBalance(totalNetRevenue, totalExpenses);
  const netMargin = calculateNetMargin(netBalance, totalGrossRevenue);
  const transactionCount = transactions.length;
  
  const ticketAverage = calculateTicketAverage(totalGrossRevenue, transactionCount);
  const bestMonth = calculateBestMonth(transactions);
  const worstMonth = calculateWorstMonth(transactions);
  
  const allTrans = allTransactions.length > 0 ? allTransactions : transactions;
  const ytdVariation = calculateYTDVariation(allTrans, selectedYear, startDate, endDate);

  const incomeChart = groupRevenueByCategory(transactions);

  const expenseByCategory: Record<string, number> = {};
  transactions.forEach(t => {
    if (isExpense(t)) {
      const category = t.category || t.categoria || 'Outros';
      const val = getExpenseValue(t);
      expenseByCategory[category] = (expenseByCategory[category] || 0) + val;
    }
  });
  const expenseChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return {
    totalIncome: totalGrossRevenue,
    totalExpense: totalExpenses,
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    transactionCount,
    ticketAverage,
    bestMonth,
    worstMonth,
    ytdVariation,
    incomeChart,
    expenseChart
  };
}
