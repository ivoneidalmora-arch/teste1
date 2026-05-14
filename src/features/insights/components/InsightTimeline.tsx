"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  User,
  ShieldCheck,
  Search,
  Zap
} from 'lucide-react';
import { InsightStatusBadge } from './InsightStatusBadge';

interface InsightTimelineProps {
  insights: DiagnosticResult[];
  onSelectInsight?: (insight: DiagnosticResult) => void;
}

export function InsightTimeline({ insights, onSelectInsight }: InsightTimelineProps) {
  // Ordenar insights por data (detectedAt)
  const sortedInsights = [...insights].sort((a, b) => 
    new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Linha do Tempo</h2>
            <p className="text-sm text-slate-400 font-medium">Histórico de inteligência e ações corretivas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
           <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feed</span>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:via-slate-100 before:to-transparent">
        {sortedInsights.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">Nenhum histórico disponível para este período.</p>
          </div>
        ) : (
          sortedInsights.map((insight, i) => (
            <div key={insight.id} className="relative flex items-start gap-8 group">
              {/* Timeline Indicator */}
              <div className={cn(
                "absolute left-0 mt-1.5 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 z-10",
                insight.status === 'resolvido' || insight.status === 'corrigido' 
                  ? "bg-indigo-600 text-white" 
                  : (insight.status === 'novo' ? "bg-emerald-500 text-white" : "bg-white text-slate-400")
              )}>
                {insight.status === 'resolvido' || insight.status === 'corrigido' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 ml-10 p-5 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-slate-100/50 hover:border-indigo-100 hover:shadow-xl transition-all duration-500">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">
                      {new Date(insight.detectedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <InsightStatusBadge status={insight.status} />
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                     <User className="w-3 h-3" />
                     Sistema AI
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {insight.text}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-4">
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Impacto</p>
                         <p className="text-xs font-bold text-slate-700">{insight.mainMetric}</p>
                      </div>
                      <div className="w-[1px] h-6 bg-slate-100" />
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ação</p>
                         <p className="text-xs font-bold text-indigo-600">
                            {insight.status === 'novo' ? 'Aguardando revisão' : 'Processado pelo usuário'}
                         </p>
                      </div>
                   </div>

                   <button 
                     onClick={() => onSelectInsight?.(insight)}
                     className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-colors"
                   >
                     <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
