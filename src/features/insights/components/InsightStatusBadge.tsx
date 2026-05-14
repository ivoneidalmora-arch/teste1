"use client";

import { InsightStatus } from '../../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Wrench,
  AlertOctagon
} from 'lucide-react';

interface InsightStatusBadgeProps {
  status: InsightStatus;
  className?: string;
}

export function InsightStatusBadge({ status, className }: InsightStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'novo':
        return {
          label: 'Novo',
          icon: Clock,
          classes: 'text-blue-600 bg-blue-50 border-blue-100',
        };
      case 'em_analise':
        return {
          label: 'Em Análise',
          icon: Search,
          classes: 'text-amber-600 bg-amber-50 border-amber-100',
        };
      case 'aprovado':
        return {
          label: 'Aprovado',
          icon: ShieldCheck,
          classes: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        };
      case 'ignorado':
        return {
          label: 'Ignorado',
          icon: XCircle,
          classes: 'text-slate-500 bg-slate-50 border-slate-200',
        };
      case 'resolvido':
      case 'corrigido':
        return {
          label: status === 'resolvido' ? 'Resolvido' : 'Corrigido',
          icon: CheckCircle2,
          classes: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        };
      case 'erro':
        return {
          label: 'Erro',
          icon: AlertOctagon,
          classes: 'text-rose-600 bg-rose-50 border-rose-100',
        };
      default:
        return {
          label: 'Desconhecido',
          icon: Clock,
          classes: 'text-slate-400 bg-slate-50 border-slate-100',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border",
      config.classes,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}
