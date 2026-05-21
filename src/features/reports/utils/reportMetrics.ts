import { 
  isIncome, 
  isExpense, 
  getGrossRevenueValue, 
  getNetRevenueValue, 
  getExpenseValue
} from '../../finance/utils/financialValueUtils';
import { formatBRL } from '@/core/utils/formatters';

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

export function formatCurrencyBRL(val: number): string {
  return formatBRL(val);
}

export function formatPercentage(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function filterTransactionsByPeriod(transactions: any[], start: string, end: string): any[] {
  if (!start || !end) return transactions;
  return transactions.filter(t => t.date >= start && t.date <= end);
}

export function filterTransactionsByMode(
  transactions: any[],
  _mode: string,
  _selectedPeriod: string,
  _selectedYear: number
): any[] {
  // Essa lógica já é gerida nativamente pelo FinanceContext, 
  // mas disponibilizamos a função para fins de compatibilidade e arquitetura.
  return transactions;
}

export interface ReportMetrics {
  totalIncome: number; // mantido para compatibilidade com código existente
  totalExpense: number; // mantido para compatibilidade com código existente
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalExpenses: number;
  netBalance: number;
  netMargin: number;
  transactionCount: number;
  incomeChart: { name: string; value: number }[];
  expenseChart: { name: string; value: number }[];
}

export function calculateReportMetrics(transactions: any[]): ReportMetrics {
  const totalGrossRevenue = calculateGrossRevenue(transactions);
  const totalNetRevenue = calculateNetRevenue(transactions);
  const totalExpenses = calculateExpenses(transactions);
  const netBalance = calculateNetBalance(totalNetRevenue, totalExpenses);
  const netMargin = calculateNetMargin(netBalance, totalGrossRevenue);
  const transactionCount = transactions.length;

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    const category = t.category || t.categoria || 'Outros';
    if (isIncome(t)) {
      const gross = getGrossRevenueValue(t);
      incomeByCategory[category] = (incomeByCategory[category] || 0) + gross;
    } else if (isExpense(t)) {
      const val = getExpenseValue(t);
      expenseByCategory[category] = (expenseByCategory[category] || 0) + val;
    }
  });

  const incomeChart = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
  const expenseChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return {
    totalIncome: totalGrossRevenue, // para manter compatibilidade com componentes que consomem metrics.totalIncome
    totalExpense: totalExpenses, // para manter compatibilidade com componentes que consomem metrics.totalExpense
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    transactionCount,
    incomeChart,
    expenseChart
  };
}
