"use client";

import { useState, useEffect } from 'react';
import { useReports } from '@/features/reports/hooks/useReports';
import { TransactionTable } from '@/features/reports/components/TransactionTable';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';
import { TrendingDown, Plus } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { Transaction } from '@/core/types/finance';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';

export default function DespesasPage() {
  const { loading, transactions, metrics, refresh, filters } = useReports();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    filters.setFilterType('expense');
  }, [filters]);

  if (!mounted) return null;

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-rose-600 uppercase tracking-wider">Módulo de Despesas</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Gestão de Saídas
          </h1>
          <p className="text-slate-500 mt-1">Controle seus custos operacionais, impostos e manutenções.</p>
        </div>
        
        <button 
          onClick={() => setIsNewExpenseOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Despesas</span>
          <span className="text-3xl font-black text-slate-900">{formatBRL(metrics?.totalExpense || 0)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Lançamentos</span>
          <span className="text-3xl font-black text-slate-900">{expenseTransactions.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Impacto no Lucro</span>
          <span className="text-3xl font-black text-rose-600">-{formatBRL(metrics?.totalExpense || 0)}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <TransactionTable 
          transactions={expenseTransactions}
          onEdit={(t) => setEditingTransaction(t)}
          onRefresh={refresh}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={refresh}
          transaction={editingTransaction}
        />
      )}

      <NovaDespesaModal 
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
