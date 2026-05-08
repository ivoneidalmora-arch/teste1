import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/core/types/finance';
import { transactionService } from '../services/transaction.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';

export function useTransactions() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll(user.id);
      setTransactions(data);
    } catch (err: any) {
      console.error('[useTransactions] Error:', err);
      setError('Falha ao carregar transações. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { 
    transactions, 
    loading, 
    error, 
    refresh: fetchTransactions 
  };
}
