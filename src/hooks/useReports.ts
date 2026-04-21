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

  const periodFilteredTransactions = useMemo(() => {
    let filtered = transactions;

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
  }, [transactions, startDate, endDate, searchPlaca, searchCliente]);

  const viewFilteredTransactions = useMemo(() => {
    if (filterType === 'all') return periodFilteredTransactions;
    return periodFilteredTransactions.filter(t => t.type === filterType);
  }, [periodFilteredTransactions, filterType]);

  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let validIncomesCount = 0;
    
    // Agrupamentos
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    const rankingMap: Record<string, { count: number, total: number }> = {};
    
    // Métricas baseadas no período INTEGRAL (ignorando filtro de tipo para o balanço)
    periodFilteredTransactions.forEach(t => {
       const val = t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount;
       
       if (t.type === 'income') {
         totalIncome += val;
         validIncomesCount++;
         
         // Por Categoria
         incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + val;
         
         // Ranking de Clientes (ignora S/N ou vazios)
         const cliente = ((t as IncomeTransaction).cliente || '').trim().toUpperCase();
         if (cliente && cliente !== 'S/N' && cliente !== 'S.N') {
            if (!rankingMap[cliente]) rankingMap[cliente] = { count: 0, total: 0 };
            rankingMap[cliente].count += 1;
            rankingMap[cliente].total += val;
         }
       } else {
         if ((t as ExpenseTransaction).status !== 'Pendente') {
            totalExpense += val;
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + val;
         }
       }
    });

    const netBalance = totalIncome - totalExpense;
    const ticketMedio = validIncomesCount > 0 ? (totalIncome / validIncomesCount) : 0;

    const incomeChart = Object.keys(incomeByCategory)
      .map(key => ({ name: key, value: incomeByCategory[key] }))
      .sort((a,b) => b.value - a.value);
      
    const expenseChart = Object.keys(expenseByCategory)
      .map(key => ({ name: key, value: expenseByCategory[key] }))
      .sort((a,b) => b.value - a.value);

    // Ranking de Clientes (Top 5 por valor pago)
    const clientRanking = Object.keys(rankingMap)
      .map(name => ({
        name,
        count: rankingMap[name].count,
        total: rankingMap[name].total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      ticketMedio,
      validIncomesCount,
      incomeChart,
      expenseChart,
      clientRanking
    };
  }, [periodFilteredTransactions]);

  return {
    loading,
    refresh: fetchTransactions,
    transactions: viewFilteredTransactions,
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
