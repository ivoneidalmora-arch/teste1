import { useMemo } from 'react';
import { useFinanceContext } from '../contexts/FinanceContext';
import { findDuplicateGroups } from '../utils/duplicate-check';
import { generatePeriodInsights } from '../utils/insights';

export function useFinancialInsights() {
  const { filteredTransactions, transactions: allTransactions, approvedDuplicates, selectedPeriod, loading } = useFinanceContext();

  const data = useMemo(() => {
    if (loading || filteredTransactions.length === 0) {
      return {
        insights: [],
        duplicateGroups: [],
        totalProcessed: 0
      };
    }

    const duplicates = findDuplicateGroups(filteredTransactions, approvedDuplicates);
    const insights = generatePeriodInsights(
      filteredTransactions,
      allTransactions,
      selectedPeriod,
      duplicates
    );

    return {
      insights,
      duplicateGroups: duplicates,
      totalProcessed: filteredTransactions.length
    };
  }, [filteredTransactions, allTransactions, approvedDuplicates, selectedPeriod, loading]);

  return data;
}
