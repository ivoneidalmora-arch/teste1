"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  ChevronRight, 
  Receipt, 
  TrendingDown, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { InsightStatusBadge } from './InsightStatusBadge';

interface DiagnosticsTableProps {
  insights: DiagnosticResult[];
  loading?: boolean;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function DiagnosticsTable({ insights, loading, onAction }: DiagnosticsTableProps) {
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'receitas': return <Receipt className="w-4 h-4 text-green-500" />;
      case 'despesas': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'fluxo': return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'clientes': return <Users className="w-4 h-4 text-indigo-500" />;
      case 'servicos': return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'auditoria': return <ShieldAlert className="w-4 h-4 text-orange-500" />;
      case 'duplicidades': return <Search className="w-4 h-4 text-amber-500" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEffortBadge = (effort?: string) => {
    const label = effort?.toUpperCase() || 'MÉDIO';
    const colorClass = effort === 'baixo' ? 'text-green-600 bg-green-50' : effort === 'medio' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
    const dotClass = effort === 'baixo' ? 'bg-green-500' : effort === 'medio' ? 'bg-amber-500' : 'bg-red-500';

    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter", colorClass)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
        {label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded-lg mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900">Diagnósticos Encontrados</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-4 pb-4">Categoria</th>
              <th className="px-4 pb-4">Diagnóstico</th>
              <th className="px-4 pb-4">Impacto</th>
              <th className="px-4 pb-4 text-center">Esforço</th>
              <th className="px-4 pb-4 text-center">Status</th>
              <th className="px-4 pb-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr 
                key={insight.id} 
                className="group hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-4 first:rounded-l-2xl border-y border-transparent group-hover:border-slate-100 first:border-l">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 capitalize">{insight.category || 'Geral'}</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-transparent group-hover:border-slate-100">
                  <span className="text-sm font-black text-slate-900">{insight.title}</span>
                </td>
                <td className="px-4 py-4 border-y border-transparent group-hover:border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{insight.mainMetric}</span>
                </td>
                <td className="px-4 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                  {getEffortBadge(insight.effortLevel)}
                </td>
                <td className="px-4 py-4 border-y border-transparent group-hover:border-slate-100 text-center">
                  <InsightStatusBadge status={insight.status || 'novo'} />
                </td>
                <td className="px-4 py-4 last:rounded-r-2xl border-y border-transparent group-hover:border-slate-100 last:border-r text-right">
                  <button 
                    onClick={() => onAction?.('view_details', insight)}
                    className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors group/btn"
                  >
                    {insight.category === 'duplicidades' ? 'Corrigir' : 'Analisar'}
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
