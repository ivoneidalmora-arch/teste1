import { format, subMonths } from 'date-fns';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';

export const metricsService = {
  calculateMetrics(transactions: Transaction[]) {
    let totalIncome = 0;
    let totalExpense = 0;
    let validIncomesCount = 0;
    
    const incomeByCategory: Record<string, { total: number, count: number }> = {};
    const expenseByCategory: Record<string, { total: number, count: number }> = {};
    const rankingMap: Record<string, { count: number, bruto: number, liquido: number, categories: Record<string, number> }> = {};

    transactions.forEach(t => {
      const tValue = t.type === 'income' 
        ? ((t as IncomeTransaction).amountLiquido || t.amount || 0) 
        : (t.amount || 0);

      let cat = t.category || 'Outros';
      // Normalização de Casing para evitar duplicidade (ex: Transferência vs TRANSFERÊNCIA)
      const catLower = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (catLower.includes('transferencia')) cat = 'Transferência';
      else if (catLower.includes('entrada')) cat = 'Vistoria de Entrada';
      else if (catLower.includes('saida')) cat = 'Vistoria de Saída';
      else if (catLower.includes('cautelar')) cat = 'Vistoria Cautelar';
      else if (catLower.includes('retorno')) cat = 'Vistoria de Retorno';
      else cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

      if (t.type === 'income') {
        const inc = t as IncomeTransaction;
        totalIncome += tValue;
        validIncomesCount++;
        
        if (!incomeByCategory[cat]) incomeByCategory[cat] = { total: 0, count: 0 };
        incomeByCategory[cat].total += tValue;
        incomeByCategory[cat].count += 1;

        const cliente = (inc.cliente || '').trim().toUpperCase();
        if (cliente && cliente !== 'S/N' && cliente !== 'SN') {
          if (!rankingMap[cliente]) {
            rankingMap[cliente] = { count: 0, bruto: 0, liquido: 0, categories: {} };
          }
          rankingMap[cliente].count += 1;
          rankingMap[cliente].bruto += (inc.amountBruto || inc.amount || 0);
          rankingMap[cliente].liquido += tValue;
          rankingMap[cliente].categories[cat] = (rankingMap[cliente].categories[cat] || 0) + 1;
        }
      } else {
        const exp = t as ExpenseTransaction;
        if (exp.status !== 'Pendente') {
          totalExpense += tValue;
          if (!expenseByCategory[cat]) expenseByCategory[cat] = { total: 0, count: 0 };
          expenseByCategory[cat].total += tValue;
          expenseByCategory[cat].count += 1;
        }
      }
    });

    const incomeChart = Object.keys(incomeByCategory)
      .map(key => ({ name: key, value: incomeByCategory[key].total, count: incomeByCategory[key].count }))
      .sort((a, b) => b.value - a.value);

    const expenseChart = Object.keys(expenseByCategory)
      .map(key => ({ name: key, value: expenseByCategory[key].total, count: expenseByCategory[key].count }))
      .sort((a, b) => b.value - a.value);

    const clientRanking = Object.keys(rankingMap)
      .map(name => ({ name, ...rankingMap[name], total: rankingMap[name].liquido }))
      .sort((a, b) => b.total - a.total);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      ticketMedio: validIncomesCount > 0 ? totalIncome / validIncomesCount : 0,
      incomeChart,
      expenseChart,
      clientRanking,
      validIncomesCount
    };
  },

  calculateDashboard(transactions: Transaction[], selectedDate: Date) {
    const currentMonthKey = format(selectedDate, 'yyyy-MM');
    const prevMonthKey = format(subMonths(selectedDate, 1), 'yyyy-MM');

    const currentMonthTransactions = transactions.filter(t => 
      t.date && t.date.length >= 7 && t.date.substring(0, 7) === currentMonthKey
    );
    
    const prevMonthTransactions = transactions.filter(t => 
      t.date && t.date.length >= 7 && t.date.substring(0, 7) === prevMonthKey
    );

    const currentMetrics = this.calculateMetrics(currentMonthTransactions);
    const prevMetrics = this.calculateMetrics(prevMonthTransactions);

    const calcVariation = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : (curr < 0 ? -100 : 0);
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const monthsSet = new Set<string>();
    transactions.forEach(t => {
      const monthKey = t.date && t.date.length >= 7 ? t.date.substring(0, 7) : null;
      if (monthKey && /^\d{4}-\d{2}$/.test(monthKey)) monthsSet.add(monthKey);
    });

    const totalGlobalIncome = transactions.reduce((acc, t) => acc + (t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount || 0) : 0), 0);
    const totalGlobalExpense = transactions.reduce((acc, t) => acc + (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente' ? t.amount : 0), 0);

    return {
      ...currentMetrics,
      currentIncome: currentMetrics.totalIncome,
      currentExpense: currentMetrics.totalExpense,
      currentBalance: currentMetrics.netBalance,
      incomeVariation: calcVariation(currentMetrics.totalIncome, prevMetrics.totalIncome),
      expenseVariation: calcVariation(currentMetrics.totalExpense, prevMetrics.totalExpense),
      balanceVariation: calcVariation(currentMetrics.netBalance, prevMetrics.netBalance),
      totalGlobalBalance: totalGlobalIncome - totalGlobalExpense,
      availableMonths: Array.from(monthsSet).sort((a, b) => b.localeCompare(a)),
      inspectionSummary: currentMetrics.incomeChart.map(i => ({ name: i.name, total: i.value, count: i.count }))
    };
  }
};
