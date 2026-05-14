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

export function InsightSummaryCards({ stats, loading }: InsightSummaryCardsProps) {
  const cards = [
    { 
      label: 'TOTAL DE INSIGHTS', 
      value: stats.total, 
      desc: 'Análises encontradas',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    { 
      label: 'ALERTAS CRÍTICOS', 
      value: stats.critical, 
      desc: 'Riscos que exigem atenção',
      icon: ShieldAlert,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100'
    },
    { 
      label: 'OPORTUNIDADES', 
      value: stats.opportunities, 
      desc: 'Sugestões de melhoria',
      icon: Lightbulb,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    { 
      label: 'TENDÊNCIAS', 
      value: stats.trends, 
      desc: 'Análise de comportamento',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    { 
      label: 'DUPLICIDADES', 
      value: stats.duplicates, 
      desc: 'Lançamentos em conflito',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    },
    { 
      label: 'MELHORIAS', 
      value: stats.improvements, 
      desc: 'Otimização financeira',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
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
        const Icon = card.icon;
        return (
          <div 
            key={i} 
            className={cn(
              "p-4 rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
              card.borderColor
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-xl", card.bgColor)}>
                <Icon className={cn("w-4 h-4", card.color)} />
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-tight uppercase">{card.label}</span>
              <span className="ml-auto text-xl font-black text-slate-900 leading-none">{card.value}</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 leading-tight">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
