"use client";

import { Search, Calendar, Plus, Upload, FileText, ChevronDown } from 'lucide-react';
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
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
      {/* Título e Subtítulo */}
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-[#0F172A] lg:text-[28px] leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em]">
            {subtitle || 'Visão Geral Corporativa'}
          </p>
        </div>
      </div>

      {/* Busca, Filtros e Ações */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Campo de Pesquisa */}
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtros de Período e Ano */}
        <div className="flex items-center gap-2">
          <FinancialPeriodFilter />
          <FinancialYearFilter />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 h-11 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Relatório</span>
          </button>
          
          <button 
            onClick={onImportFile}
            className="flex items-center gap-2 px-4 h-11 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>

          <button 
            onClick={onNewExpense}
            className="flex items-center gap-2 px-5 h-11 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 transition-all active:scale-95 shadow-md shadow-rose-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Despesa</span>
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-2 px-5 h-11 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all active:scale-95 shadow-md shadow-emerald-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Vistoria</span>
          </button>
        </div>
      </div>
    </header>
  );
}

