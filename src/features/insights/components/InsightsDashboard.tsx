"use client";

import { useState, useMemo } from 'react';
import { DiagnosticResult, InsightCategory, InsightStatus } from '../types/diagnostics.types';
import { PeriodFilter } from '../types/insights.types';
import { InsightSummaryCards } from './InsightSummaryCards';
import { InsightHeroSection } from './InsightHeroSection';
import { InsightCategoryTabs } from './InsightCategoryTabs';
import { InsightCard } from './InsightCard';
import { InsightImpactMatrix } from './InsightImpactMatrix';
import { InsightTimeline } from './InsightTimeline';
import { InsightDetailsModal } from './InsightDetailsModal';
import { EmptyInsightsState } from './EmptyInsightsState';
import { InsightErrorState } from './InsightErrorState';
import { cn } from '@/core/utils/formatters';
import { LayoutGrid, List, BarChart2, History, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { updateInsightStatusAction } from '../actions/diagnostics.actions';
import { updateAuditIssueAction } from '../actions/audit.actions';
import { updateDuplicateStatusAction } from '../actions/duplicate.actions';

interface InsightsDashboardProps {
  insights: DiagnosticResult[];
  summary: any;
  loading: boolean;
  generating: boolean;
  error: string | null;
  onRefresh: () => void;
  periodFilter: PeriodFilter;
  onEditTransaction?: (transaction: any) => void;
}

export function InsightsDashboard({ 
  insights, 
  summary, 
  loading, 
  generating, 
  error, 
  onRefresh,
  periodFilter,
  onEditTransaction
}: InsightsDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<InsightCategory | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInsight, setSelectedInsight] = useState<DiagnosticResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtragem de insights
  const filteredInsights = useMemo(() => {
    let result = insights;
    if (activeCategory !== 'todos') {
      result = result.filter(i => i.category === activeCategory);
    }
    return result;
  }, [insights, activeCategory]);

  // Insight em destaque (mais urgente ou maior impacto)
  const heroInsight = useMemo(() => {
    if (insights.length === 0) return null;
    return insights.find(i => i.priority === 'urgent') || insights[0];
  }, [insights]);

  // Contagens para as abas
  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: insights.length };
    insights.forEach(i => {
      const cat = i.category || 'geral';
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [insights]);

  // Estatísticas de topo
  const stats = useMemo(() => {
    return {
      total: insights.length,
      critical: insights.filter(i => i.priority === 'urgent' || i.severity === 'critical').length,
      opportunities: insights.filter(i => i.type === 'opportunity').length,
      trends: insights.filter(i => i.type === 'trend').length,
      duplicates: insights.filter(i => i.category === 'duplicidades').length,
      improvements: insights.filter(i => i.type === 'growth' || i.type === 'health').length,
    };
  }, [insights]);

  const handleAction = async (actionId: string, insight: DiagnosticResult) => {
    if (actionId === 'view_details') {
      setSelectedInsight(insight);
      setIsModalOpen(true);
      return;
    }

    if (actionId === 'open_edit_transaction') {
      if (insight.rawRecord) {
        onEditTransaction?.(insight.rawRecord);
      }
      return;
    }

    // Ações de status
    try {
      let result: any;
      
      if (insight.type === 'inconsistency') {
        const raw = insight.rawRecord;
        if (raw) {
          result = await updateAuditIssueAction(
            raw.app_user_id || '', 
            raw.transactionId, 
            raw.type, 
            actionId === 'approve' ? 'approved' : 'ignored',
            { approval_reason: 'Ação via Dashboard Insights' }
          );
        }
      } else {
        result = await updateInsightStatusAction(
          insight.id, 
          actionId === 'approve' ? 'aprovado' : 'ignorado'
        );
      }

      if (result.success) {
        toast.success(`Insight ${actionId === 'approve' ? 'aprovado' : 'ignorado'} com sucesso!`);
        setIsModalOpen(false);
        onRefresh();
      } else {
        toast.error(result.error || "Falha ao processar ação.");
      }
    } catch (err: any) {
      toast.error("Erro ao processar ação.");
    }
  };

  if (error) {
    return <InsightErrorState error={error} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Sumário de Indicadores */}
      <InsightSummaryCards stats={stats} loading={loading && !generating} />

      {/* 2. Insight Principal (Hero) */}
      <InsightHeroSection 
        insight={heroInsight} 
        loading={loading && !generating} 
        onAction={handleAction} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Coluna Esquerda: Grid de Insights & Filtros (2/3) */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Exploração de Insights</h2>
                 <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
                 <InsightCategoryTabs 
                   activeCategory={activeCategory} 
                   onCategoryChange={setActiveCategory} 
                   counts={counts} 
                 />
              </div>

              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl self-end md:self-auto">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={cn(
                     "p-2 rounded-lg transition-all",
                     viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                    <LayoutGrid className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => setViewMode('list')}
                   className={cn(
                     "p-2 rounded-lg transition-all",
                     viewMode === 'list' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                    <List className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {loading && !generating ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />
                ))}
             </div>
           ) : filteredInsights.length === 0 ? (
             <EmptyInsightsState />
           ) : (
             <div className={cn(
               "grid gap-6",
               viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
             )}>
                {filteredInsights.map((insight) => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onAction={handleAction} 
                  />
                ))}
             </div>
           )}

           {/* 3. Matriz de Impacto */}
           <div className="pt-10">
              <InsightImpactMatrix insights={insights} onSelectInsight={(i) => handleAction('view_details', i)} />
           </div>
        </div>

        {/* Coluna Direita: Timeline & Ações Recomendadas (1/3) */}
        <div className="space-y-8">
           {/* Timeline */}
           <InsightTimeline insights={insights} onSelectInsight={(i) => handleAction('view_details', i)} />

           {/* Ações Recomendadas Rápidas */}
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                 <Sparkles className="w-20 h-20" />
              </div>
              <h3 className="text-xl font-black mb-2 flex items-center gap-3">
                 Ações Recomendadas
              </h3>
              <p className="text-indigo-100 text-xs font-medium mb-6 leading-relaxed">
                 Otimize seu financeiro com as sugestões automáticas da Alfa IA.
              </p>
              
              <div className="space-y-4">
                 {[
                   { label: 'Revisar duplicidades detectadas', icon: RefreshCw },
                   { label: 'Otimizar despesas recorrentes', icon: BarChart2 },
                   { label: 'Verificar fluxo de caixa projetado', icon: History }
                 ].map((action, i) => (
                   <button 
                     key={i}
                     className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all group/btn"
                   >
                      <div className="flex items-center gap-3">
                         <action.icon className="w-4 h-4 text-indigo-200" />
                         <span className="text-xs font-bold text-white">{action.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                 ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200">
                 <span>Pronto para agir?</span>
                 <button className="text-white hover:underline">Ver todas</button>
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <InsightDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        insight={selectedInsight} 
        onAction={handleAction}
      />
    </div>
  );
}
