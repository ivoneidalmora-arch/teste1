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
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 h-[350px] bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm" />
        <div className="col-span-12 lg:col-span-4 h-[350px] bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. Card Grande: Insight Principal */}
      <div className="col-span-12 lg:col-span-8 h-full overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col relative group">
          {/* Selo Destaque */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest z-10 border border-blue-100">
            <Star className="w-3 h-3 fill-current" />
            INSIGHT PRINCIPAL
          </div>

          <div className="p-6 pt-12 flex flex-col md:flex-row gap-6 items-start flex-1">
            <Icon3D icon={Heart} variant="green" size="lg" className="shrink-0" />

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{insight.title}</h2>
                <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
                  {insight.text}
                </p>
              </div>

              {/* Indicadores em Linha */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <Icon3D icon={BarChart2} variant="blue" size="xs" glow={false} />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IMPACTO FINANCEIRO</p>
                    <p className="text-base font-black text-slate-900">{insight.mainMetric}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Icon3D icon={Target} variant="orange" size="xs" glow={false} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRIORIDADE</p>
                    <div className="mt-1.5 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase">
                      {insight.priority === 'urgent' ? 'URGENTE' : 'MÉDIA'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Icon3D icon={Clock} variant="green" size="xs" glow={false} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ESFORÇO ESTIMADO</p>
                    <div className="mt-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                      {insight.effortLevel?.toUpperCase() || 'BAIXO'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ação Recomendada */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-4">
                <Icon3D icon={Zap} variant="green" size="xs" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5">AÇÃO RECOMENDADA</p>
                  <p className="text-sm font-bold text-emerald-900 leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card: Ações Recomendadas */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 px-2 tracking-tight">Ações Recomendadas</h3>
          
          <div className="space-y-4 flex-1">
            {[
              { label: 'Revisar duplicidades detectadas', icon: Search, variant: 'purple' as const, id: 'duplicidades' },
              { label: 'Otimizar despesas recorrentes', icon: BarChart2, variant: 'blue' as const, id: 'despesas' },
              { label: 'Verificar fluxo de caixa projetado', icon: TrendingUp, variant: 'green' as const, id: 'fluxo' },
              { label: 'Analisar clientes principais', icon: Users, variant: 'orange' as const, id: 'clientes' },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => onAction && onAction(item.id, insight)}
                className="w-full flex items-center gap-5 p-5 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
              >
                <Icon3D icon={item.icon} variant={item.variant} size="sm" />
                <span className="flex-1 text-left text-sm font-bold text-slate-700 group-hover:text-slate-900 tracking-tight">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
