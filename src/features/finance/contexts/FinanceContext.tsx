"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Transaction } from '@/core/types/finance';
import { transactionService } from '../services/transaction.service';
import { approvedDuplicateService } from '../services/approved-duplicate.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { filterByMonth } from '@/core/utils/finance';
import { filterByPeriodAndYear, getAvailableMonths, AvailableMonth } from '../utils/financialFilters';

interface FinanceContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedPeriod: string; // 'global' ou 'MM'
  selectedYear: number;
  availableMonths: AvailableMonth[];
  setPeriod: (period: string) => void;
  setYear: (year: number) => void;
  refresh: () => Promise<void>;
  filteredTransactions: Transaction[];
  approvedDuplicates: any[];
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
  const [approvedDuplicates, setApprovedDuplicates] = useState<any[]>([]);

  // O período vem da URL ou padrão 'global'
  // Filtros vindos da URL
  const selectedPeriod = searchParams.get('periodo') || 'global';
  const urlYear = searchParams.get('ano');
  const [currentYear] = useState(new Date().getFullYear());
  const selectedYear = parseInt(urlYear || String(currentYear));

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [data, approved] = await Promise.all([
        transactionService.getAll(user.id),
        approvedDuplicateService.getAll(user.id)
      ]);
      setTransactions(data);
      setApprovedDuplicates(approved);
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
    return getAvailableMonths(transactions, selectedYear);
  }, [transactions, selectedYear]);

  const setPeriod = useCallback((period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (period === 'global') {
      params.delete('periodo');
    } else {
      params.set('periodo', period);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const setYear = useCallback((year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ano', String(year));
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const filteredTransactions = useMemo(() => {
    return filterByPeriodAndYear(transactions, selectedPeriod, selectedYear);
  }, [transactions, selectedPeriod, selectedYear]);

  // Proteção para período selecionado inexistente (Requisito 16, 17 e 19)
  useEffect(() => {
    if (loading) return;
    
    const isInvalidMonth = selectedPeriod !== 'global' && !availableMonths.some(m => m.value === selectedPeriod);
    
    if (isInvalidMonth) {
      setPeriod('global');
    }
  }, [availableMonths, selectedPeriod, loading, setPeriod]);

  // Fallback inteligente para anos com dados (Requisito 5 e 7)
  useEffect(() => {
    if (!loading && transactions.length > 0 && filteredTransactions.length === 0 && !urlYear) {
      const yearsWithData = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);
      if (yearsWithData.length > 0 && yearsWithData[0] !== selectedYear) {
        setYear(yearsWithData[0]);
      }
    }
  }, [loading, transactions, filteredTransactions, urlYear, selectedYear, setYear]);

  const value = {
    transactions,
    loading,
    error,
    selectedPeriod,
    selectedYear,
    availableMonths,
    setPeriod,
    setYear,
    refresh: fetchTransactions,
    filteredTransactions,
    approvedDuplicates
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
