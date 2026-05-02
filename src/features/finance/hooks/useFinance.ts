import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { metricsService } from '../services/metrics.service';

export function useFinance(selectedDate: Date) {
  const { transactions, loading, error, refresh } = useTransactions();

  const metrics = useMemo(() => {
    if (!transactions) return null;
    try {
      console.log('[useFinance] Calculating metrics for', transactions.length, 'transactions');
      return metricsService.calculateDashboard(transactions, selectedDate);
    } catch (err) {
      console.error('[useFinance] Error calculating dashboard metrics:', err);
      return null;
    }
  }, [transactions, selectedDate]);

  return {
    transactions: transactions || [],
    metrics,
    loading,
    error,
    refresh
  };
}
