import { useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { storageService } from '@/services/storage';

export type ReportFilter = 'all' | 'income' | 'expense';

export function useReports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros Globais
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<ReportFilter>('all');
  const [searchPlaca, setSearchPlaca] = useState<string>('');
  const [searchCliente, setSearchCliente] = useState<string>('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
       filtered = filtered.filter(t => t.type === filterType);
    }
    if (startDate) {
       filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
       filtered = filtered.filter(t => t.date <= endDate);
    }
    if (searchPlaca) {
       const pl = searchPlaca.toUpperCase();
       filtered = filtered.filter(t => t.type === 'income' && (t as IncomeTransaction).placa?.includes(pl));
    }
    if (searchCliente) {
       const cli = searchCliente.toUpperCase();
       filtered = filtered.filter(t => t.type === 'income' && ((t as IncomeTransaction).cliente || '').toUpperCase().includes(cli));
    }
    return filtered;
  }, [transactions, filterType, startDate, endDate, searchPlaca, searchCliente]);

  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let validIncomesCount = 0;
    
    // Totais no filtro
    filteredTransactions.forEach(t => {
       if (t.type === 'income') {
         totalIncome += ((t as IncomeTransaction).amountLiquido || t.amount);
         validIncomesCount++;
       }
       if (t.type === 'expense' && (t as ExpenseTransaction).status !== 'Pendente') {
         totalExpense += t.amount;
       }
    });

    const netBalance = totalIncome - totalExpense;
    const ticketMedio = validIncomesCount > 0 ? (totalIncome / validIncomesCount) : 0;

    // Agrupamento de Categorias de Vistoria pra plotar Ranking Horizontal
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      const val = t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount;
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + val;
      } else {
        if ((t as ExpenseTransaction).status !== 'Pendente') {
           expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + val;
        }
      }
    });

    const incomeChart = Object.keys(incomeByCategory)
      .map(key => ({ name: key, value: incomeByCategory[key] }))
      .sort((a,b) => b.value - a.value);
      
    const expenseChart = Object.keys(expenseByCategory)
      .map(key => ({ name: key, value: expenseByCategory[key] }))
      .sort((a,b) => b.value - a.value);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      ticketMedio,
      validIncomesCount,
      incomeChart,
      expenseChart,
    };
  }, [filteredTransactions]);

  return {
    loading,
    refresh: fetchTransactions,
    transactions: filteredTransactions,
    rawTransactions: transactions,
    metrics,
    filters: {
      startDate, setStartDate,
      endDate, setEndDate,
      filterType, setFilterType,
      searchPlaca, setSearchPlaca,
      searchCliente, setSearchCliente
    }
  };
}
