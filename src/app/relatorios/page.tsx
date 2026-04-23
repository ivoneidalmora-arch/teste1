"use client";

import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { ReportChart } from '@/components/reports/ReportChart';
import { CategorySummary } from '@/components/reports/CategorySummary';
import { ClientRanking } from '@/components/reports/ClientRanking';
import { SeniorFinancialReport } from '@/components/reports/SeniorFinancialReport';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { TransactionTable } from '@/components/reports/TransactionTable';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { emitirRelatorioPDF } from '@/services/pdf';
import { Download, Filter } from 'lucide-react';
import { Transaction, IncomeTransaction } from '@/types/transaction';
import { cn } from '@/utils/cn';
import { formatBRL, formatDisplayDate } from '@/utils/formatters';
import { ImportButton } from '@/components/ImportButton';

export const dynamic = 'force-dynamic';

export default function RelatoriosPage() {
  const { loading, transactions, metrics, filters, refresh } = useReports();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const handleExportPDF = () => {
    emitirRelatorioPDF(transactions, {
      totalIncome: metrics.totalIncome,
      totalExpense: metrics.totalExpense,
      netBalance: metrics.netBalance,
      ticketMedio: metrics.ticketMedio,
      dateRange: (filters.startDate || filters.endDate) 
        ? `${filters.startDate ? formatDisplayDate(filters.startDate) : 'Início'} Até ${filters.endDate ? formatDisplayDate(filters.endDate) : 'Hoje'}`
        : 'Todos os Lançamentos'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in pb-24">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
         <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900 tracking-tight">
            Relatórios e Analytics
          </h1>
          <p className="text-slate-500 mt-1">Busca avançada, gráficos modulares e documentos em PDF.</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportButton onSuccess={refresh} />

          <button 
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      <ReportFilters filters={filters} />

      {/* Grid de Gráficos Superiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReportChart 
            data={
              filters.filterType === 'all' 
                ? [
                    { name: 'Receitas', value: metrics.totalIncome },
                    { name: 'Despesas', value: metrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? metrics.expenseChart : metrics.incomeChart)
            } 
            type={filters.filterType} 
          />
        </div>
        <div className="lg:col-span-1">
          <CategorySummary 
            data={
              filters.filterType === 'all'
                ? [
                    { name: 'Receitas', value: metrics.totalIncome },
                    { name: 'Despesas', value: metrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? metrics.expenseChart : metrics.incomeChart)
            } 
            type={filters.filterType}
            totalValue={
              filters.filterType === 'all' 
                ? (metrics.totalIncome + metrics.totalExpense) 
                : (filters.filterType === 'expense' ? metrics.totalExpense : metrics.totalIncome)
            }
          />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-4">
           {/* Card Balanço Geral do Período */}
           <div className={cn(
             "flex-1 rounded-2xl p-6 border flex flex-col justify-center transition-all duration-500 hover:shadow-md",
             metrics.netBalance >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
           )}>
              <span className={cn(
                "text-xs font-bold mb-2 uppercase tracking-widest",
                metrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                Saldo Líquido no Período
              </span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                {formatBRL(metrics.netBalance)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Receitas: {formatBRL(metrics.totalIncome)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Despesas: {formatBRL(metrics.totalExpense)}</span>
                </div>
                <div className="ml-auto">
                   <span className={cn(
                     "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                     metrics.netBalance >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                   )}>
                     {metrics.netBalance >= 0 ? 'Lucro' : 'Déficit'}
                   </span>
                </div>
              </div>
           </div>
           
           {/* Box Ticket Medio */}
           <div className="h-28 bg-slate-900 border-none rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 pointer-events-none">TM</div>
              <span className="text-sm font-medium text-slate-400">Poder de Venda (Ticket Médio)</span>
              <span className="text-2xl font-bold text-white tracking-tight">{formatBRL(metrics.ticketMedio)}/laudo</span>
           </div>
        </div>
      </div>

      <SeniorFinancialReport metrics={metrics} />

      {/* Grid Inferior: Ranking de Clientes e Outras Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <ClientRanking data={metrics.clientRanking} />
         </div>
         <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <h3 className="text-slate-700 font-bold mb-4 opacity-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Estado da Visualização
            </h3>
            <div className="space-y-4">
               <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Registros Filtrados:</span>
                  <p className="text-2xl font-black text-slate-800">{transactions.length}</p>
               </div>
               <div className="pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Subtotal em Tela:</span>
                  <p className="text-2xl font-black text-brand-primary">
                    {formatBRL(transactions.reduce((acc, t) => acc + (t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount), 0))}
                  </p>
               </div>
            </div>
         </div>
      </div>

      <TransactionTable 
        transactions={transactions}
        onEdit={(t) => setEditingTransaction(t)}
        onRefresh={refresh}
      />

      <EditTransactionModal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={() => {
          refresh();
        }}
        transaction={editingTransaction}
      />
    </div>
  );
}
