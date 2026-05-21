"use client";

import { cn } from '@/core/utils/formatters';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  Search
} from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface InsightSummaryCardsProps {
  stats: {
    total: number;
    critical: number;
    opportunities: number;
    trends: number;
    duplicates: number;
    improvements: number;
  };
  loading?: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function InsightSummaryCards({ stats, loading, activeFilter, onFilterChange }: InsightSummaryCardsProps) {
  const cards = [
    { 
      id: 'all',
      label: 'TOTAL DE INSIGHTS', 
      value: stats.total, 
      desc: 'Análises encontradas',
      icon: Search,
      variant: 'blue' as const,
      activeClass: 'ring-2 ring-blue-500 bg-blue-50/10 border-blue-200'
    },
    { 
      id: 'critical',
      label: 'ALERTAS CRÍTICOS', 
      value: stats.critical, 
      desc: 'Riscos que exigem atenção',
      icon: ShieldAlert,
      variant: 'red' as const,
      activeClass: 'ring-2 ring-red-500 bg-red-50/10 border-red-200'
    },
    { 
      id: 'opportunity',
      label: 'OPORTUNIDADES', 
      value: stats.opportunities, 
      desc: 'Sugestões de melhoria',
      icon: Lightbulb,
      variant: 'green' as const,
      activeClass: 'ring-2 ring-emerald-500 bg-emerald-50/10 border-emerald-200'
    },
    { 
      id: 'trend',
      label: 'TENDÊNCIAS', 
      value: stats.trends, 
      desc: 'Análise de comportamento',
      icon: TrendingUp,
      variant: 'cyan' as const,
      activeClass: 'ring-2 ring-cyan-500 bg-cyan-50/10 border-cyan-200'
    },
    { 
      id: 'duplicates',
      label: 'DUPLICIDADES', 
      value: stats.duplicates, 
      desc: 'Lançamentos em conflito',
      icon: AlertTriangle,
      variant: 'orange' as const,
      activeClass: 'ring-2 ring-amber-500 bg-amber-50/10 border-amber-200'
    },
    { 
      id: 'improvements',
      label: 'MELHORIAS', 
      value: stats.improvements, 
      desc: 'Otimização financeira',
      icon: Sparkles,
      variant: 'purple' as const,
      activeClass: 'ring-2 ring-purple-500 bg-purple-50/10 border-purple-200'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {cards.map((card) => {
        const isActive = activeFilter === card.id;
        return (
          <button 
            key={card.id} 
            onClick={() => onFilterChange(card.id)}
            className={cn(
              "p-2 rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md flex items-center gap-2 group h-[60px] text-left cursor-pointer hover:scale-[1.02] active:scale-98",
              isActive ? card.activeClass : "hover:border-slate-300"
            )}
          >
            <Icon3D icon={card.icon} variant={card.variant} size="xs" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900 leading-none">{card.value}</span>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter truncate mt-1">{card.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
