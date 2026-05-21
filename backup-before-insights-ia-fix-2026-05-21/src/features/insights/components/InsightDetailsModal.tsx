"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Sparkles, Target, Zap, AlertCircle, CheckCircle2, ShieldAlert, Calendar, BarChart3, TrendingUp, Wallet } from 'lucide-react';
import { DiagnosticResult } from '../types/diagnostics.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { InsightPriorityBadge } from './InsightPriorityBadge';
import { InsightStatusBadge } from './InsightStatusBadge';

interface InsightDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: DiagnosticResult | null;
  onAction?: (actionId: string, insight: DiagnosticResult) => void;
}

export function InsightDetailsModal({ isOpen, onClose, insight, onAction }: InsightDetailsModalProps) {
  if (!insight) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-[3rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                {/* Header background with pattern */}
                <div className="absolute top-0 inset-x-0 h-40 bg-slate-900 overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full -mr-32 -mt-32" />
                </div>

                <div className="relative p-10">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header Content */}
                  <div className="flex items-start gap-6 mb-12">
                     <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 shrink-0">
                        <Sparkles className="w-10 h-10 text-indigo-600" />
                     </div>
                     <div className="pt-2">
                        <div className="flex items-center gap-3 mb-2">
                           <InsightPriorityBadge priority={insight.priority} />
                           <InsightStatusBadge status={insight.status || 'novo'} />
                           <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                               {insight.period || 'Análise do Período'}
                           </span>
                        </div>
                        <Dialog.Title as="h3" className="text-3xl font-black text-white tracking-tight">
                          {insight.title}
                        </Dialog.Title>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Analysis */}
                    <div className="lg:col-span-2 space-y-10">
                      <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-500" />
                          Análise da Inteligência
                        </h4>
                        <p className="text-lg text-slate-700 font-medium leading-relaxed">
                          {insight.text}
                        </p>
                      </section>

                      <section className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Fatores Determinantes
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(insight.factors || ['Comportamento atípico de despesas', 'Variação acima da média histórica', 'Concentração em categoria específica']).map((factor, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                               <div className="w-2 h-2 rounded-full bg-indigo-500" />
                               <span className="text-xs font-bold text-slate-700">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Ação Recomendada
                        </h4>
                        <div className="p-6 bg-emerald-50 text-emerald-800 rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-50">
                           <p className="text-sm font-bold leading-relaxed">
                              {insight.recommendation || 'Analise os lançamentos relacionados para verificar se o crescimento das despesas está alinhado com o aumento da receita ou se há desperdício operacional.'}
                           </p>
                        </div>
                      </section>
                    </div>

                    {/* Right Column: Stats & Matrix */}
                    <div className="space-y-6">
                       <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-xl">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Métrica Principal</p>
                             <p className="text-3xl font-black">{insight.mainMetric}</p>
                             {insight.variation !== undefined && (
                               <p className={cn(
                                 "text-xs font-bold mt-1",
                                 insight.variation > 0 ? "text-emerald-400" : "text-rose-400"
                               )}>
                                 {insight.variation > 0 ? '+' : ''}{insight.variation.toFixed(1)}% em relação ao mês anterior
                               </p>
                             )}
                          </div>

                          <div className="h-[1px] bg-white/10" />

                          <div className="grid grid-cols-1 gap-4">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto Financeiro</p>
                                <div className="flex items-center gap-2">
                                   <Wallet className="w-4 h-4 text-indigo-400" />
                                   <span className="text-sm font-bold">{insight.impactValue ? formatBRL(insight.impactValue) : 'Não mensurado'}</span>
                                </div>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Severidade</p>
                                <div className="flex items-center gap-2">
                                   <ShieldAlert className="w-4 h-4 text-rose-400" />
                                   <span className="text-sm font-bold uppercase">{insight.severity}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-4">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriz de Prioridade</h5>
                          <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Impacto</p>
                                <p className="text-[10px] font-black text-indigo-600 uppercase">{insight.impactLevel || 'médio'}</p>
                             </div>
                             <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Esforço</p>
                                <p className="text-[10px] font-black text-orange-600 uppercase">{insight.effortLevel || 'baixo'}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-end gap-4">
                    <button
                      onClick={() => onAction?.('ignore', insight)}
                      className="px-6 h-12 text-slate-500 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      Ignorar Insight
                    </button>
                    <button
                      onClick={() => onAction?.('approve', insight)}
                      className="px-8 h-12 bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      Aprovar Análise
                    </button>
                    {insight.actionId && (
                      <button
                        onClick={() => onAction?.(insight.actionId!, insight)}
                        className="px-10 h-12 bg-slate-900 text-white hover:bg-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                      >
                        {insight.actionLabel || 'Resolver Agora'}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
