"use client";

import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  Search
} from 'lucide-react';

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
}

import { Icon3D } from '@/core/components/ui/Icon3D';

export function InsightSummaryCards({ stats, loading }: InsightSummaryCardsProps) {
  const cards = [
    { 
      label: 'TOTAL DE INSIGHTS', 
      value: stats.total, 
      desc: 'Análises encontradas',
      icon: Search,
      variant: 'blue' as const,
    },
    { 
      label: 'ALERTAS CRÍTICOS', 
      value: stats.critical, 
      desc: 'Riscos que exigem atenção',
      icon: ShieldAlert,
      variant: 'red' as const,
    },
    { 
      label: 'OPORTUNIDADES', 
      value: stats.opportunities, 
      desc: 'Sugestões de melhoria',
      icon: Lightbulb,
      variant: 'green' as const,
    },
    { 
      label: 'TENDÊNCIAS', 
      value: stats.trends, 
      desc: 'Análise de comportamento',
      icon: TrendingUp,
      variant: 'cyan' as const,
    },
    { 
      label: 'DUPLICIDADES', 
      value: stats.duplicates, 
      desc: 'Lançamentos em conflito',
      icon: AlertTriangle,
      variant: 'orange' as const,
    },
    { 
      label: 'MELHORIAS', 
      value: stats.improvements, 
      desc: 'Otimização financeira',
      icon: Sparkles,
      variant: 'purple' as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        return (
          <div 
            key={i} 
            className="p-3 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 flex items-center gap-3 group"
          >
            <Icon3D icon={card.icon} variant={card.variant} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">{card.value}</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
