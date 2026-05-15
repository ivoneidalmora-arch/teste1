"use client";

import { Search, BarChart2, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';
import { DiagnosticResult } from '../types/diagnostics.types';

interface RecommendedActionsCardProps {
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
  insight: DiagnosticResult | null;
  loading?: boolean;
}

export function RecommendedActionsCard({ onAction, insight, loading }: RecommendedActionsCardProps) {
  if (loading) {
    return <div className="h-full bg-white rounded-xl border border-slate-100 animate-pulse shadow-sm" />;
  }

  const actions = [
    { label: 'Revisar duplicidades', icon: Search, variant: 'purple' as const, id: 'duplicidades' },
    { label: 'Otimizar despesas', icon: BarChart2, variant: 'blue' as const, id: 'despesas' },
    { label: 'Verificar fluxo projetado', icon: TrendingUp, variant: 'green' as const, id: 'fluxo' },
    { label: 'Analisar clientes principais', icon: Users, variant: 'orange' as const, id: 'clientes' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 h-full flex flex-col overflow-hidden">
      <h3 className="text-sm font-black text-slate-900 mb-2 px-1 tracking-tight">Ações Recomendadas</h3>
      
      <div className="space-y-1 overflow-y-auto flex-1 scrollbar-thin">
        {actions.map((item, i) => (
          <button 
            key={i}
            onClick={() => insight && onAction && onAction(item.id, insight)}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 text-left"
          >
            <Icon3D icon={item.icon} variant={item.variant} size="xs" />
            <span className="flex-1 text-[11px] font-bold text-slate-600 group-hover:text-slate-900 tracking-tight leading-tight">{item.label}</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
