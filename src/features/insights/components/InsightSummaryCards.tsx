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
      label: 'Total de Insights', 
      value: stats.total, 
      desc: 'Análises totais encontradas',
      icon: Search,
      colors: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      glow: 'shadow-indigo-100'
    },
    { 
      label: 'Alertas Críticos', 
      value: stats.critical, 
      desc: 'Riscos que exigem atenção',
      icon: ShieldAlert,
      colors: 'text-rose-600 bg-rose-50 border-rose-100',
      glow: 'shadow-rose-100'
    },
    { 
      label: 'Oportunidades', 
      value: stats.opportunities, 
      desc: 'Sugestões de melhoria',
      icon: Lightbulb,
      colors: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      glow: 'shadow-emerald-100'
    },
    { 
      label: 'Tendências', 
      value: stats.trends, 
      desc: 'Análise de comportamento',
      icon: TrendingUp,
      colors: 'text-blue-600 bg-blue-50 border-blue-100',
      glow: 'shadow-blue-100'
    },
    { 
      label: 'Duplicidades', 
      value: stats.duplicates, 
      desc: 'Lançamentos em conflito',
      icon: AlertTriangle,
      colors: 'text-orange-600 bg-orange-50 border-orange-100',
      glow: 'shadow-orange-100'
    },
    { 
      label: 'Melhorias', 
      value: stats.improvements, 
      desc: 'Otimização financeira',
      icon: Sparkles,
      colors: 'text-purple-600 bg-purple-50 border-purple-100',
      glow: 'shadow-purple-100'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse border border-slate-200" />
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
              "p-5 rounded-[2rem] border transition-all hover:scale-105 shadow-sm group",
              card.colors,
              card.glow
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/80 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tighter">{card.value}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">{card.label}</p>
              <p className="text-[9px] font-medium opacity-60 leading-tight">{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
