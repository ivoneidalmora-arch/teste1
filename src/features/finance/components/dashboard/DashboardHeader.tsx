"use client";

import { Search, Calendar, Plus, Upload, FileText, ChevronDown, LayoutDashboard } from 'lucide-react';
import { FinancialPeriodFilter } from '../filters/FinancialPeriodFilter';
import { FinancialYearFilter } from '../filters/FinancialYearFilter';

interface Props {
  title: string;
  subtitle?: string;
  onNewTransaction?: () => void;
  onNewExpense?: () => void;
  onImportFile?: () => void;
  onGenerateReport?: () => void;
  onSearch?: (query: string) => void;
}

import { Icon3D } from '@/core/components/ui/Icon3D';

export function DashboardHeader({ 
  title, 
  subtitle,
  onNewTransaction, 
  onNewExpense, 
  onImportFile, 
  onGenerateReport,
  onSearch 
}: Props) {
  
  return (
    <header className="flex flex-row items-center justify-between mb-2 gap-4">
      {/* Título e Subtítulo */}
      <div className="flex items-center gap-3 shrink-0">
        <Icon3D icon={LayoutDashboard} variant="blue" size="xs" />
        <div className="min-w-0">
          <h1 className="text-lg font-black tracking-tight text-[#0F172A] leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-1.5 mt-0">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              {subtitle || 'Visão Geral'}
            </p>
          </div>
        </div>
      </div>

      {/* Busca, Filtros e Ações em Linha Única */}
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        {/* Campo de Pesquisa Compacto */}
        <div className="relative group w-48 xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-8 pl-9 pr-3 bg-white border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtros de Período e Ano Compactos */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
          <FinancialPeriodFilter />
          <FinancialYearFilter />
        </div>

        {/* Botões de Ação Compactos */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={onGenerateReport}
            className="flex items-center gap-1.5 px-3 h-8 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
            title="Gerar Relatório"
          >
            <Icon3D icon={FileText} variant="purple" size="xs" glow={false} />
            <span className="hidden xl:inline">Relatório</span>
          </button>
          
          <button 
            onClick={onImportFile}
            className="flex items-center gap-1.5 px-3 h-8 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
            title="Importar Dados"
          >
            <Icon3D icon={Upload} variant="cyan" size="xs" glow={false} />
            <span className="hidden xl:inline">Importar</span>
          </button>

          <button 
            onClick={onNewExpense}
            className="flex items-center gap-2 px-3 h-8 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 shadow-md"
          >
            <Icon3D icon={Plus} variant="red" size="xs" glow={false} className="bg-white/20 shadow-none scale-75" />
            <span>Despesa</span>
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-2 px-3 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 shadow-md"
          >
            <Icon3D icon={Plus} variant="green" size="xs" glow={false} className="bg-white/20 shadow-none scale-75" />
            <span>Vistoria</span>
          </button>
        </div>
      </div>
    </header>
  );
}

