"use client";

import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';

interface MetricsSummaryCardsProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    inconsistenciesCount: number;
    riskLevel: string;
    riskSeverity: 'baixo' | 'medio' | 'alto' | 'critico';
  };
  loading?: boolean;
}

export function MetricsSummaryCards({ metrics, loading }: MetricsSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Saldo Atual',
      value: formatBRL(metrics.netBalance),
      icon: Wallet,
      color: metrics.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: metrics.netBalance >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    },
    {
      title: 'Receita Líquida',
      value: formatBRL(metrics.totalIncome),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Despesas Pagas',
      value: formatBRL(metrics.totalExpense),
      icon: TrendingDown,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Nível de Risco',
      value: metrics.riskLevel,
      icon: metrics.riskSeverity === 'critico' || metrics.riskSeverity === 'alto' ? AlertCircle : CheckCircle2,
      color: cn(
        metrics.riskSeverity === 'critico' && 'text-rose-600',
        metrics.riskSeverity === 'alto' && 'text-orange-600',
        metrics.riskSeverity === 'medio' && 'text-amber-600',
        metrics.riskSeverity === 'baixo' && 'text-emerald-600'
      ),
      bg: cn(
        metrics.riskSeverity === 'critico' && 'bg-rose-50',
        metrics.riskSeverity === 'alto' && 'bg-orange-50',
        metrics.riskSeverity === 'medio' && 'bg-amber-50',
        metrics.riskSeverity === 'baixo' && 'bg-emerald-50'
      ),
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", card.bg)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
              <h3 className={cn("text-lg font-black mt-0.5", card.color)}>{card.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
