"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Transaction } from '@/core/types/finance';
import { transactionService } from '../services/transaction.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { filterByMonth } from '@/core/utils/finance';

interface FinanceContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedPeriod: string; // 'global' ou 'YYYY-MM'
  availableMonths: string[];
  setPeriod: (period: string) => void;
  refresh: () => Promise<void>;
  filteredTransactions: Transaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // O período vem da URL ou padrão 'global'
  const selectedPeriod = searchParams.get('periodo') || 'global';

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
      console.error('[FinanceContext] Error:', err);
      setError('Falha ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const availableMonths = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const months = new Set<string>();
    transactions.forEach(t => {
      try {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      } catch (e) {}
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const setPeriod = useCallback((period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (period === 'global') {
      params.delete('periodo');
    } else {
      params.set('periodo', period);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'global') return transactions;
    
    const [year, month] = selectedPeriod.split('-').map(Number);
    // filterByMonth espera um objeto Date
    return filterByMonth(transactions, new Date(year, month - 1, 1));
  }, [transactions, selectedPeriod]);

  const value = {
    transactions,
    loading,
    error,
    selectedPeriod,
    availableMonths,
    setPeriod,
    refresh: fetchTransactions,
    filteredTransactions
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}
