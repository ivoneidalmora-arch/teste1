import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { storageService } from '@/services/storage';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

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
    const currentStart = startOfMonth(selectedDate);
    const currentEnd = endOfMonth(selectedDate);

    const prevStart = startOfMonth(subMonths(selectedDate, 1));
    const prevEnd = endOfMonth(subMonths(selectedDate, 1));

    let currentIncome = 0;
    let currentExpense = 0;
    let prevIncome = 0;
    let prevExpense = 0;

    // Filter array to current month
    const currentMonthTransactions = [];

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      // Usando valor líquido (se existir) para as receitas e desconsiderando despesas pendentes
      const tValue = t.type === 'income' 
          ? ((t as IncomeTransaction).amountLiquido || t.amount) 
          : t.amount;

      if (isWithinInterval(tDate, { start: currentStart, end: currentEnd })) {
        currentMonthTransactions.push(t);
        if (t.type === 'income') currentIncome += tValue;
        if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') currentExpense += tValue;
      } else if (isWithinInterval(tDate, { start: prevStart, end: prevEnd })) {
        if (t.type === 'income') prevIncome += tValue;
        if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') prevExpense += tValue;
      }
    });

    const currentBalance = currentIncome - currentExpense;
    const prevBalance = prevIncome - prevExpense;

    const calcVariation = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : (curr < 0 ? -100 : 0);
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    return {
      currentIncome,
      currentExpense,
      currentBalance,
      incomeVariation: calcVariation(currentIncome, prevIncome),
      expenseVariation: calcVariation(currentExpense, prevExpense),
      balanceVariation: calcVariation(currentBalance, prevBalance),
      currentMonthTransactions
    };
  }, [transactions, selectedDate]);

  return {
    transactions,
    metrics,
    loading,
    refresh: fetchData,
  };
}
