"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Zap, 
  Target, 
  Star,
  Clock, 
  LayoutGrid
} from 'lucide-react';
import { useMemo } from 'react';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface PriorityMatrixCardProps {
  insights: DiagnosticResult[];
  loading?: boolean;
}

export function PriorityMatrixCard({ insights, loading }: PriorityMatrixCardProps) {
  const matrix = useMemo(() => {
    const quadrants = {
      quick_wins: {
        title: 'GANHO RÁPIDO',
        desc: 'Alto impacto / Baixo esforço',
        icon: Zap,
        variant: 'green' as const,
        items: [] as DiagnosticResult[]
      },
      strategic: {
        title: 'PROJETOS ESTRATÉGICOS',
        desc: 'Alto impacto / Alto esforço',
        icon: Target,
        variant: 'purple' as const,
        items: [] as DiagnosticResult[]
      },
      incremental: {
        title: 'MELHORIAS INCREMENTAIS',
        desc: 'Baixo impacto / Baixo esforço',
        icon: Star,
        variant: 'blue' as const,
        items: [] as DiagnosticResult[]
      },
      low_priority: {
        title: 'BAIXA PRIORIDADE',
        desc: 'Baixo impacto / Alto esforço',
        icon: LayoutGrid,
        variant: 'slate' as const,
        items: [] as DiagnosticResult[]
      }
    };

    insights.forEach(insight => {
      const isHighImpact = insight.impactLevel === 'alto' || insight.impactLevel === 'critico';
      const isLowEffort = insight.effortLevel === 'baixo';

      if (isHighImpact && isLowEffort) quadrants.quick_wins.items.push(insight);
      else if (isHighImpact && !isLowEffort) quadrants.strategic.items.push(insight);
      else if (!isHighImpact && isLowEffort) quadrants.incremental.items.push(insight);
      else quadrants.low_priority.items.push(insight);
    });

    return quadrants;
  }, [insights]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm h-[450px] animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm h-full group">
      <div className="flex items-center gap-4 mb-10">
        <Icon3D icon={LayoutGrid} variant="purple" size="sm" glow={false} />
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Matriz de Priorização</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.values(matrix).map((q, i) => (
          <div 
            key={i}
            className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-start gap-6 transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-1"
          >
            <Icon3D icon={q.icon} variant={q.variant} size="lg" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-widest",
                  q.variant === 'green' ? "text-emerald-600" :
                  q.variant === 'purple' ? "text-purple-600" :
                  q.variant === 'blue' ? "text-blue-600" : "text-slate-500"
                )}>
                  {q.title}
                </span>
                <span className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-900 shadow-sm">
                  {q.items.length}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-5 leading-tight">{q.desc}</p>
              
              <div className="space-y-2">
                {q.items.length > 0 ? (
                  q.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        q.variant === 'green' ? "bg-emerald-400" :
                        q.variant === 'purple' ? "bg-purple-400" :
                        q.variant === 'blue' ? "bg-blue-400" : "bg-slate-400"
                      )} />
                      <span className="text-[11px] font-bold text-slate-600 truncate tracking-tight">{item.title}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[11px] font-bold text-slate-300 italic">Nenhum diagnóstico</span>
                )}
                {q.items.length > 2 && (
                  <span className="text-[10px] font-black text-slate-400 pl-4">+{q.items.length - 2} outros</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
