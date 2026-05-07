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
      "min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md group",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", styles.iconBg, styles.text)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <h3 className="truncate text-lg font-black tracking-tight text-[#0F172A]">
          {formattedValue}
        </h3>

        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            <span>{isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
