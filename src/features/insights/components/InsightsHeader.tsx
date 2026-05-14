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

import { Icon3D } from '@/core/components/ui/Icon3D';
import { Brain } from 'lucide-react';

export function InsightsHeader({ periodFilter, onRefresh, loading, generating, error }: InsightsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <Icon3D icon={Brain} variant="ai" size="sm" />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Diagnósticos Inteligentes</h1>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest leading-none">
              Visão executiva dos insights financeiros
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <FinancialPeriodFilter />
          </div>

          <button 
            onClick={onRefresh}
            disabled={generating || loading}
            className={cn(
              "flex items-center gap-2 px-5 h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg disabled:opacity-50",
              generating || loading
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-indigo-200"
            )}
          >
            {generating || loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {generating || loading ? 'Atualizando...' : 'Atualizar'}
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
