"use client";

import { DiagnosticPriority } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface InsightPriorityBadgeProps {
  priority: DiagnosticPriority;
  className?: string;
}

export function InsightPriorityBadge({ priority, className }: InsightPriorityBadgeProps) {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Crítico',
          icon: ShieldAlert,
          classes: 'bg-rose-500 text-white shadow-rose-200',
        };
      case 'high':
        return {
          label: 'Alta',
          icon: AlertCircle,
          classes: 'bg-orange-500 text-white shadow-orange-200',
        };
      case 'medium':
        return {
          label: 'Média',
          icon: AlertTriangle,
          classes: 'bg-amber-400 text-white shadow-amber-100',
        };
      case 'low':
      default:
        return {
          label: 'Baixa',
          icon: Info,
          classes: 'bg-slate-500 text-white shadow-slate-100',
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
      config.classes,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}
