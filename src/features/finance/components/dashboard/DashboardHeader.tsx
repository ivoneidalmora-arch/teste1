"use client";

import { Search, Calendar, Plus, Upload, FileText, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onNewTransaction?: () => void;
  onNewExpense?: () => void;
  onImportFile?: () => void;
  onGenerateReport?: () => void;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ 
  title, 
  subtitle,
  selectedDate,
  onDateChange,
  onNewTransaction, 
  onNewExpense, 
  onImportFile, 
  onGenerateReport,
  onSearch 
}: Props) {
  
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      });
    }
    return options;
  }, []);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    onDateChange(new Date(year, month, 1));
  };

  return (
    <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 font-bold uppercase tracking-tight">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {subtitle || 'Visão Geral Corporativa'}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
        {/* Filtros e Busca */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar transações..." 
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={`${selectedDate.getFullYear()}-${selectedDate.getMonth()}`}
              onChange={handleMonthChange}
              className="w-full h-11 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 appearance-none"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="capitalize">{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex w-full flex-wrap gap-2 xl:justify-end">
          <button 
            onClick={onGenerateReport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Relatório
          </button>

          <button 
            onClick={onImportFile}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex-1 sm:flex-none"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            Importar
          </button>
          
          <button 
            onClick={onNewExpense}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            Despesa
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            Vistoria
          </button>
        </div>
      </div>
    </header>
  );
}
