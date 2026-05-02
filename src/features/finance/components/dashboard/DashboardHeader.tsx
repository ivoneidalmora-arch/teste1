"use client";

import { Search, Calendar, Plus, Upload, Bell } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  onNewTransaction?: () => void;
  onImportFile?: () => void;
}

export function DashboardHeader({ title, subtitle, onNewTransaction, onImportFile }: Props) {
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
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all w-full sm:w-64 shadow-sm"
          />
        </div>

        {/* Date Selector (Visual Only) */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Maio, 2026</span>
        </button>

        {/* Notification (Mobile Hidden) */}
        <button className="hidden sm:flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-brand-primary hover:bg-slate-50 transition-all shadow-sm relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Primary Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onImportFile}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          
          <button 
            onClick={onNewTransaction}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/25"
          >
            <Plus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
