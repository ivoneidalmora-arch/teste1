"use client";

import { LucideIcon } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';

type MetricVariant = "green" | "blue" | "red" | "orange" | "purple" | "slate";

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  trend?: number;
  variant?: MetricVariant;
  className?: string;
}

const COLOR_MAP: Record<MetricVariant, { bg: string; text: string; iconBg: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  red: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
  orange: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', iconBg: 'bg-slate-100' }
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "blue",
  className
}: MetricCardProps) {
  const styles = COLOR_MAP[variant];
  const isPositive = trend && trend > 0;
  const formattedValue = typeof value === 'number' ? formatBRL(value) : value;

  return (
    <div className={cn(
      "min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md group",
      className
    )}>
      <div className={cn("mb-5 flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-110", styles.iconBg, styles.text)}>
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950">
        {formattedValue}
      </h3>

      {description && (
        <p className="mt-2 line-clamp-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
          {description}
        </p>
      )}

      {trend !== undefined && (
        <div className={cn(
          "mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
