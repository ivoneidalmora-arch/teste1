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
      "min-w-0 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden h-[92px] flex items-center",
      className
    )}>
      <div className="relative z-10 flex items-center gap-3 w-full">
        <Icon3D icon={Icon} variant={variant} size="xs" className="shrink-0" />
        
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate leading-none mb-1">
            {title}
          </p>

          <h3 className="truncate text-base font-black tracking-tight text-[#0F172A] leading-tight">
            {formattedValue}
          </h3>
          
          {(trend !== undefined || description) && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {trend !== undefined ? (
                <>
                  <span className={cn(
                    "text-[10px] font-black flex items-center gap-0.5",
                    isPositive ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">mês ant.</span>
                </>
              ) : (
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest truncate">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
