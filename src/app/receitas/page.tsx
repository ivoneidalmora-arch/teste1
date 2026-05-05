"use client";

import { useState, useEffect } from 'react';
import { useReports } from '@/features/reports/hooks/useReports';
import { TransactionTable } from '@/features/reports/components/TransactionTable';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';
import { TrendingUp, Plus } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { Transaction } from '@/core/types/finance';
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';

export default function ReceitasPage() {
  const { loading, transactions, metrics, refresh, filters } = useReports();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isNewVistoriaOpen, setIsNewVistoriaOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Forçar filtro de receitas se o hook não o fizer via query param
    filters.setFilterType('income');
  }, [filters]);

  if (!mounted) return null;

  const incomeTransactions = transactions.filter(t => t.type === 'income');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Módulo de Receitas</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Gestão de Entradas
          </h1>
          <p className="text-slate-500 mt-1">Visualize e gerencie todos os recebimentos e vistorias.</p>
        </div>
        
        <button 
          onClick={() => setIsNewVistoriaOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nova Receita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Recebido</span>
          <span className="text-3xl font-black text-slate-900">{formatBRL(metrics?.totalIncome || 0)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Vistorias Realizadas</span>
          <span className="text-3xl font-black text-slate-900">{incomeTransactions.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Ticket Médio</span>
          <span className="text-3xl font-black text-emerald-600">{formatBRL(metrics?.ticketMedio || 0)}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <TransactionTable 
          transactions={incomeTransactions}
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

      <NovaVistoriaModal 
        isOpen={isNewVistoriaOpen}
        onClose={() => setIsNewVistoriaOpen(false)}
        onSuccess={refresh}
        existingTransactions={transactions || []}
      />
    </div>
  );
}
