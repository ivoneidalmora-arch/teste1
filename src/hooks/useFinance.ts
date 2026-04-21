import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { storageService } from '@/services/storage';
import { format, subMonths } from 'date-fns';

export function useFinance(selectedDate: Date) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = useMemo(() => {
    const currentMonthKey = format(selectedDate, 'yyyy-MM');
    const prevMonthKey = format(subMonths(selectedDate, 1), 'yyyy-MM');

    let currentIncome = 0;
    let currentExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;
    let totalGlobalIncome = 0;
    let totalGlobalExpense = 0;
    
    const monthsSet = new Set<string>();
    const currentMonthTransactions: Transaction[] = [];

    transactions.forEach((t) => {
      const monthKey = t.date.substring(0, 7);
      monthsSet.add(monthKey);

      const tValue = t.type === 'income' 
          ? ((t as IncomeTransaction).amountLiquido || t.amount) 
          : t.amount;

      // Global Sums
      if (t.type === 'income') totalGlobalIncome += tValue;
      if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') totalGlobalExpense += tValue;

      if (monthKey === currentMonthKey) {
        currentMonthTransactions.push(t);
        if (t.type === 'income') currentIncome += tValue;
        if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') currentExpense += tValue;
      } else if (monthKey === prevMonthKey) {
        if (t.type === 'income') prevIncome += tValue;
        if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') prevExpense += tValue;
      }
    });

    const currentBalance = currentIncome - currentExpense;
    const prevBalance = prevIncome - prevExpense;
    const totalGlobalBalance = totalGlobalIncome - totalGlobalExpense;

    const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

    const calcVariation = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : (curr < 0 ? -100 : 0);
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    // --- Novas estatísticas dinâmicas para o Dashboard ---
    const rankingMap: Record<string, { count: number, total: number }> = {};
    const inspectionMap: Record<string, { count: number, total: number }> = {};

    currentMonthTransactions.forEach(t => {
       const val = t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount;
       
       if (t.type === 'income') {
         // Ranking de Clientes (Filtro Dinâmico Mensal)
         const cliente = ((t as IncomeTransaction).cliente || '').trim().toUpperCase();
         if (cliente && cliente !== 'S/N' && cliente !== 'SN') {
            if (!rankingMap[cliente]) rankingMap[cliente] = { count: 0, total: 0 };
            rankingMap[cliente].count += 1;
            rankingMap[cliente].total += val;
         }

         // Balanço de Vistorias Detalhado
         const cat = t.category;
         if (!inspectionMap[cat]) inspectionMap[cat] = { count: 0, total: 0 };
         inspectionMap[cat].count += 1;
         inspectionMap[cat].total += val;
       }
    });

    const clientRanking = Object.keys(rankingMap)
      .map(name => ({ name, count: rankingMap[name].count, total: rankingMap[name].total }))
      .sort((a,b) => b.total - a.total) // Ordenado por valor conforme solicitado
      .slice(0, 5);

    const inspectionSummary = Object.keys(inspectionMap)
      .map(name => ({ name, count: inspectionMap[name].count, total: inspectionMap[name].total }))
      .sort((a,b) => b.total - a.total);

    return {
      currentIncome,
      currentExpense,
      currentBalance,
      totalGlobalIncome,
      totalGlobalExpense,
      totalGlobalBalance,
      availableMonths,
      incomeVariation: calcVariation(currentIncome, prevIncome),
      expenseVariation: calcVariation(currentExpense, prevExpense),
      balanceVariation: calcVariation(currentBalance, prevBalance),
      currentMonthTransactions,
      clientRanking,
      inspectionSummary
    };
  }, [transactions, selectedDate]);

  return {
    transactions,
    metrics,
    loading,
    refresh: fetchData,
  };
}
