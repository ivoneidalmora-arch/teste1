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

  const fetchTransactions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
    const rankingMap: Record<string, { count: number, bruto: number, liquido: number, categories: Record<string, number> }> = {};
    
    // Métricas baseadas no período INTEGRAL (ignorando filtro de tipo para o balanço)
    periodFilteredTransactions.forEach(t => {
       if (t.type === 'income') {
         const inc = t as IncomeTransaction;
         const valBruto = inc.amountBruto || inc.amount || 0;
         const valLiquido = inc.amountLiquido || valBruto;
         const cat = t.category;
         
         totalIncome += valLiquido;
         validIncomesCount++;
         
         // Por Categoria
         incomeByCategory[cat] = (incomeByCategory[cat] || 0) + valLiquido;
         
         // Ranking de Clientes (ignora S/N ou vazios)
         const cliente = (inc.cliente || '').trim().toUpperCase();
         if (cliente && cliente !== 'S/N' && cliente !== 'S.N' && cliente !== 'SN') {
            if (!rankingMap[cliente]) {
              rankingMap[cliente] = { count: 0, bruto: 0, liquido: 0, categories: {} };
            }
            rankingMap[cliente].count += 1;
            rankingMap[cliente].bruto += valBruto;
            rankingMap[cliente].liquido += valLiquido;
            
            // Detalhamento de Categorias por Cliente
            rankingMap[cliente].categories[cat] = (rankingMap[cliente].categories[cat] || 0) + 1;
         }
       } else {
         const exp = t as ExpenseTransaction;
         const val = exp.amount || 0;
         if (exp.status !== 'Pendente') {
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

    // Ranking de Clientes (Baseado no valor Líquido)
    const clientRanking = Object.keys(rankingMap)
      .map(name => ({
        name,
        count: rankingMap[name].count,
        total: rankingMap[name].liquido,
        bruto: rankingMap[name].bruto,
        liquido: rankingMap[name].liquido,
        categories: rankingMap[name].categories
      }))
      .sort((a, b) => b.total - a.total);

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
    refresh: () => fetchTransactions(true),
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
