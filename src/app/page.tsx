"use client";

import { useState } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { NovaVistoriaModal } from '@/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, RefreshCcw, Plus, Minus, Globe, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { format, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/transaction';

import { ClientRanking } from '@/components/reports/ClientRanking';
import { InspectionTypeBalance } from '@/components/dashboard/InspectionTypeBalance';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { metrics, transactions, loading, refresh } = useFinance(selectedDate);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatVar = (val: number) => {
     if (val === 0) return "Mantido";
     return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24">
      
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900 tracking-tight">
            Dashboard Financeiro
          </h1>
          <div className="flex items-center gap-2 text-slate-500 relative group">
            <Calendar className="w-4 h-4" />
            <select 
              value={format(selectedDate, 'yyyy-MM')}
              onChange={(e) => {
                if (!e.target.value) return;
                const [year, month] = e.target.value.split('-');
                setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
              className="appearance-none bg-transparent border-none p-0 pr-6 font-semibold focus:ring-0 cursor-pointer hover:text-slate-700 transition-colors capitalize outline-none"
            >
              {metrics.availableMonths.length === 0 ? (
                <option value="">Sem lançamentos</option>
              ) : (
                metrics.availableMonths.map(m => (
                  <option key={m} value={m}>
                    {format(parseISO(`${m}-01`), 'MMMM yyyy', { locale: ptBR })}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-0 pointer-events-none opacity-50" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDespesaModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl transition-colors"
          >
            <Minus className="w-5 h-5" />
            <span className="hidden sm:inline">Despesa</span>
          </button>
          
          <button 
            onClick={() => setIsVistoriaModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Vistoria</span>
          </button>
 
          <button 
            onClick={refresh}
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors ml-2"
            title="Atualizar Dados"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Seção Balanço Global */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Balanço Global
            </h2>
            <p className="text-5xl font-black text-white tracking-tight leading-none">
              {formatBRL(metrics.totalGlobalBalance)}
            </p>
            <p className="text-slate-400 mt-2 text-sm">Patrimônio líquido acumulado no sistema</p>
          </div>
          
          <div className="hidden md:block h-12 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               Sistema Online & Sincronizado
             </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Análise Mensal: <span className="text-brand-primary capitalize">{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Receitas */}
        <div className="bg-white border-detran rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
            <ArrowUpRight className="w-24 h-24 text-brand-success translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-brand-success">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm">Receitas do Mês</h3>
              <p className="text-2xl font-bold text-slate-800">{formatBRL(metrics.currentIncome)}</p>
            </div>
          </div>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
            metrics.incomeVariation >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}>
            {metrics.incomeVariation >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {formatVar(metrics.incomeVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
          </div>
        </div>

        {/* Card Despesas */}
        <div className="bg-white border-detran rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
            <ArrowDownRight className="w-24 h-24 text-brand-danger translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-brand-danger">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm">Despesas do Mês</h3>
              <p className="text-2xl font-bold text-slate-800">{formatBRL(metrics.currentExpense)}</p>
            </div>
          </div>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
            metrics.expenseVariation <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}>
            {metrics.expenseVariation <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {formatVar(metrics.expenseVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
          </div>
        </div>

        {/* Card Saldo Líquido */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-transparent rounded-2xl p-6 shadow-xl relative overflow-hidden group text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          
          <div className="relative flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-300 font-medium text-sm">Saldo Líquido</h3>
              <p className="text-2xl font-bold text-white tracking-tight">{formatBRL(metrics.currentBalance)}</p>
            </div>
          </div>
          <div className={cn(
            "relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm",
            metrics.currentBalance >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
          )}>
            {metrics.balanceVariation >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {formatVar(metrics.balanceVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
          </div>
        </div>

      </div>

      {/* Seção Estratégica: Ranking e Balanço de Tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <ClientRanking data={metrics.clientRanking} />
        <InspectionTypeBalance data={metrics.inspectionSummary} />
      </div>

      {/* Grid Inferior (Calendário e Atividades) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2">
          <DashboardCalendar currentDate={selectedDate} transactions={metrics.currentMonthTransactions} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity 
            transactions={transactions} 
            onEdit={(t) => setEditingTransaction(t)}
            onRefresh={refresh}
          />
        </div>
      </div>

      <EditTransactionModal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={refresh}
        transaction={editingTransaction}
      />

      <NovaVistoriaModal 
        isOpen={isVistoriaModalOpen} 
        onClose={() => setIsVistoriaModalOpen(false)} 
        onSuccess={refresh}
        existingTransactions={transactions}
        defaultDate={selectedDate}
      />
      
      <NovaDespesaModal 
        isOpen={isDespesaModalOpen} 
        onClose={() => setIsDespesaModalOpen(false)} 
        onSuccess={refresh}
        defaultDate={selectedDate}
      />
    </div>
  );
}
