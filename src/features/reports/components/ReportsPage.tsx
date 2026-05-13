"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ChevronDown,
  Calendar,
  Printer,
  Table as TableIcon,
  RefreshCw,
  PieChart as ChartIcon,
  LayoutDashboard
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { reportPDFService } from '../services/report-pdf.service';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { SeniorFinancialReport } from './SeniorFinancialReport';
import { calculateReportMetrics } from '../utils/reportMetrics';
import { IncomeTransaction, ExpenseTransaction, Transaction } from '@/core/types/finance';
import { useFinanceContext } from '@/features/finance/contexts/FinanceContext';
import { FinancialPeriodFilter } from '@/features/finance/components/filters/FinancialPeriodFilter';
import { FinancialYearFilter } from '@/features/finance/components/filters/FinancialYearFilter';

export function ReportsPage() {
  const { user } = useAuth();
  const { 
    selectedPeriod, 
    selectedYear, 
    filteredTransactions, 
    loading: contextLoading,
    refresh 
  } = useFinanceContext();
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('analytics');

  // Filtro de data manual (opcional, integrado com o mensal)
  const [manualPeriod, setManualPeriod] = useState({
    start: '',
    end: ''
  });

  // Sincroniza manualPeriod com o selecionado no contexto inicialmente ou quando muda
  useEffect(() => {
    if (selectedPeriod === 'global') {
      setManualPeriod({
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`
      });
    } else {
      const monthIdx = parseInt(selectedPeriod) - 1;
      const start = startOfMonth(new Date(selectedYear, monthIdx, 1));
      const end = endOfMonth(new Date(selectedYear, monthIdx, 1));
      setManualPeriod({
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      });
    }
  }, [selectedPeriod, selectedYear]);

  const revenues = useMemo(() => 
    (filteredTransactions as IncomeTransaction[]).filter(t => {
      if (t.type !== 'income') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    }),
    [filteredTransactions, manualPeriod]
  );
  
  const expenses = useMemo(() => 
    (filteredTransactions as ExpenseTransaction[]).filter(t => {
      if (t.type !== 'expense') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    }),
    [filteredTransactions, manualPeriod]
  );

  const filteredRevenues = useMemo(() => revenues.filter(item => {
    const placaMatch = item.placa?.toLowerCase().includes(search.toLowerCase());
    const clientMatch = item.cliente?.toLowerCase().includes(search.toLowerCase());
    const customerMatch = item.customer?.toLowerCase().includes(search.toLowerCase());
    return placaMatch || clientMatch || customerMatch;
  }), [revenues, search]);

  const reportMetrics = useMemo(() => {
    return calculateReportMetrics([...revenues, ...expenses]);
  }, [revenues, expenses]);

  const handleExportPDF = () => {
    const periodStr = selectedPeriod === 'global' 
      ? `Ano Todo - ${selectedYear}`
      : `${format(new Date(manualPeriod.start), 'MMMM', { locale: undefined })} de ${selectedYear}`;
    reportPDFService.generateFinancialReport(filteredRevenues, periodStr);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <IconBadge icon={FileText} variant="purple" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios Financeiros</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestão Avançada e DRE Analítico</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <FinancialYearFilter />
            <FinancialPeriodFilter />
          </div>

          <div className="flex items-center bg-slate-50 px-4 h-12 rounded-2xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400 mr-3" />
            <input 
              type="date" 
              value={manualPeriod.start}
              onChange={(e) => setManualPeriod(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent border-none text-[11px] font-black uppercase text-slate-600 focus:ring-0 p-0 w-28"
            />
            <span className="text-slate-300 px-3 font-bold">→</span>
            <input 
              type="date" 
              value={manualPeriod.end}
              onChange={(e) => setManualPeriod(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent border-none text-[11px] font-black uppercase text-slate-600 focus:ring-0 p-0 w-28"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setViewMode('analytics')}
              className={cn(
                "flex items-center gap-2 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'analytics' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <ChartIcon className="w-3.5 h-3.5" />
              Analítico
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-2 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'list' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Listagem
            </button>
          </div>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-3 px-8 h-12 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <SeniorFinancialReport metrics={reportMetrics} />
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-all" />
              <input 
                type="text" 
                placeholder="Pesquisar por placa ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-3xl text-xs font-bold outline-none focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-6 bg-white px-8 py-3 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Resultado Líquido</span>
                <h3 className={cn(
                  "text-xl font-black",
                  reportMetrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {formatBRL(reportMetrics.netBalance)}
                </h3>
              </div>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Placa</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Serviço</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Bruto</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Dados...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRevenues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <FileText className="w-8 h-8 text-slate-200" />
                           <span className="text-[11px] font-bold text-slate-400 italic">Nenhum dado encontrado no período</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRevenues.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                        <td className="px-8 py-5 text-[11px] font-bold text-slate-500">
                          {format(new Date(item.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-700 uppercase tracking-tight">
                            {item.placa || '---'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase truncate max-w-[240px]">
                          {item.cliente || item.customer || 'AVULSO'}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-purple-50 border border-purple-100/50 rounded-xl text-[9px] font-black text-purple-500 uppercase tracking-tighter">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right text-[11px] font-bold text-slate-400">
                          {formatBRL(item.amountBruto || item.amount)}
                        </td>
                        <td className="px-8 py-5 text-right text-[13px] font-black text-slate-900">
                          {formatBRL(item.amountLiquido || item.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

