"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History,
  FileSearch,
  Zap,
  TrendingUp,
  ShieldAlert,
  Search
} from 'lucide-react';
import { InsightStatusBadge } from './InsightStatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const getEventIcon = (category?: string) => {
    switch (category) {
      case 'receitas': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'despesas': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'duplicidades': return <Search className="w-4 h-4 text-orange-500" />;
      case 'tendencias': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default: return <FileSearch className="w-4 h-4 text-purple-500" />;
    }
  };

  const getEventStatusText = (insight: DiagnosticResult) => {
    switch (insight.status) {
      case 'resolvido': return 'Análise concluída';
      case 'ignorado': return 'Ignorado pelo usuário';
      case 'novo': return 'Aguardando revisão';
      case 'aprovado': return 'Sugestão aprovada';
      default: return 'Nova identificação';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 w-40 bg-slate-100 rounded mb-6" />
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-slate-50 rounded" />
                <div className="h-2 w-1/3 bg-slate-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-black text-slate-900">Atividade Recente</h3>
      </div>

      <div className="space-y-6 flex-1">
        {sortedInsights.length > 0 ? (
          sortedInsights.map((insight, idx) => {
            const date = insight.detectedAt ? new Date(insight.detectedAt) : new Date();
            return (
              <div key={insight.id} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                  {getEventIcon(insight.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 truncate">{insight.title}</h4>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{getEventStatusText(insight)}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span>{format(date, 'dd/MM/yyyy')}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span>{format(date, 'HH:mm')}</span>
                  </div>
                  <InsightStatusBadge status={insight.status || 'novo'} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-xs font-medium text-slate-400 italic">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </div>
  );
}
