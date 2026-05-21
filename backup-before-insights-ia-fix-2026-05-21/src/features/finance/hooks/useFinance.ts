import { useFinanceContext } from '../contexts/FinanceContext';

export function useFinance() {
  const { transactions, loading, error, refresh, selectedPeriod, availableMonths, filteredTransactions } = useFinanceContext();

  return {
    transactions,
    filteredTransactions,
    selectedPeriod,
    availableMonths,
    loading,
    error,
    refresh
  };
}
