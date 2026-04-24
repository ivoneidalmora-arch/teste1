import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/core/types/finance';
import { transactionService } from '../services/transaction.service';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const data = await transactionService.getAll();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, refresh: fetchTransactions };
}
