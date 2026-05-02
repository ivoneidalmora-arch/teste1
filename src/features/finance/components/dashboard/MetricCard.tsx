"use client";

import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { DashboardMetric } from '../../types/dashboard.types';

interface Props {
  metric: DashboardMetric;
  className?: string;
}

const COLOR_MAP = {
  green: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    chart: '#10b981',
    fill: 'rgba(16, 185, 129, 0.1)'
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    chart: '#3b82f6',
    fill: 'rgba(59, 130, 246, 0.1)'
  },
  red: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    chart: '#f43f5e',
    fill: 'rgba(244, 63, 94, 0.1)'
  },
  orange: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    chart: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.1)'
  },
  purple: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    chart: '#8b5cf6',
    fill: 'rgba(139, 92, 246, 0.1)'
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    chart: '#64748b',
    fill: 'rgba(100, 116, 139, 0.1)'
  }
};

export function MetricCard({ metric, className }: Props) {
  const styles = COLOR_MAP[metric.color] || COLOR_MAP.slate;
  const isPositive = metric.trend === 'up';

  // Dados fake para o sparkline se não houver
  const sparkData = (metric.sparkline || [10, 20, 15, 30, 25, 40]).map((val, i) => ({ val }));

  return (
    <div className={cn(
      "bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", styles.bg, styles.text)}>
          <metric.icon className="w-5 h-5" />
        </div>
        
        {metric.change !== 0 && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.title}</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">{metric.formattedValue}</p>
        </div>

        {/* Mini Sparkline */}
        <div className="w-20 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={styles.chart} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={styles.chart} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={styles.chart} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#gradient-${metric.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
