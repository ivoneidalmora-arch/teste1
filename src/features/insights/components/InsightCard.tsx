"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  HeartPulse, 
  TrendingUp, 
  Wallet, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { InsightPriorityBadge } from './InsightPriorityBadge';
import { InsightStatusBadge } from './InsightStatusBadge';

interface InsightCardProps {
  insight: DiagnosticResult;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
  className?: string;
}

export function InsightCard({ insight, onAction, className }: InsightCardProps) {
  
  // Mapeamento de ícones por tipo de insight
  const getIcon = () => {
    switch (insight.type) {
      case 'health': return HeartPulse;
      case 'growth': return TrendingUp;
      case 'expense': return Wallet;
      case 'client': return Users;
      case 'service': return Briefcase;
      case 'risk': return ShieldAlert;
      case 'inconsistency': return Search;
      case 'trend': return BarChart3;
      case 'opportunity': return Lightbulb;
      default: return Sparkles;
    }
  };

  const getCategoryColors = () => {
    switch (insight.category) {
      case 'receitas': return { text: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50/50', iconVariant: 'green' };
      case 'despesas': return { text: 'text-rose-700', border: 'border-rose-100', bg: 'bg-rose-50/50', iconVariant: 'red' };
      case 'duplicidades': return { text: 'text-orange-700', border: 'border-orange-100', bg: 'bg-orange-50/50', iconVariant: 'orange' };
      case 'tendencias': return { text: 'text-indigo-700', border: 'border-indigo-100', bg: 'bg-indigo-50/50', iconVariant: 'indigo' };
      case 'auditoria': return { text: 'text-blue-700', border: 'border-blue-100', bg: 'bg-blue-50/50', iconVariant: 'blue' };
      case 'fluxo': return { text: 'text-cyan-700', border: 'border-cyan-100', bg: 'bg-cyan-50/50', iconVariant: 'cyan' };
      default: return { text: 'text-slate-700', border: 'border-slate-100', bg: 'bg-slate-50/50', iconVariant: 'slate' };
    }
  };

  const catColors = getCategoryColors();
  const Icon = getIcon();

  return (
    <div className={cn(
      "group relative bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden",
      insight.priority === 'urgent' && "border-rose-200 ring-1 ring-rose-50",
      className
    )}>
      {/* Glow Effect for High Priority */}
      {insight.priority === 'urgent' && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />
      )}

      {/* Header Area */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconBadge 
            icon={Icon} 
            variant={catColors.iconVariant as any} 
            size="md" 
            gradient 
            className="shadow-sm group-hover:scale-110 transition-transform duration-500" 
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-black uppercase tracking-[0.15em]", catColors.text)}>
                {insight.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Calendar className="w-3 h-3" />
                {insight.period || 'Período Atual'}
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
              {insight.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Metric Area */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Detectado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tighter">
              {insight.mainMetric}
            </span>
            {insight.variation !== undefined && (
              <div className={cn(
                "flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm border",
                insight.variation > 0 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : (insight.variation < 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-100")
              )}>
                {insight.variation > 0 ? <ArrowUpRight className="w-3 h-3" /> : (insight.variation < 0 ? <ArrowDownRight className="w-3 h-3" /> : null)}
                {Math.abs(insight.variation).toFixed(1)}%
              </div>
            )}
          </div>
          {insight.impactValue && (
            <p className="text-xs font-bold text-slate-500 mt-1">
              Impacto financeiro estimado: <span className="text-slate-900">{formatBRL(insight.impactValue)}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <InsightPriorityBadge priority={insight.priority} />
           <InsightStatusBadge status={insight.status} />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 flex-grow">
        <p className="text-sm font-medium text-slate-600 leading-relaxed">
          {insight.text}
        </p>
      </div>

      {/* Matrix Preview (Impact x Effort) */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Impacto</p>
            <p className={cn(
              "text-[10px] font-black uppercase",
              insight.impactLevel === 'critico' ? "text-rose-600" : (insight.impactLevel === 'alto' ? "text-orange-600" : "text-blue-600")
            )}>
              {insight.impactLevel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Esforço</p>
            <p className={cn(
              "text-[10px] font-black uppercase",
              insight.effortLevel === 'alto' ? "text-rose-600" : (insight.effortLevel === 'medio' ? "text-orange-600" : "text-emerald-600")
            )}>
              {insight.effortLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={() => onAction?.('view_details', insight)}
          className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
        >
          Analisar Detalhes
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {insight.actionId && (
          <button 
            onClick={() => onAction?.(insight.actionId!, insight)}
            className={cn(
              "h-12 px-6 flex items-center justify-center gap-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all border",
              insight.priority === 'urgent' 
                ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" 
                : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
            )}
          >
            {insight.actionLabel || 'Corrigir'}
          </button>
        )}
      </div>
    </div>
  );
}
