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
    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
      {/* Título e Subtítulo */}
      <div className="flex items-center gap-4">
        <Icon3D icon={LayoutDashboard} variant="blue" size="sm" />
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-[#0F172A] lg:text-2xl leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              {subtitle || 'Visão Geral Corporativa'}
            </p>
          </div>
        </div>
      </div>

      {/* Busca, Filtros e Ações */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Pesquisa */}
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar transação..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-10 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtros de Período e Ano */}
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <FinancialPeriodFilter />
          <FinancialYearFilter />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 h-10 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm group"
          >
            <Icon3D icon={FileText} variant="purple" size="xs" glow={false} />
            <span>Relatório</span>
          </button>
          
          <button 
            onClick={onImportFile}
            className="flex items-center gap-2 px-4 h-10 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm group"
          >
            <Icon3D icon={Upload} variant="cyan" size="xs" glow={false} />
            <span>Importar</span>
          </button>

          <button 
            onClick={onNewExpense}
            className="flex items-center gap-3 px-5 h-10 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-rose-500/30 transition-all active:scale-95 shadow-lg"
          >
            <Icon3D icon={Plus} variant="red" size="xs" glow={false} className="bg-white/20 shadow-none" />
            <span>Despesa</span>
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-3 px-5 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95 shadow-lg"
          >
            <Icon3D icon={Plus} variant="green" size="xs" glow={false} className="bg-white/20 shadow-none" />
            <span>Vistoria</span>
          </button>
        </div>
      </div>
    </header>
  );
}

