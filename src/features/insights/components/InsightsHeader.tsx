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
    <div className="mb-2 shrink-0">
      <div className="flex flex-row items-center justify-between gap-2">
        
        <div className="flex items-center gap-3">
          <Icon3D icon={Brain} variant="ai" size="xs" />
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Insights IA</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Diagnósticos Financeiros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-100 shadow-sm">
            <FinancialPeriodFilter />
          </div>

          <button 
            onClick={onRefresh}
            disabled={generating || loading}
            className={cn(
              "flex items-center gap-2 px-4 h-8 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md disabled:opacity-50",
              generating || loading
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-indigo-200"
            )}
          >
            <RefreshCw className={cn("w-3 h-3", (generating || loading) && "animate-spin")} />
            <span>{generating || loading ? '...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 bg-rose-50 border border-rose-100 p-2 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <p className="text-[10px] font-bold text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );
}
