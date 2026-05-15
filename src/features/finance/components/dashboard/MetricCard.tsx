"use client";

import { LucideIcon } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';
import { Icon3D } from '@/core/components/ui/Icon3D';

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
      "min-w-0 rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden h-[75px] flex items-center",
      className
    )}>
      <div className="relative z-10 flex items-center gap-2.5 w-full">
        <Icon3D icon={Icon} variant={variant} size="xs" className="shrink-0" />
        
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 truncate leading-none mb-1">
            {title}
          </p>
          <h3 className="truncate text-base font-black tracking-tight text-slate-900 leading-tight">
            {formattedValue}
          </h3>
          {trend !== undefined && (
            <div className={cn(
              "text-[9px] font-black mt-0.5",
              isPositive ? "text-emerald-500" : "text-rose-500"
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
