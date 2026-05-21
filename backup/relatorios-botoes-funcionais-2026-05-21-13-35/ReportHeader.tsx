"use client";

import React from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Table as TableIcon, 
  PieChart as ChartIcon,
  RefreshCw
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { FinancialPeriodFilter } from '@/features/finance/components/filters/FinancialPeriodFilter';
import { FinancialYearFilter } from '@/features/finance/components/filters/FinancialYearFilter';
import { useFinanceContext } from '@/features/finance/contexts/FinanceContext';
import { cn } from '@/core/utils/formatters';

interface ReportHeaderProps {
  manualPeriod: { start: string; end: string };
  setManualPeriod: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  viewMode: 'list' | 'analytics';
  setViewMode: (mode: 'list' | 'analytics') => void;
  onExportPDF: () => void;
  exportLoading?: boolean;
}

export function ReportHeader({
  manualPeriod,
  setManualPeriod,
  viewMode,
  setViewMode,
  onExportPDF,
  exportLoading = false
}: ReportHeaderProps) {
  const { selectedPeriod } = useFinanceContext();

  const formatPeriodStr = () => {
    if (!manualPeriod.start || !manualPeriod.end) return '---';
    const partsStart = manualPeriod.start.split('-');
    const partsEnd = manualPeriod.end.split('-');
    if (partsStart.length < 3 || partsEnd.length < 3) return '---';
    return `${partsStart[2]}/${partsStart[1]}/${partsStart[0]} — ${partsEnd[2]}/${partsEnd[1]}/${partsEnd[0]}`;
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4 relative overflow-hidden">
      {/* Background Glow sutil */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      {/* Título e Ícone */}
      <div className="flex items-center gap-3 relative z-10 shrink-0">
        <IconBadge icon={FileText} variant="purple" size="md" gradient />
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Relatórios Financeiros</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Gestão avançada e DRE analítico</p>
        </div>
      </div>

      {/* Info de Filtro Ativo */}
      <div className="hidden md:flex items-center gap-2 relative z-10 text-[9px] font-black uppercase tracking-wider">
        <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl">
          Modo: {selectedPeriod === 'global' ? 'Global' : 'Mensal'}
        </span>
        <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl">
          Período: {formatPeriodStr()}
        </span>
      </div>
      
      {/* Área de Filtros e Ações */}
      <div className="flex flex-wrap items-center gap-2 relative z-10 w-full xl:w-auto justify-start xl:justify-end">
        {/* Filtros do Dashboard (Ano + Período) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <FinancialYearFilter />
          <FinancialPeriodFilter />
        </div>

        {/* Range de Data Manual Otimizado */}
        <div className="flex items-center bg-slate-50 px-3 h-9 rounded-xl border border-slate-100 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input 
            type="date" 
            value={manualPeriod.start}
            onChange={(e) => setManualPeriod(prev => ({ ...prev, start: e.target.value }))}
            className="bg-transparent border-none text-[10px] font-bold uppercase text-slate-600 focus:ring-0 p-0 w-24 outline-none"
            aria-label="Data Inicial"
          />
          <span className="text-slate-300 px-2 text-[10px] font-bold">→</span>
          <input 
            type="date" 
            value={manualPeriod.end}
            onChange={(e) => setManualPeriod(prev => ({ ...prev, end: e.target.value }))}
            className="bg-transparent border-none text-[10px] font-bold uppercase text-slate-600 focus:ring-0 p-0 w-24 outline-none"
            aria-label="Data Final"
          />
        </div>

        {/* Alternador de Modo (Analítico / Listagem) */}
        <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-100 shrink-0">
          <button 
            onClick={() => setViewMode('analytics')}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
              viewMode === 'analytics' 
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <ChartIcon className="w-3 h-3" />
            Analítico
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
              viewMode === 'list' 
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <TableIcon className="w-3 h-3" />
            Listagem
          </button>
        </div>

        {/* Botão Exportar PDF Compacto */}
        <button 
          onClick={onExportPDF}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 h-9 bg-slate-900 text-white hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-slate-900/5 disabled:opacity-50 shrink-0"
        >
          {exportLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {exportLoading ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  );
}
