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

const COLOR_MAP: Record<MetricVariant, { iconBg: string; iconColor: string; shadow: string }> = {
  green: { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', shadow: 'shadow-emerald-100' },
  blue: { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', shadow: 'shadow-blue-100' },
  red: { iconBg: 'bg-rose-100', iconColor: 'text-rose-600', shadow: 'shadow-rose-100' },
  orange: { iconBg: 'bg-amber-100', iconColor: 'text-amber-600', shadow: 'shadow-amber-100' },
  purple: { iconBg: 'bg-violet-100', iconColor: 'text-violet-600', shadow: 'shadow-violet-100' },
  slate: { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', shadow: 'shadow-slate-100' }
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
      "min-w-0 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl group relative overflow-hidden",
      className
    )}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110",
            styles.iconBg,
            styles.iconColor
          )}>
            <Icon className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {title}
            </p>
            <div className="w-3.5 h-3.5 rounded-full border border-slate-200 flex items-center justify-center text-[8px] text-slate-400 font-bold">
              i
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="truncate text-[22px] font-black tracking-tight text-[#0F172A] leading-none">
            {formattedValue}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={cn(
                "text-[11px] font-black flex items-center gap-0.5",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}>
                {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(2)}%
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">vs mês anterior</span>
            </div>
          )}

          {!trend && description && (
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

