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

import { Icon3D } from '@/core/components/ui/Icon3D';

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "blue",
  className
}: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const formattedValue = typeof value === 'number' ? formatBRL(value) : value;

  return (
    <div className={cn(
      "min-w-0 rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-2xl group relative overflow-hidden",
      className
    )}>
      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-5">
          <Icon3D icon={Icon} variant={variant} size="md" />
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {title}
            </p>
            <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold">
              ?
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

