import React, { useState, useEffect, useCallback } from 'react';
import { X, TrendingDown, ArrowRight, ShieldCheck, PieChart, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { expenseOptimizationService, ExpenseOptimizationPlan } from '../../services/expense-optimization.service';
import { auditService } from '../../services/audit.service';
import { activitiesService } from '../../services/activities.service';
import { formatBRL } from '@/core/utils/formatters';

interface ExpenseOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  year: number;
  onActionCompleted: () => void;
}

export default function ExpenseOptimizationModal({
  isOpen,
  onClose,
  userId,
  year,
  onActionCompleted
}: ExpenseOptimizationModalProps) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<ExpenseOptimizationPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expenseOptimizationService.generatePlan(userId, year);
      setPlan(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar análise de despesas.');
    } finally {
      setLoading(false);
    }
  }, [userId, year]);

  useEffect(() => {
    if (isOpen) {
      loadPlan();
    }
  }, [isOpen, loadPlan]);

  if (!isOpen) return null;

  const handleApprovePlan = async () => {
    if (!plan) return;
    setIsSubmitting(true);
    const approveToast = toast.loading('Registrando aprovação do plano...');

    try {
      await auditService.log(userId, {
        action: 'APPROVE_EXPENSE_OPTIMIZATION_PLAN',
        entityType: 'expense_optimization',
        newData: {
          year,
          potentialSaving: plan.potentialTotalSaving,
          totalExpenseValue: plan.totalExpenseValue
        }
      });

      await activitiesService.register(userId, {
        type: 'success',
        title: 'Plano de Redução de Gastos Aprovado',
        description: `Simulação de economia potencial de ${formatBRL(plan.potentialTotalSaving)} para o ano de ${year} foi aprovada.`,
        category: 'financial'
      });

      toast.success('Plano de otimização de despesas aprovado!', { id: approveToast });
      onActionCompleted();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao aprovar: ${error.message || 'Erro desconhecido'}`, { id: approveToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="h-full w-full max-w-4xl bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans">Otimização Inteligente de Despesas</h2>
              <p className="text-xs text-slate-400">Análise de centro de custo e oportunidades de economia para {year}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-sm text-slate-400 font-medium">Analisando lançamentos financeiros com IA...</p>
            </div>
          ) : plan ? (
            <>
              {/* Resumo de Impacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">Total de Despesas ({year})</span>
                  <div className="text-2xl font-bold text-white font-mono">{formatBRL(plan.totalExpenseValue)}</div>
                  <span className="text-[10px] text-slate-500 block mt-1">Lançamentos ativos no banco</span>
                </div>
                <div className="bg-slate-950 border border-indigo-500/20 p-5 rounded-2xl shadow-lg shadow-indigo-500/2">
                  <span className="text-xs text-indigo-400 font-semibold block mb-1">Economia Anual Potencial</span>
                  <div className="text-2xl font-bold text-indigo-400 font-mono">~ {formatBRL(plan.potentialTotalSaving)}</div>
                  <span className="text-[10px] text-indigo-500/80 block mt-1">Redução sugerida de aprox. 14%</span>
                </div>
                <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-2xl shadow-lg shadow-emerald-500/2">
                  <span className="text-xs text-emerald-400 font-semibold block mb-1">Margem de Lucro Projetada</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">+ {formatBRL(plan.potentialTotalSaving)}</div>
                  <span className="text-[10px] text-emerald-500/80 block mt-1">Impacto direto no fluxo de caixa</span>
                </div>
              </div>

              {/* Categorias Críticas com Maior Gasto */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distribuição por Categoria & Oportunidades</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plan.criticalCategories.map((cat, i) => (
                    <div key={i} className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{cat.category}</span>
                        <span className="text-slate-400 font-mono">{formatBRL(cat.totalValue)} ({cat.percentage.toFixed(1)}%)</span>
                      </div>
                      {/* Barra de progresso */}
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Meta de Otimização:</span>
                        <span className="text-emerald-400 font-semibold font-mono">Economizar ~{formatBRL(cat.savingOpportunity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabela de Itens e Recomendações Individuais */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sugestões de Redução nos Lançamentos</h3>
                </div>

                <div className="space-y-3">
                  {plan.items.map((item) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{item.description}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.recommendation}</p>
                      </div>

                      <div className="flex items-center md:flex-col md:items-end justify-between border-t border-slate-900 md:border-t-0 pt-2 md:pt-0">
                        <div className="text-xs text-slate-500">Gasto: <span className="font-mono text-slate-300 font-semibold">{formatBRL(item.value)}</span></div>
                        <div className="text-xs text-emerald-400 font-semibold mt-0.5">Economia: <span className="font-mono">~{formatBRL(item.potentialSaving)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">Não foi possível processar o plano de otimização.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-between bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-sm"
            disabled={isSubmitting}
          >
            Fechar
          </button>
          
          <button
            onClick={handleApprovePlan}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-650 hover:bg-emerald-500 text-white rounded-lg transition-all font-semibold shadow-lg shadow-emerald-600/10 text-sm"
            disabled={isSubmitting || !plan}
          >
            <ShieldCheck className="h-4 w-4" /> Aprovar Plano de Otimização
          </button>
        </div>
      </div>
    </div>
  );
}
