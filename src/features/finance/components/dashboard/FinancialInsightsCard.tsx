"use client";

import { useState } from 'react';
import { Sparkles, ChevronRight, AlertCircle, TrendingUp, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useFinancialInsights } from '../../hooks/useFinancialInsights';
import { DuplicateReviewModal } from '../modals/DuplicateReviewModal';

const ICON_MAP = {
  success: TrendingUp,
  warning: ShieldAlert,
  danger: AlertCircle,
  info: Clock
};

const STYLES = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  danger: 'bg-rose-50 text-rose-600 border-rose-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100'
};

export function FinancialInsightsCard() {
  const { insights, duplicateGroups, totalProcessed } = useFinancialInsights();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Insights Inteligentes</h3>
        </div>
        <div className="px-1.5 py-0.5 bg-slate-50 rounded-md text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
          IA ATIVA
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none">
        {insights.map((insight) => {
          const Icon = ICON_MAP[insight.type] || Clock;
          
          return (
            <div 
              key={insight.id} 
              className={cn(
                "group flex items-start gap-3 p-3 rounded-xl border transition-all",
                STYLES[insight.type] || 'bg-slate-50 border-slate-100'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black truncate mb-0.5">{insight.title}</h4>
                <p className="text-[10px] font-bold leading-tight opacity-70 line-clamp-2">{insight.description}</p>
                
                {insight.id === 'duplicates-found' && (
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-amber-600 text-white px-2 py-1 rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Revisar
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-bold">Analisando dados...</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50">
        <div className="bg-[#0F172A] rounded-xl p-3 text-white">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Verificação Automática</span>
          </div>
          <p className="text-[9px] font-bold text-slate-300 leading-normal line-clamp-3">
            {totalProcessed} registros analisados. Detecção de duplicidade por placa e intervalo de 30 dias está ativa. Despesas, receitas e saldo líquido também estão sendo monitorados automaticamente.
          </p>
        </div>
      </div>

      {isReviewModalOpen && (
        <DuplicateReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          duplicateGroups={duplicateGroups}
        />
      )}
    </div>
  );
}
