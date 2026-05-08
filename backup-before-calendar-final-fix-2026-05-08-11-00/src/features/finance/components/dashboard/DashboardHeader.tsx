"use client";

import { Search, Calendar, Plus, Upload, FileText, ChevronDown } from 'lucide-react';
import { FinancialPeriodFilter } from '../filters/FinancialPeriodFilter';

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
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-xl font-black tracking-tight text-[#0F172A] lg:text-2xl">
          {title}
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {subtitle || 'Visão Geral Corporativa'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {/* Busca e Período Agrupados */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative group flex-1 lg:w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
            />
          </div>
          <FinancialPeriodFilter />
        </div>

        {/* Ações Principais */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={onGenerateReport}
              className="group flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
              title="Gerar Relatório"
            >
              <FileText className="w-4.5 h-4.5" />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Relatório</span>
            </button>
            <div className="w-px h-5 bg-slate-100 mx-1" />
            <button 
              onClick={onImportFile}
              className="group flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Importar Arquivo"
            >
              <Upload className="w-4.5 h-4.5" />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Importar</span>
            </button>
          </div>
          
          <button 
            onClick={onNewExpense}
            className="flex items-center gap-2 px-4 h-11 bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-rose-600/30 hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-rose-600/20"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Despesa</span>
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-2 px-4 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Vistoria</span>
          </button>
        </div>
      </div>
    </header>
  );
}
