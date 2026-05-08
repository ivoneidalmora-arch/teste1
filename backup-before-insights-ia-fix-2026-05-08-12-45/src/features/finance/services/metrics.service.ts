import { format, subMonths } from 'date-fns';
import { Transaction } from '@/core/types/finance';
import { 
  calculateFinancialMetrics, 
  calculatePercentageChange,
  normalizeTransaction 
} from '@/core/utils/finance';

export const metricsService = {
  calculateMetrics(transactions: Transaction[]) {
    const coreMetrics = calculateFinancialMetrics(transactions);
    
    const incomeByCategory: Record<string, { total: number, count: number }> = {};
    const expenseByCategory: Record<string, { total: number, count: number }> = {};
    const rankingMap: Record<string, { count: number, bruto: number, liquido: number, categories: Record<string, number> }> = {};

    transactions.forEach(rawT => {
      const t = normalizeTransaction(rawT);
      let cat = t.category || 'Outros';
      
      // Normalização de Casing para evitar duplicidade
      const catLower = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (catLower.includes('transferencia')) cat = 'Transferência';
      else if (catLower.includes('entrada')) cat = 'Vistoria de Entrada';
      else if (catLower.includes('saida')) cat = 'Vistoria de Saída';
      else if (catLower.includes('cautelar')) cat = 'Vistoria Cautelar';
      else if (catLower.includes('retorno')) cat = 'Vistoria de Retorno';
      else cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

      if (t.type === 'income') {
        if (!incomeByCategory[cat]) incomeByCategory[cat] = { total: 0, count: 0 };
        incomeByCategory[cat].total += t.netAmount || 0;
        incomeByCategory[cat].count += 1;

        const cliente = (t.customer || '').trim().toUpperCase();
        if (cliente && cliente !== 'S/N' && cliente !== 'SN') {
          if (!rankingMap[cliente]) {
            rankingMap[cliente] = { count: 0, bruto: 0, liquido: 0, categories: {} };
          }
          rankingMap[cliente].count += 1;
          rankingMap[cliente].bruto += t.grossAmount || 0;
          rankingMap[cliente].liquido += t.netAmount || 0;
          rankingMap[cliente].categories[cat] = (rankingMap[cliente].categories[cat] || 0) + 1;
        }
      } else {
        if (t.status === 'paid') {
          if (!expenseByCategory[cat]) expenseByCategory[cat] = { total: 0, count: 0 };
          expenseByCategory[cat].total += t.amount || 0;
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
      totalIncome: coreMetrics.receitaLiquida,
      totalGrossIncome: coreMetrics.receitaBruta,
      totalExpense: coreMetrics.despesasTotal,
      totalPendingExpense: coreMetrics.despesasPendentes,
      netBalance: coreMetrics.saldoDisponivel,
      ticketMedio: coreMetrics.totalTransactions > 0 ? coreMetrics.receitaLiquida / coreMetrics.totalTransactions : 0,
      incomeChart,
      expenseChart,
      clientRanking,
      validIncomesCount: coreMetrics.totalTransactions // Simplificado
    };
  },

  calculateDashboard(transactions: Transaction[], selectedDate: Date) {
    const currentMonthKey = format(selectedDate, 'yyyy-MM');
    const prevMonthKey = format(subMonths(selectedDate, 1), 'yyyy-MM');

    const currentMonthTransactions = transactions.filter(t => {
      const d = normalizeTransaction(t).date;
      return d && d.startsWith(currentMonthKey);
    });
    
    const prevMonthTransactions = transactions.filter(t => {
      const d = normalizeTransaction(t).date;
      return d && d.startsWith(prevMonthKey);
    });

    const currentMetrics = this.calculateMetrics(currentMonthTransactions);
    const prevMetrics = this.calculateMetrics(prevMonthTransactions);

    const calcVariation = (curr: number, prev: number) => {
      return calculatePercentageChange(curr, prev);
    };

    const monthsSet = new Set<string>();
    transactions.forEach(t => {
      const d = normalizeTransaction(t).date;
      if (d && d.length >= 7) {
        const monthKey = d.substring(0, 7);
        if (/^\d{4}-\d{2}$/.test(monthKey)) monthsSet.add(monthKey);
      }
    });

    // Cálculos Globais
    const globalMetrics = calculateFinancialMetrics(transactions);

    // Fluxo de Caixa (últimos 6 meses)
    const cashFlowData = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(selectedDate, i);
      const monthKey = format(d, 'yyyy-MM');
      const monthLabel = monthNames[d.getMonth()];
      
      const mTs = transactions.filter(t => {
        const td = normalizeTransaction(t).date;
        return td && td.startsWith(monthKey);
      });
      const mMetrics = calculateFinancialMetrics(mTs);
      
      cashFlowData.push({
        name: monthLabel,
        entradas: mMetrics.receitaLiquida,
        saidas: mMetrics.despesasTotal,
        saldo: mMetrics.saldoDisponivel
      });
    }

    // Top Clients (Top 4)
    const topClients = currentMetrics.clientRanking.slice(0, 4).map((c, i) => ({
      id: String(i + 1),
      name: c.name,
      amount: c.total,
      percentage: currentMetrics.totalIncome > 0 ? (c.total / currentMetrics.totalIncome) * 100 : 0
    }));

    // Category Distribution (Expenses)
    const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#64748b'];
    const categoryDistribution = currentMetrics.expenseChart.slice(0, 5).map((c, i) => ({
      name: c.name,
      value: c.value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }));

    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: 'Sem Despesas', value: 0, color: '#e2e8f0' });
    }

    // Calendar Events
    const calendarEvents = currentMonthTransactions
      .map(normalizeTransaction)
      .slice(0, 5)
      .map(t => ({
        id: String(t.id || Math.random().toString()),
        date: t.date!,
        title: t.description || 'Transação',
        amount: t.type === 'income' ? (t.netAmount || t.amount) : t.amount,
        type: t.type
      }));

    return {
      ...currentMetrics,
      currentIncome: currentMetrics.totalIncome,
      currentGrossIncome: currentMetrics.totalGrossIncome,
      currentExpense: currentMetrics.totalExpense,
      currentPendingExpense: currentMetrics.totalPendingExpense,
      currentBalance: currentMetrics.netBalance,
      incomeVariation: calcVariation(currentMetrics.totalIncome, prevMetrics.totalIncome),
      grossVariation: calcVariation(currentMetrics.totalGrossIncome, prevMetrics.totalGrossIncome),
      expenseVariation: calcVariation(currentMetrics.totalExpense, prevMetrics.totalExpense),
      balanceVariation: calcVariation(currentMetrics.netBalance, prevMetrics.netBalance),
      totalGlobalBalance: globalMetrics.saldoDisponivel,
      availableMonths: Array.from(monthsSet).sort((a, b) => b.localeCompare(a)),
      inspectionSummary: currentMetrics.incomeChart.map(i => ({ name: i.name, total: i.value, count: i.count })),
      cashFlowData,
      topClients,
      categoryDistribution,
      calendarEvents
    };
  }
};
