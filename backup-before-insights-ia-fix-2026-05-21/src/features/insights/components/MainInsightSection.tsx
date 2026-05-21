"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Heart, 
  Star,
  Target, 
  Clock, 
  Zap, 
  ChevronRight, 
  BarChart2,
  Users,
  Search,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface MainInsightSectionProps {
  insight: DiagnosticResult | null;
  loading?: boolean;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function MainInsightSection({ insight, loading, onAction }: MainInsightSectionProps) {
  if (loading) {
    return <div className="h-full bg-white rounded-xl animate-pulse border border-slate-100 shadow-sm" />;
  }

  if (!insight) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col relative group p-3">
      {/* Selo Destaque */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-10 border border-blue-100">
        <Star className="w-2.5 h-2.5 fill-current" />
        DESTAQUE
      </div>

      <div className="flex gap-4 items-start flex-1 min-h-0">
        <Icon3D icon={Heart} variant="green" size="md" className="shrink-0" />

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate pr-16">{insight.title}</h2>
            <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-snug line-clamp-2">
              {insight.text}
            </p>
          </div>

          {/* Indicadores em Linha Compactos */}
          <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="shrink-0 p-1 bg-blue-50 rounded text-blue-600">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate">IMPACTO</p>
                <p className="text-[11px] font-black text-slate-900 truncate">{insight.mainMetric}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="shrink-0 p-1 bg-orange-50 rounded text-orange-600">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate">PRIORIDADE</p>
                <p className="text-[11px] font-black text-orange-700 truncate uppercase">
                  {insight.priority === 'urgent' ? 'Urgente' : 'Média'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="shrink-0 p-1 bg-emerald-50 rounded text-emerald-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate">ESFORÇO</p>
                <p className="text-[11px] font-black text-emerald-700 truncate uppercase">
                  {insight.effortLevel || 'Baixo'}
                </p>
              </div>
            </div>
          </div>

          {/* Ação Recomendada Super Compacta */}
          <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-2 shrink-0">
            <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-0.5">RECOMENDAÇÃO</p>
              <p className="text-[11px] font-bold text-emerald-900 leading-tight line-clamp-2">
                {insight.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
