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

const COLOR_MAP: Record<MetricVariant, { bg: string; text: string; iconBg: string; shadow: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
  red: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
  orange: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-500', shadow: 'shadow-violet-500/20' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', iconBg: 'bg-slate-500', shadow: 'shadow-slate-500/20' }
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
      "min-w-0 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden",
      className
    )}>
      {/* Background Decorativo */}
      <div className={cn("absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rounded-full", styles.bg)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
            styles.iconBg,
            styles.shadow,
            "text-white"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          
          {trend !== undefined && (
            <div className={cn(
              "px-2 py-1 rounded-xl text-[10px] font-black tracking-tighter uppercase border flex items-center gap-1",
              isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 opacity-80">
            {title}
          </p>
          <h3 className="truncate text-2xl font-black tracking-tighter text-[#0F172A] leading-tight">
            {formattedValue}
          </h3>
          {description && (
            <p className="text-[10px] font-bold text-slate-400 truncate mt-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
