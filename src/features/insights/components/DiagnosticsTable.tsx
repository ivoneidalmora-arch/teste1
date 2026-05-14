"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  ChevronRight, 
  Receipt, 
  TrendingUp, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Search,
  TrendingDown
} from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface DiagnosticsTableProps {
  insights: DiagnosticResult[];
  loading?: boolean;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function DiagnosticsTable({ insights, loading, onAction }: DiagnosticsTableProps) {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'receitas': return { icon: TrendingUp, variant: 'green' as const };
      case 'despesas': return { icon: Receipt, variant: 'red' as const };
      case 'duplicidades': return { icon: Search, variant: 'orange' as const };
      case 'auditoria': return { icon: ShieldAlert, variant: 'blue' as const };
      case 'relatorios': return { icon: Users, variant: 'purple' as const };
      default: return { icon: Briefcase, variant: 'slate' as const };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm h-96 animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Diagnósticos Encontrados</h3>
        <span className="px-5 py-2 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
          {insights.length} itens detectados
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Esforço</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {insights.map((insight) => {
              const cat = getCategoryIcon(insight.category);
              return (
                <tr key={insight.id} className="hover:bg-slate-50/50 transition-colors group/row">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <Icon3D icon={cat.icon} variant={cat.variant} size="xs" glow={false} />
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{insight.category || 'Geral'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-slate-700 tracking-tight">{insight.title}</span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-base font-black text-slate-900">{insight.mainMetric}</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      insight.effortLevel === 'baixo' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      insight.effortLevel === 'medio' ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        insight.effortLevel === 'baixo' ? "bg-emerald-500" :
                        insight.effortLevel === 'medio' ? "bg-orange-500" : "bg-rose-500"
                      )} />
                      {insight.effortLevel || 'MÉDIO'}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className={cn(
                      "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      insight.status === 'revisado' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      insight.status === 'pendente' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {insight.status}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => onAction && onAction(insight.category === 'duplicidades' ? 'corrigir' : 'analisar', insight)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {insight.category === 'duplicidades' ? 'Corrigir' : 'Analisar'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
