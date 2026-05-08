"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { insightsMetricsService } from '../services/insights-metrics.service';
import { geminiInsightsService } from '../services/gemini-insights.service';
import { FinancialMetrics, IAInsight, PeriodFilter } from '../types/insights.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL, cn } from '@/core/utils/formatters';
import { useFinanceContext } from '../../finance/contexts/FinanceContext';
import { FinancialPeriodFilter } from '../../finance/components/filters/FinancialPeriodFilter';
import { useMemo } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { DuplicateAlertsModal } from './DuplicateAlertsModal';

export function InsightsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [insights, setInsights] = useState<IAInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedPeriod } = useFinanceContext();
  
  // Derivar o objeto de filtro a partir do estado do contexto
  const periodFilter: PeriodFilter = useMemo(() => {
    if (selectedPeriod === 'global') {
      return { type: 'global', label: 'Tudo (Global)' };
    }
    const [y, m] = selectedPeriod.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    return {
      type: 'month',
      label: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      month: m,
      year: y,
      startDate: format(startOfMonth(d), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(d), 'yyyy-MM-dd')
    };
  }, [selectedPeriod]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const m = await insightsMetricsService.calculateMetrics(user.id, periodFilter);
      setMetrics(m);
      // Resetar insights ao trocar período para forçar nova geração
      setInsights([]);
    } catch (err: any) {
      console.error("Erro ao carregar métricas:", err);
      setError("Não foi possível carregar os dados financeiros para este período.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, periodFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateIAAnalysis = async () => {
    if (!metrics) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await geminiInsightsService.generateInsights(metrics);
      setInsights(data);
    } catch (err: any) {
      console.error("Erro ao gerar análise:", err);
      setError("Falha ao gerar análise inteligente. Tente novamente em instantes.");
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <RefreshCw className="w-6 h-6 text-blue-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <IconBadge icon={Sparkles} variant="orange" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Insights IA</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              {periodFilter.type === 'global' ? 'Histórico Completo de Performance' : 'Análise de Performance Mensal'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FinancialPeriodFilter />

          <button 
            onClick={generateIAAnalysis}
            disabled={generating || !metrics}
            className={cn(
              "flex items-center gap-3 px-8 h-14 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-xl disabled:opacity-50",
              generating 
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-orange-500 to-orange-700 text-white hover:shadow-orange-200 hover:-translate-y-0.5"
            )}
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Analisando dados...' : 'Gerar Análise IA'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-xs font-bold text-rose-700">{error}</p>
        </div>
      )}

      {/* Grid de Métricas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics ? (
          <>
            <MetricBox 
              title="Lucro Líquido" 
              value={formatBRL(metrics.netProfit)} 
              icon={TrendingUp} 
              variant="green"
              trend={metrics.monthlyVariation}
              subtitle={periodFilter.type === 'global' ? 'Acumulado histórico' : 'Resultado do mês'}
            />
            <MetricBox 
              title="Despesas" 
              value={formatBRL(metrics.totalExpense)} 
              icon={Wallet} 
              variant="red"
              subtitle={periodFilter.type === 'global' ? 'Total histórico' : `${metrics.expensePercentage.toFixed(1)}% da receita`}
              status={metrics.expenseStatus}
            />
            <MetricBox 
              title="Melhor Cliente" 
              value={metrics.topCustomer.name} 
              icon={CheckCircle2} 
              variant="blue" 
              subtitle={periodFilter.type === 'global' ? `Maior histórico: ${formatBRL(metrics.topCustomer.value)}` : `${formatBRL(metrics.topCustomer.value)} (${metrics.topCustomer.count} serviços)`} 
            />
            <MetricBox 
              title="Variação Mensal" 
              value={`${metrics.monthlyVariation > 0 ? '+' : ''}${metrics.monthlyVariation.toFixed(1)}%`} 
              icon={RefreshCw} 
              variant="purple" 
              subtitle={periodFilter.type === 'global' ? 'Último mês vs anterior' : 'Em relação ao mês anterior'}
            />
            <MetricBox 
              title="Duplicidades" 
              value={metrics.duplicateGroups.filter(g => g.status === 'pending_review').length.toString()} 
              icon={ShieldAlert} 
              variant={metrics.duplicateGroups.filter(g => g.status === 'pending_review').length > 0 ? "red" : "slate"} 
              subtitle={periodFilter.type === 'global' ? 'Placas repetidas no histórico' : 'Placas repetidas no mês'} 
              actionLabel="Revisar lançamentos"
              onAction={() => setShowDuplicatesModal(true)}
            />
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
          ))
        )}
      </div>

      {/* Insights da IA / Local Analysis Box */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {periodFilter.type === 'global' ? 'Diagnóstico Financeiro Global' : 'Sugestões e Diagnóstico IA'}
          </h2>
          {insights.length > 0 && (
             <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full">Atualizado</span>
          )}
        </div>
        
        {insights.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center shadow-sm group">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <Lightbulb className={cn("w-10 h-10 transition-colors", generating ? "text-orange-500 animate-pulse" : "text-slate-200")} />
            </div>
            <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">
              {generating ? 'Processando inteligência financeira...' : 'Análise Pendente'}
            </h3>
            <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
              {generating 
                ? 'Estamos analisando receitas, despesas e duplicidades para fornecer um diagnóstico completo do seu negócio.' 
                : `Clique no botão superior para que nossa IA gere uma ${periodFilter.type === 'global' ? 'análise global' : 'análise mensal'} com sugestões estratégicas.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className={cn(
                  "flex flex-col p-8 rounded-[2rem] border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group",
                  insight.severity === 'critical' ? "border-rose-100" : "border-slate-100"
                )}
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 rounded-full transition-opacity group-hover:opacity-20",
                  insight.type === 'alert' ? "bg-orange-500" : (insight.type === 'summary' ? "bg-blue-500" : "bg-emerald-500")
                )} />

                <div className="flex items-center gap-4 mb-6">
                  <IconBadge 
                    icon={insight.type === 'alert' ? AlertTriangle : (insight.type === 'summary' ? Lightbulb : CheckCircle2)} 
                    variant={insight.severity === 'critical' ? 'red' : (insight.type === 'alert' ? 'orange' : (insight.type === 'recommendation' ? 'green' : 'blue'))}
                    size="sm"
                    gradient
                  />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">{insight.title}</h4>
                </div>
                <p className="text-[13px] font-medium text-slate-600 leading-relaxed flex-1">
                  {insight.content}
                </p>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Módulo de IA</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {metrics && user && (
        <DuplicateAlertsModal 
          isOpen={showDuplicatesModal}
          onClose={() => setShowDuplicatesModal(false)}
          groups={metrics.duplicateGroups}
          userId={user.id}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

interface MetricBoxProps {
  title: string;
  value: string;
  icon: any;
  variant: any;
  subtitle?: string;
  trend?: number;
  status?: 'Saudável' | 'Atenção' | 'Crítico';
  actionLabel?: string;
  onAction?: () => void;
}

function MetricBox({ title, value, icon, variant, subtitle, trend, status, actionLabel, onAction }: MetricBoxProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <IconBadge icon={icon} variant={variant} size="sm" gradient />
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black",
            trend > 0 ? "bg-emerald-50 text-emerald-600" : (trend < 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400")
          )}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : (trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null)}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
        {status && (
          <div className={cn(
            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
            status === 'Saudável' ? "bg-emerald-100 text-emerald-700" : 
            status === 'Atenção' ? "bg-orange-100 text-orange-700" : "bg-rose-100 text-rose-700"
          )}>
            {status}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        <h3 className="text-xl font-black text-slate-950 leading-tight group-hover:text-blue-600 transition-colors">{value}</h3>
        {subtitle && <p className="text-[10px] font-bold text-slate-400 leading-tight line-clamp-1">{subtitle}</p>}
      </div>

      {actionLabel && onAction && (
        <button 
          onClick={(e) => { e.stopPropagation(); onAction(); }}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all border border-slate-100 hover:border-slate-200 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
