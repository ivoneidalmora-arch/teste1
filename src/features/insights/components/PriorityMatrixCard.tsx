"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  MinusCircle,
  LayoutGrid
} from 'lucide-react';
import { useMemo } from 'react';

interface PriorityMatrixCardProps {
  insights: DiagnosticResult[];
  loading?: boolean;
}

export function PriorityMatrixCard({ insights, loading }: PriorityMatrixCardProps) {
  const quadrants = useMemo(() => {
    const q = {
      quick_wins: [] as DiagnosticResult[],
      strategic: [] as DiagnosticResult[],
      incremental: [] as DiagnosticResult[],
      low_priority: [] as DiagnosticResult[]
    };

    insights.forEach(insight => {
      const isHighImpact = insight.impactLevel === 'alto' || insight.impactLevel === 'critico';
      const isLowEffort = insight.effortLevel === 'baixo';

      if (isHighImpact && isLowEffort) q.quick_wins.push(insight);
      else if (isHighImpact && !isLowEffort) q.strategic.push(insight);
      else if (!isHighImpact && isLowEffort) q.incremental.push(insight);
      else q.low_priority.push(insight);
    });

    return q;
  }, [insights]);

  const matrix = [
    {
      id: 'quick_wins',
      title: 'GANHO RÁPIDO',
      desc: 'Alto impacto / Baixo esforço',
      items: quadrants.quick_wins,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    {
      id: 'strategic',
      title: 'PROJETOS ESTRATÉGICOS',
      desc: 'Alto impacto / Alto esforço',
      items: quadrants.strategic,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      id: 'incremental',
      title: 'MELHORIAS INCREMENTAIS',
      desc: 'Baixo impacto / Baixo esforço',
      items: quadrants.incremental,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      id: 'low_priority',
      title: 'BAIXA PRIORIDADE',
      desc: 'Baixo impacto / Alto esforço',
      items: quadrants.low_priority,
      icon: MinusCircle,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-slate-100 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <LayoutGrid className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-black text-slate-900">Matriz de Priorização</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matrix.map((q) => {
          const Icon = q.icon;
          return (
            <div 
              key={q.id}
              className={cn(
                "p-5 rounded-2xl border transition-all hover:shadow-md relative overflow-hidden group bg-white",
                q.borderColor
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl", q.bgColor)}>
                    <Icon className={cn("w-4 h-4", q.color)} />
                  </div>
                  <div>
                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-1", q.color)}>
                      {q.title}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-400">{q.desc}</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <span className="text-[10px] font-black text-slate-600">{q.items.length}</span>
                </div>
              </div>

              <div className="space-y-1.5 mt-4 min-h-[60px]">
                {q.items.length > 0 ? (
                  q.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={cn("w-1 h-1 rounded-full", q.color.replace('text-', 'bg-'))} />
                      <span className="text-[10px] font-bold text-slate-600 truncate">{item.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-medium text-slate-300 italic">Nenhum diagnóstico</p>
                )}
                {q.items.length > 3 && (
                  <p className="text-[9px] font-black text-slate-400 mt-1">+{q.items.length - 3} outros</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
