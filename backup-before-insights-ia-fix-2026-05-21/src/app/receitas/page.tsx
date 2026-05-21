"use client";

import { useState, useEffect } from 'react';
import { useReports } from '@/features/reports/hooks/useReports';
import { TransactionTable } from '@/features/reports/components/TransactionTable';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';
import { TrendingUp, Plus, Search } from 'lucide-react';
import { formatBRL, cn } from '@/core/utils/formatters';
import { Transaction } from '@/core/types/finance';
import { FinancialPeriodFilter } from '@/features/finance/components/filters/FinancialPeriodFilter';
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';

export default function ReceitasPage() {
  const { loading, transactions, metrics, refresh, filters, allTransactions } = useReports();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isNewVistoriaOpen, setIsNewVistoriaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    filters.setFilterType('income');
  }, [filters]);

  if (!mounted) return null;

  const incomeTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    const description = (('description' in t ? t.description : '') || '').toString();
    const customer = (('customer' in t ? t.customer : ('cliente' in t ? t.cliente : '')) || '').toString();
    const placa = (('placa' in t ? t.placa : '') || '').toString();
    
    return (
      description.toLowerCase().includes(searchLower) ||
      customer.toLowerCase().includes(searchLower) ||
      placa.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-full flex flex-col gap-3 animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Módulo de Receitas</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de Entradas
          </h1>
          <p className="text-slate-500 mt-1">Visualize e gerencie todos os recebimentos e vistorias.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <FinancialPeriodFilter />
          <button 
            onClick={() => setIsNewVistoriaOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Nova Receita
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 shrink-0">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por placa, cliente ou NF..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'paid', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => filters.setFilterStatus(s as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all",
                filters.filterStatus === s 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              {s === 'all' ? 'Todos' : s === 'paid' ? 'Pago' : 'Pendente'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Recebido</span>
          <span className="text-xl font-black text-slate-900">{formatBRL(metrics?.totalIncome || 0)}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vistorias Realizadas</span>
          <span className="text-xl font-black text-slate-900">{incomeTransactions.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ticket Médio</span>
          <span className="text-xl font-black text-emerald-600">{formatBRL(metrics?.ticketMedio || 0)}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <TransactionTable 
            transactions={incomeTransactions}
            onEdit={(t) => setEditingTransaction(t)}
            onRefresh={refresh}
          />
        )}
      </div>

      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={refresh}
          transaction={editingTransaction}
          existingTransactions={transactions}
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
