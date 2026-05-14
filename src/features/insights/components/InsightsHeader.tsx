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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Diagnósticos Inteligentes</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Visão executiva dos insights financeiros
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <FinancialPeriodFilter />
          </div>

          <button 
            onClick={onRefresh}
            disabled={generating || loading}
            className={cn(
              "flex items-center gap-3 px-6 h-12 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md disabled:opacity-50",
              generating || loading
                ? "bg-slate-900 text-white" 
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
            )}
          >
            {generating || loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
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
