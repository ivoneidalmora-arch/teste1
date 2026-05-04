"use client";

import { ChevronRight, Sparkles, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { FinancialAlert } from '../../types/dashboard.types';
import { cn } from '@/core/utils/formatters';

interface Props {
  alerts: FinancialAlert[];
}

const ICON_STYLES = {
  danger: 'bg-rose-50 text-rose-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-emerald-50 text-emerald-600'
};

export function AlertsInsightsPanel({ alerts }: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Alertas & Insights</h3>
        </div>
        <button className="text-xs font-bold text-brand-primary hover:underline">Ver todos</button>
      </div>

      <div className="space-y-5 flex-1">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", ICON_STYLES[alert.type])}>
              <alert.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{alert.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{alert.time}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{alert.description}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all self-center" />
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-sm font-bold">Tudo em ordem!</p>
            <p className="text-slate-400 text-xs font-semibold max-w-[200px]">Não detectamos anomalias financeiras ou alertas pendentes para este período.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status do Sistema</span>
          </div>
          <p className="text-xs font-bold leading-relaxed">
            Monitoramento em tempo real ativo. Novas transações serão analisadas automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
