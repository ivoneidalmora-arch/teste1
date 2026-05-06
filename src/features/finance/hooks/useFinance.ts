import { useTransactions } from "./useTransactions";

export function useFinance() {
  const { transactions, loading, error, refresh } = useTransactions();

  return {
    transactions: transactions || [],
    loading,
    error,
    refresh
  };
}
