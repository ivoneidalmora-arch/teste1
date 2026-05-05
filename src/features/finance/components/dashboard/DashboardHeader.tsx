"use client";

import { Search, Calendar, Plus, Upload, Bell, FileText } from 'lucide-react';

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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      {/* Title & Context */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-500">{subtitle}</span>
          </div>
        )}
      </div>

      {/* Actions & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar transações..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all w-full sm:w-64 shadow-sm"
          />
        </div>

        {/* Date Selector (Visual Only) */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="capitalize">{new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
        </button>

        {/* Notification (Mobile Hidden) */}
        <button className="hidden sm:flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-primary hover:bg-slate-50 transition-all shadow-sm relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onGenerateReport}
            className="hidden lg:flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Relatório
          </button>

          <button 
            onClick={onImportFile}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          
          <button 
            onClick={onNewExpense}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Despesa</span>
          </button>

          <button 
            onClick={onNewTransaction}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Vistoria</span>
          </button>
        </div>
      </div>
    </header>
  );
}
