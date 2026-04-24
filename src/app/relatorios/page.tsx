"use client";

import { useState, useEffect } from 'react';

// Hooks & Services
import { useReports } from '@/features/reports/hooks/useReports';
import { pdfService } from '@/features/reports/services/pdf.service';

// Feature Components
import { ReportChart } from '@/features/reports/components/ReportChart';
import { CategorySummary } from '@/features/reports/components/CategorySummary';
import { ClientRanking } from '@/features/reports/components/ClientRanking';
import { SeniorFinancialReport } from '@/features/reports/components/SeniorFinancialReport';
import { ReportFilters } from '@/features/reports/components/ReportFilters';
import { TransactionTable } from '@/features/reports/components/TransactionTable';
import { ImportButton } from '@/features/ai-ocr/components/ImportButton';

// Modals
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

// Shared / Core
import { Download, Filter } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { Transaction } from '@/core/types/finance';

export const dynamic = 'force-dynamic';

export default function RelatoriosPage() {
  const { loading, transactions, metrics, filters, refresh } = useReports();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const safeMetrics = metrics || {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    ticketMedio: 0,
    incomeChart: [],
    expenseChart: [],
    clientRanking: [],
    validIncomesCount: 0
  };

  const handleExportPDF = () => {
    pdfService.exportToPDF(transactions, {
      totalIncome: safeMetrics.totalIncome,
      totalExpense: safeMetrics.totalExpense,
      netBalance: safeMetrics.netBalance,
      ticketMedio: safeMetrics.ticketMedio,
      dateRange: (filters.startDate || filters.endDate) 
        ? `${filters.startDate ? formatDisplayDate(filters.startDate) : 'Início'} Até ${filters.endDate ? formatDisplayDate(filters.endDate) : 'Hoje'}`
        : 'Todos os Lançamentos'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700 pb-24">
      
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ReportChart 
            data={
              filters.filterType === 'all' 
                ? [
                    { name: 'Receitas', value: safeMetrics.totalIncome },
                    { name: 'Despesas', value: safeMetrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? safeMetrics.expenseChart : safeMetrics.incomeChart)
            } 
            type={filters.filterType} 
          />
        </div>
        <div className="lg:col-span-1">
          <CategorySummary 
            data={
              filters.filterType === 'all'
                ? [
                    { name: 'Receitas', value: safeMetrics.totalIncome },
                    { name: 'Despesas', value: safeMetrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? safeMetrics.expenseChart : safeMetrics.incomeChart)
            } 
            type={filters.filterType}
            totalValue={
              filters.filterType === 'all' 
                ? (safeMetrics.totalIncome + safeMetrics.totalExpense) 
                : (filters.filterType === 'expense' ? safeMetrics.totalExpense : safeMetrics.totalIncome)
            }
          />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-4">
           {/* Card Balanço Geral do Período */}
           <div className={cn(
             "flex-1 rounded-2xl p-6 border flex flex-col justify-center transition-all duration-500 hover:shadow-md",
             safeMetrics.netBalance >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
           )}>
              <span className={cn(
                "text-xs font-bold mb-2 uppercase tracking-widest",
                safeMetrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                Saldo Líquido no Período
              </span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                {formatBRL(safeMetrics.netBalance)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Receitas: {formatBRL(safeMetrics.totalIncome)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Despesas: {formatBRL(safeMetrics.totalExpense)}</span>
                </div>
              </div>
           </div>
           
           <div className="h-28 bg-slate-900 border-none rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center text-white">
              <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 pointer-events-none">TM</div>
              <span className="text-sm font-medium text-slate-400">Poder de Venda (Ticket Médio)</span>
              <span className="text-2xl font-bold text-white tracking-tight">{formatBRL(safeMetrics.ticketMedio)}/laudo</span>
           </div>
        </div>
      </div>

      <SeniorFinancialReport metrics={safeMetrics as any} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <ClientRanking data={safeMetrics.clientRanking || []} />
         </div>
         <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-8 flex flex-col justify-center shadow-sm">
            <h3 className="text-slate-700 font-bold mb-4 opacity-50 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Filter className="w-4 h-4" />
              Estado da Visualização
            </h3>
            <div className="space-y-6">
               <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Registros Filtrados:</span>
                  <p className="text-2xl font-black text-slate-800">{transactions.length}</p>
               </div>
               <div className="pt-6 border-t border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Subtotal em Tela:</span>
                  <p className="text-2xl font-black text-brand-primary">
                    {formatBRL(safeMetrics.totalIncome)}
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

      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={refresh}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}
