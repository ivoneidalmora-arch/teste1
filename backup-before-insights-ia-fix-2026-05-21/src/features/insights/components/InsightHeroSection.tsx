"use client";

import { DiagnosticResult } from '../types/diagnostics.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  Sparkles, 
  ChevronRight, 
  Target, 
  ArrowRight,
  Zap,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { InsightPriorityBadge } from './InsightPriorityBadge';

interface InsightHeroSectionProps {
  insight: DiagnosticResult | null;
  loading?: boolean;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function InsightHeroSection({ insight, loading, onAction }: InsightHeroSectionProps) {
  if (loading) {
    return (
      <div className="w-full h-[320px] bg-slate-100 rounded-[3rem] animate-pulse border border-slate-200" />
    );
  }

  if (!insight) return null;

  return (
    <div className="relative w-full bg-slate-900 rounded-[3rem] overflow-hidden group shadow-2xl shadow-indigo-100/50">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-indigo-500/20 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />
      
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

      <div className="relative z-10 p-10 flex flex-col md:flex-row gap-10 items-center">
        {/* Left Side: Illustration/Icon */}
        <div className="hidden lg:flex w-64 h-64 items-center justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-700" />
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] -rotate-3 group-hover:-rotate-6 transition-transform duration-700" />
           <div className="relative w-full h-full bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-indigo-600 mb-4 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Análise IA</p>
              <p className="text-xs font-bold text-slate-800">Destaque Estratégico</p>
           </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 flex items-center gap-2">
                <Zap className="w-3 h-3 fill-indigo-300" />
                Insight Principal
             </div>
             <InsightPriorityBadge priority={insight.priority} className="!shadow-none !bg-white/10 !text-white border border-white/20" />
             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 ml-auto">
                <Calendar className="w-4 h-4" />
                {insight.period || 'Análise em Tempo Real'}
             </div>
          </div>

          <div className="space-y-4">
             <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
               {insight.title}
             </h2>
             <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
               {insight.text}
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-white/10">
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Target className="w-4 h-4 text-indigo-400" />
                   Impacto Financeiro
                </div>
                <p className="text-2xl font-black text-white">
                   {insight.mainMetric}
                </p>
                {insight.impactValue && (
                   <p className="text-xs text-slate-500 font-bold italic">
                      Equivalente a {formatBRL(insight.impactValue)} no período
                   </p>
                )}
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <AlertCircle className="w-4 h-4 text-emerald-400" />
                   Ação Recomendada
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">
                   {insight.recommendation || 'Analise os detalhes para identificar a melhor ação corretiva.'}
                </p>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <button 
               onClick={() => onAction?.('view_details', insight)}
               className="h-14 px-10 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl"
             >
                Ver Análise Completa
                <ArrowRight className="w-4 h-4" />
             </button>
             
             {insight.actionId && (
               <button 
                 onClick={() => onAction?.(insight.actionId!, insight)}
                 className="h-14 px-8 bg-indigo-600 text-white border border-indigo-500/50 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 {insight.actionLabel || 'Corrigir Agora'}
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
