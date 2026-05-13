"use client";

import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { FinancialPeriodFilter } from '@/features/finance/components/filters/FinancialPeriodFilter';
import { cn } from '@/core/utils/formatters';
import { PeriodFilter } from '../types/insights.types';

interface InsightsHeaderProps {
  periodFilter: PeriodFilter;
  onRefresh: () => void;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

export function InsightsHeader({ periodFilter, onRefresh, loading, generating, error }: InsightsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <IconBadge icon={Sparkles} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Diagnósticos Inteligentes</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Analisando: {periodFilter.type === 'global' ? 'Histórico Completo' : periodFilter.label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <FinancialPeriodFilter />

          <button 
            onClick={onRefresh}
            disabled={generating || loading}
            className={cn(
              "flex items-center gap-3 px-8 h-14 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg disabled:opacity-50",
              generating || loading
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:shadow-blue-200/50 hover:-translate-y-0.5"
            )}
          >
            {generating || loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating || loading ? 'Atualizando...' : 'Atualizar Diagnóstico'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-xs font-bold text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );
}
