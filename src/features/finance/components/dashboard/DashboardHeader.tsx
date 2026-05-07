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
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
          {title}
        </h1>
        <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {subtitle || 'Visão Geral Corporativa'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        {/* Busca Compacta */}
        <div className="relative group w-full lg:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Filtro de Período */}
        <FinancialPeriodFilter />

        {/* Grupo de Botões */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onGenerateReport}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            title="Relatório"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button 
            onClick={onImportFile}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            title="Importar"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <button 
            onClick={onNewExpense}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Despesa
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Vistoria
          </button>
        </div>
      </div>
    </header>
  );
}
