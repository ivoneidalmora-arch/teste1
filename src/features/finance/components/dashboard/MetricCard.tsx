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
      "min-w-0 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110", styles.iconBg, styles.text)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tighter uppercase border flex items-center gap-0.5",
            isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
          )}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          {title}
        </p>
        <h3 className="truncate text-xl font-black tracking-tighter text-[#0F172A] leading-tight">
          {formattedValue}
        </h3>
        {description && (
          <p className="text-[9px] font-bold text-slate-400 truncate mt-1">
            {description}
          </p>
        )}
      </div>
      
      {/* Decoração sutil no fundo */}
      <div className={cn("absolute -right-2 -bottom-2 w-12 h-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity", styles.text)}>
        <Icon className="w-full h-full rotate-12" />
      </div>
    </div>
  );
}
