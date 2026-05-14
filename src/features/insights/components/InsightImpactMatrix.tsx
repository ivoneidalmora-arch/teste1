"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Clock, 
  Target, 
  ShieldAlert,
  Info
} from 'lucide-react';

interface InsightImpactMatrixProps {
  insights: DiagnosticResult[];
  onSelectInsight?: (insight: DiagnosticResult) => void;
}

export function InsightImpactMatrix({ insights, onSelectInsight }: InsightImpactMatrixProps) {
  // Filtrar insights válidos para a matriz
  const validInsights = insights.filter(i => i.hasData);

  const quadrants = [
    { 
      id: 'high-impact-low-effort', 
      title: 'Ganho Rápido', 
      desc: 'Alto Impacto / Baixo Esforço',
      colors: 'bg-emerald-50/30 border-emerald-100',
      text: 'text-emerald-700',
      icon: Zap,
      filter: (i: DiagnosticResult) => (i.impactLevel === 'alto' || i.impactLevel === 'critico') && i.effortLevel === 'baixo'
    },
    { 
      id: 'high-impact-high-effort', 
      title: 'Projetos Estratégicos', 
      desc: 'Alto Impacto / Alto Esforço',
      colors: 'bg-indigo-50/30 border-indigo-100',
      text: 'text-indigo-700',
      icon: Target,
      filter: (i: DiagnosticResult) => (i.impactLevel === 'alto' || i.impactLevel === 'critico') && i.effortLevel === 'alto'
    },
    { 
      id: 'low-impact-low-effort', 
      title: 'Melhorias Incrementais', 
      desc: 'Baixo Impacto / Baixo Esforço',
      colors: 'bg-blue-50/30 border-blue-100',
      text: 'text-blue-700',
      icon: Clock,
      filter: (i: DiagnosticResult) => i.impactLevel === 'baixo' && i.effortLevel === 'baixo'
    },
    { 
      id: 'low-impact-high-effort', 
      title: 'Baixa Prioridade', 
      desc: 'Baixo Impacto / Alto Esforço',
      colors: 'bg-slate-50/30 border-slate-100',
      text: 'text-slate-500',
      icon: Info,
      filter: (i: DiagnosticResult) => i.impactLevel === 'baixo' && i.effortLevel === 'alto'
    },
  ];

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Matriz de Priorização</h2>
          <p className="text-sm text-slate-400 font-medium">Visualize onde focar seus esforços financeiros</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Impacto
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              Esforço
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Matrix Lines */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100" />
           <div className="absolute top-0 left-1/2 w-[1px] h-full bg-slate-100" />
        </div>

        {quadrants.map((q) => {
          const QuadrantIcon = q.icon;
          const items = validInsights.filter(q.filter);

          return (
            <div 
              key={q.id} 
              className={cn(
                "min-h-[240px] p-6 rounded-[2rem] border transition-all flex flex-col group",
                q.colors
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 bg-white rounded-xl shadow-sm border border-inherit", q.text)}>
                    <QuadrantIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={cn("text-[11px] font-black uppercase tracking-widest", q.text)}>{q.title}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{q.desc}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-black px-2 py-0.5 rounded-lg bg-white/50 border border-inherit", q.text)}>
                  {items.length}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[10px] font-medium text-slate-300 italic">Nenhum insight neste quadrante</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectInsight?.(item)}
                      className="w-full text-left p-3 bg-white/60 hover:bg-white rounded-xl border border-white/50 hover:border-inherit transition-all shadow-sm hover:shadow-md group/item"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-700 truncate leading-tight">
                          {item.title}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover/item:text-indigo-500 transition-colors shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
