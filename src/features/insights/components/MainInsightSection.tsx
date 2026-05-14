"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  Heart, 
  ChevronRight, 
  Target, 
  Clock, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  BarChart2,
  History,
  Users
} from 'lucide-react';
import { InsightPriorityBadge } from './InsightPriorityBadge';

interface MainInsightSectionProps {
  insight: DiagnosticResult | null;
  loading?: boolean;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function MainInsightSection({ insight, loading, onAction }: MainInsightSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px] bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
        <div className="h-[350px] bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card Insight Principal */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Insight Principal</span>
          </div>
        </div>

        <div className="flex items-start gap-8 mb-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Heart className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{insight.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              {insight.text}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Impacto Financeiro
            </p>
            <p className="text-xl font-black text-slate-900">{insight.mainMetric}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Prioridade
            </p>
            <div className="pt-0.5">
              <InsightPriorityBadge priority={insight.priority} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Esforço Estimado
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                insight.effortLevel === 'baixo' ? "bg-green-500" : insight.effortLevel === 'medio' ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                {insight.effortLevel || 'Médio'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
           <div className="flex items-center gap-2 mb-2 text-green-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ação Recomendada</span>
           </div>
           <p className="text-xs font-medium text-slate-600 leading-relaxed">
             {insight.recommendation || "Mantenha o rigor no controle de custos e estude destinar parte do lucro para a criação de um fundo de reserva estratégico."}
           </p>
        </div>
      </div>

      {/* Card Ações Recomendadas */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6">Ações Recomendadas</h3>
        
        <div className="space-y-3">
          {[
            { label: 'Revisar duplicidades detectadas', icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-50' },
            { label: 'Otimizar despesas recorrentes', icon: BarChart2, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
            { label: 'Verificar fluxo de caixa projetado', icon: History, color: 'text-green-500', bgColor: 'bg-green-50' },
            { label: 'Analisar clientes principais', icon: Users, color: 'text-orange-500', bgColor: 'bg-orange-50' }
          ].map((action, i) => (
            <button 
              key={i}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl", action.bgColor)}>
                  <action.icon className={cn("w-4 h-4", action.color)} />
                </div>
                <span className="text-xs font-bold text-slate-700">{action.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
