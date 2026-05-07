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
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Insights Inteligentes</h3>
        </div>
        <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
          IA Ativa
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {insights.map((insight) => {
          const Icon = ICON_MAP[insight.type] || Clock;
          
          return (
            <div 
              key={insight.id} 
              className={cn(
                "group flex items-start gap-4 p-4 rounded-2xl border transition-all",
                STYLES[insight.type] || 'bg-slate-50 border-slate-100'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate mb-0.5">{insight.title}</h4>
                <p className="text-xs font-medium leading-relaxed opacity-80">{insight.description}</p>
                
                {insight.id === 'duplicates-found' && (
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Revisar Duplicados
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-sm font-bold">Analisando dados...</p>
            <p className="text-slate-400 text-xs font-semibold max-w-[200px]">
              {totalProcessed > 0 
                ? "Processando métricas do período selecionado." 
                : "Selecione um período com lançamentos para gerar insights."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verificação Automática</span>
          </div>
          <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
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
