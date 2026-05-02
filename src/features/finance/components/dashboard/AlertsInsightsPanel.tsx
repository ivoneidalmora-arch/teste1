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
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-50">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-sm font-bold text-slate-400">Nenhum alerta crítico</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Insight da IA</span>
          </div>
          <p className="text-xs font-bold leading-relaxed">
            Seu custo fixo subiu 5% este mês. Reduzir gastos com software pode economizar R$ 1.200,00/mês.
          </p>
        </div>
      </div>
    </div>
  );
}
