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
      "min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl group relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 flex items-center gap-4">
        <Icon3D icon={Icon} variant={variant} size="sm" />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
              {title}
            </p>
          </div>

          <h3 className="truncate text-lg font-black tracking-tight text-[#0F172A] leading-tight">
            {formattedValue}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "text-[10px] font-black flex items-center gap-0.5",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}>
                {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
              </span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">vs mês ant.</span>
            </div>
          )}

          {!trend && description && (
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

