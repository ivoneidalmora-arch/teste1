import { useState, useMemo } from 'react';
import { useTransactions } from '@/features/finance/hooks/useTransactions';
import { metricsService } from '@/features/finance/services/metrics.service';
import { Transaction, IncomeTransaction } from '@/core/types/finance';

export type ReportFilterType = 'all' | 'income' | 'expense';

export function useReports() {
  const { transactions, loading, refresh } = useTransactions();
  
  // Filtros
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().substring(0, 8) + '01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [filterType, setFilterType] = useState<ReportFilterType>('all');
  const [searchPlaca, setSearchPlaca] = useState<string>('');
  const [searchCliente, setSearchCliente] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (startDate) filtered = filtered.filter(t => t.date >= startDate);
    if (endDate) filtered = filtered.filter(t => t.date <= endDate);
    
    if (searchPlaca) {
      const pl = searchPlaca.toUpperCase();
      filtered = filtered.filter(t => t.type === 'income' && (t as IncomeTransaction).placa?.includes(pl));
    }
    
    if (searchCliente) {
      const cli = searchCliente.toUpperCase();
      filtered = filtered.filter(t => t.type === 'income' && ((t as IncomeTransaction).cliente || '').toUpperCase().includes(cli));
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    return filtered;
  }, [transactions, startDate, endDate, searchPlaca, searchCliente, filterType]);

  const metrics = useMemo(() => {
    return metricsService.calculateMetrics(filteredTransactions);
  }, [filteredTransactions]);

  return {
    loading,
    refresh,
    transactions: filteredTransactions,
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
