"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History,
  AlertTriangle,
  Sparkles,
  Search,
  FileSearch,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';
import { format } from 'date-fns';

interface RecentActivityCardProps {
  insights: DiagnosticResult[];
  loading?: boolean;
}

export function RecentActivityCard({ insights, loading }: RecentActivityCardProps) {
  const sortedInsights = [...insights]
    .sort((a, b) => {
      const dateA = a.detectedAt ? new Date(a.detectedAt).getTime() : 0;
      const dateB = b.detectedAt ? new Date(b.detectedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getEventIcon = (insight: DiagnosticResult) => {
    if (insight.status === 'aprovado') return { icon: CheckCircle2, variant: 'green' as const };
    if (insight.status === 'novo') return { icon: AlertTriangle, variant: 'orange' as const };
    if (insight.status === 'em_analise') return { icon: Sparkles, variant: 'purple' as const };
    if (insight.severity === 'critical') return { icon: AlertCircle, variant: 'red' as const };
    
    switch (insight.category) {
      case 'receitas': return { icon: TrendingUp, variant: 'green' as const };
      case 'despesas': return { icon: ShieldAlert, variant: 'red' as const };
      case 'duplicidades': return { icon: Search, variant: 'orange' as const };
      default: return { icon: FileSearch, variant: 'blue' as const };
    }
  };

  const getEventStatusText = (insight: DiagnosticResult) => {
    switch (insight.status) {
      case 'aprovado': return 'Análise concluída';
      case 'novo': return 'Aguardando revisão';
      case 'em_analise': return 'Correção sugerida';
      default: return 'Nova identificação';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm flex flex-col h-full group overflow-hidden">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Icon3D icon={History} variant="blue" size="xs" glow={false} />
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Atividade</h3>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {sortedInsights.length > 0 ? (
          sortedInsights.map((insight, idx) => {
            const date = insight.detectedAt ? new Date(insight.detectedAt) : new Date();
            const config = getEventIcon(insight);
            return (
              <div key={insight.id} className="flex items-center gap-2 group/item py-0.5">
                <Icon3D icon={config.icon} variant={config.variant} size="xs" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-slate-900 truncate tracking-tight group-hover/item:text-blue-600 transition-colors leading-tight">
                    {insight.title}
                  </h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {getEventStatusText(insight)}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 tracking-tighter">
                    <span>{format(date, 'dd/MM')}</span>
                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                    <span>{format(date, 'HH:mm')}</span>
                  </div>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border",
                    insight.status === 'aprovado' ? "bg-blue-50 text-blue-600 border-blue-100" :
                    insight.status === 'novo' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-purple-50 text-purple-600 border-purple-100"
                  )}>
                    {insight.status}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-widest">Sem atividades</p>
          </div>
        )}
      </div>
    </div>
  );
}
