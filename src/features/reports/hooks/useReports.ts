import { useState, useMemo } from 'react';
import { useTransactions } from '@/features/finance/hooks/useTransactions';
import { metricsService } from '@/features/finance/services/metrics.service';
import { Transaction, IncomeTransaction } from '@/core/types/finance';

export type ReportFilterType = 'all' | 'income' | 'expense';

import { useFinanceContext } from '@/features/finance/contexts/FinanceContext';

export function useReports() {
  const { filteredTransactions, loading, error, refresh, transactions: allTransactions } = useFinanceContext();
  
  // Filtros específicos da página
  const [filterType, setFilterType] = useState<ReportFilterType>('all');
  const [searchPlaca, setSearchPlaca] = useState<string>('');
  const [searchCliente, setSearchCliente] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const reportsFiltered = useMemo(() => {
    let filtered = filteredTransactions;

    if (searchPlaca) {
      const pl = searchPlaca.toUpperCase();
      filtered = filtered.filter(t => String(t.metadata?.placa || '').includes(pl));
    }
    
    if (searchCliente) {
      const cli = searchCliente.toUpperCase();
      filtered = filtered.filter(t => (t.customer || '').toUpperCase().includes(cli));
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    return filtered;
  }, [filteredTransactions, searchPlaca, searchCliente, filterType, filterStatus]);

  const metrics = useMemo(() => {
    return metricsService.calculateMetrics(reportsFiltered);
  }, [reportsFiltered]);

  return {
    loading,
    error,
    refresh,
    transactions: reportsFiltered,
    allTransactions,
    metrics,
    filters: {
      filterType, setFilterType,
      searchPlaca, setSearchPlaca,
      searchCliente, setSearchCliente,
      filterStatus, setFilterStatus
    }
  };
}
