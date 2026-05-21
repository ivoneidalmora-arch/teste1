"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface ReportKpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconVariant: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'slate' | 'yellow';
  trend?: {
    type: 'positive' | 'negative' | 'neutral' | 'alert';
    label?: string;
  };
  onClick?: () => void;
}

export function ReportKpiCard({
  label,
  value,
  icon: Icon,
  iconVariant,
  trend,
  onClick
}: ReportKpiCardProps) {
  // Mapeamento de variantes de cores para o badge do ícone
  const badgeColors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100/50",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
    red: "bg-rose-50 text-rose-600 border-rose-100/50",
    purple: "bg-purple-50 text-purple-600 border-purple-100/50",
    orange: "bg-orange-50 text-orange-600 border-orange-100/50",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100/50",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
    slate: "bg-slate-50 text-slate-600 border-slate-100/50",
    yellow: "bg-amber-50 text-amber-600 border-amber-100/50"
  };

  // Mapeamento de cores do valor em destaque baseado no trend/status
  const valueColors = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-slate-900",
    alert: "text-amber-600"
  };

  const trendColor = trend ? valueColors[trend.type] : "text-slate-900";
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-xs transition-all",
        isClickable 
          ? "cursor-pointer hover:shadow-md hover:border-purple-200 active:scale-[0.98]" 
          : "hover:shadow-md"
      )}
    >
      {/* Container do Ícone */}
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
        badgeColors[iconVariant] || badgeColors.slate
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Textos */}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate leading-none mb-1.5">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className={cn(
            "text-sm font-extrabold tracking-tight truncate leading-none",
            trendColor
          )}>
            {value}
          </h3>
          {trend?.label && (
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-tighter shrink-0",
              trend.type === 'positive' && "text-emerald-500",
              trend.type === 'negative' && "text-rose-500",
              trend.type === 'alert' && "text-amber-500",
              trend.type === 'neutral' && "text-slate-400"
            )}>
              {trend.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
