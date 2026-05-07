"use client";

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { insightsMetricsService } from '../services/insights-metrics.service';
import { geminiInsightsService } from '../services/gemini-insights.service';
import { FinancialMetrics, IAInsight } from '../types/insights.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';

export function InsightsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [insights, setInsights] = useState<IAInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const m = await insightsMetricsService.calculateMetrics(user!.id);
      setMetrics(m);
    } finally {
      setLoading(false);
    }
  };

  const generateIAAnalysis = async () => {
    if (!metrics) return;
    setGenerating(true);
    try {
      const data = await geminiInsightsService.generateInsights(metrics);
      setInsights(data);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <IconBadge icon={Sparkles} variant="orange" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Insights IA</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Análise inteligente do seu desempenho financeiro</p>
          </div>
        </div>
        <button 
          onClick={generateIAAnalysis}
          disabled={generating || !metrics}
          className="flex items-center gap-2 px-6 h-12 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Analisando...' : 'Gerar Análise IA'}
        </button>
      </div>

      {/* Métricas Calculadas (Regras Fixas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics && (
          <>
            <MetricBox title="Lucro Líquido" value={formatBRL(metrics.netProfit)} icon={TrendingUp} variant="green" />
            <MetricBox title="Melhor Cliente" value={metrics.topCustomer.name} icon={CheckCircle2} variant="blue" subtitle={formatBRL(metrics.topCustomer.value)} />
            <MetricBox title="Variação Mensal" value={`${metrics.monthlyVariation.toFixed(1)}%`} icon={RefreshCw} variant="purple" />
            <MetricBox title="Duplicidades" value={metrics.duplicatePlates.length.toString()} icon={ShieldAlert} variant="red" subtitle="Placas repetidas" />
          </>
        )}
      </div>

      {/* Insights da IA */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Sugestões e Alertas da IA</h2>
        
        {insights.length === 0 ? (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center">
            <Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">Clique no botão acima para gerar uma análise humanizada dos seus dados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className={cn(
                  "p-6 rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md",
                  insight.severity === 'critical' ? "border-rose-100" : "border-slate-100"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <IconBadge 
                    icon={insight.type === 'alert' ? AlertTriangle : (insight.type === 'summary' ? Lightbulb : CheckCircle2)} 
                    variant={insight.severity === 'critical' ? 'red' : (insight.type === 'alert' ? 'orange' : 'blue')}
                    size="sm"
                  />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{insight.title}</h4>
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({ title, value, icon, variant, subtitle }: { title: string; value: string; icon: any; variant: any; subtitle?: string }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <IconBadge icon={icon} variant={variant} size="sm" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-lg font-black text-slate-900 leading-tight">{value}</h3>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
