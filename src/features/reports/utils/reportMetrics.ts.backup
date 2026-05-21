import { 
  isIncome, 
  isExpense, 
  getGrossRevenueValue, 
  getNetRevenueValue, 
  getExpenseValue,
  isExpensePaid
} from '../../finance/utils/financialValueUtils';

export function calculateReportMetrics(transactions: any[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    if (isIncome(t)) {
      const gross = getGrossRevenueValue(t);
      const net = getNetRevenueValue(t);
      totalIncome += gross;
      
      const category = t.category || t.categoria || 'Outros';
      incomeByCategory[category] = (incomeByCategory[category] || 0) + gross;
    } else if (isExpense(t)) {
      const val = getExpenseValue(t);
      // Para o DRE, geralmente consideramos despesas totais (ou pagas, dependendo do regime)
      // O SeniorFinancialReport parece considerar despesas totais no gráfico
      totalExpense += val;
      
      const category = t.category || t.categoria || 'Outros';
      expenseByCategory[category] = (expenseByCategory[category] || 0) + val;
    }
  });

  const incomeChart = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
  const expenseChart = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  // O netBalance no SeniorFinancialReport é calculado como Receita Líquida - Despesas Pagas?
  // Na regra do dashboard: saldoDisponivel = receitaLiquida - despesasPagas
  // Vou seguir essa regra para consistência.
  
  let totalNetRevenue = 0;
  let totalPaidExpenses = 0;
  
  transactions.forEach(t => {
    if (isIncome(t)) {
      totalNetRevenue += getNetRevenueValue(t);
    } else if (isExpense(t) && isExpensePaid(t)) {
      totalPaidExpenses += getExpenseValue(t);
    }
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalNetRevenue - totalPaidExpenses,
    incomeChart,
    expenseChart
  };
}
