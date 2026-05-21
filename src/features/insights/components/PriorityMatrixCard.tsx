"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Zap, 
  Target, 
  Star,
  LayoutGrid
} from 'lucide-react';
import { useMemo } from 'react';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface PriorityMatrixCardProps {
  insights: DiagnosticResult[];
  loading?: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function PriorityMatrixCard({ insights, loading, activeFilter, onFilterChange }: PriorityMatrixCardProps) {
  const matrix = useMemo(() => {
    const quadrants = {
      quadrant_quick_wins: {
        id: 'quadrant_quick_wins',
        title: 'GANHO RÁPIDO',
        desc: 'Alto impacto / Baixo esforço',
        icon: Zap,
        variant: 'green' as const,
        activeClass: 'ring-2 ring-emerald-500 bg-emerald-50/5 border-emerald-200',
        items: [] as DiagnosticResult[]
      },
      quadrant_strategic: {
        id: 'quadrant_strategic',
        title: 'PROJETOS ESTRATÉGICOS',
        desc: 'Alto impacto / Alto esforço',
        icon: Target,
        variant: 'purple' as const,
        activeClass: 'ring-2 ring-purple-500 bg-purple-50/5 border-purple-200',
        items: [] as DiagnosticResult[]
      },
      quadrant_incremental: {
        id: 'quadrant_incremental',
        title: 'MELHORIAS INCREMENTAIS',
        desc: 'Baixo impacto / Baixo esforço',
        icon: Star,
        variant: 'blue' as const,
        activeClass: 'ring-2 ring-blue-500 bg-blue-50/5 border-blue-200',
        items: [] as DiagnosticResult[]
      },
      quadrant_low_priority: {
        id: 'quadrant_low_priority',
        title: 'BAIXA PRIORIDADE',
        desc: 'Baixo impacto / Alto esforço',
        icon: LayoutGrid,
        variant: 'slate' as const,
        activeClass: 'ring-2 ring-slate-500 bg-slate-50 border-slate-300',
        items: [] as DiagnosticResult[]
      }
    };

    insights.forEach(insight => {
      const isHighImpact = insight.impactLevel === 'alto' || insight.impactLevel === 'critico';
      const isLowEffort = insight.effortLevel === 'baixo';

      if (isHighImpact && isLowEffort) quadrants.quadrant_quick_wins.items.push(insight);
      else if (isHighImpact && !isLowEffort) quadrants.quadrant_strategic.items.push(insight);
      else if (!isHighImpact && isLowEffort) quadrants.quadrant_incremental.items.push(insight);
      else quadrants.quadrant_low_priority.items.push(insight);
    });

    return quadrants;
  }, [insights]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-[300px] animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm h-full group overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Icon3D icon={LayoutGrid} variant="purple" size="xs" glow={false} />
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Matriz de Priorização</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 overflow-y-auto scrollbar-thin">
        {Object.values(matrix).map((q) => {
          const isActive = activeFilter === q.id;
          return (
            <button 
              key={q.id}
              onClick={() => onFilterChange(isActive ? 'all' : q.id)} // Clicar novamente limpa o filtro
              className={cn(
                "p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-98 hover:shadow-md",
                isActive ? q.activeClass : "hover:bg-white hover:border-slate-300"
              )}
            >
              <Icon3D icon={q.icon} variant={q.variant} size="xs" className="shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-tight truncate",
                    q.variant === 'green' ? "text-emerald-600" :
                    q.variant === 'purple' ? "text-purple-600" :
                    q.variant === 'blue' ? "text-blue-600" : "text-slate-500"
                  )}>
                    {q.title.split(' ')[0]}
                  </span>
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[9px] font-black text-slate-900 shadow-sm shrink-0">
                    {q.items.length}
                  </span>
                </div>
                
                <div className="space-y-0.5 mt-1">
                  {q.items.length > 0 ? (
                    q.items.slice(0, 1).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1 h-1 rounded-full shrink-0",
                          q.variant === 'green' ? "bg-emerald-400" :
                          q.variant === 'purple' ? "bg-purple-400" :
                          q.variant === 'blue' ? "bg-blue-400" : "bg-slate-400"
                        )} />
                        <span className="text-[9px] font-bold text-slate-600 truncate tracking-tight">{item.title}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[8px] font-bold text-slate-300 italic">Vazio</span>
                  )}
                  {q.items.length > 1 && (
                    <span className="text-[8px] font-black text-slate-400 pl-2.5">+{q.items.length - 1}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
