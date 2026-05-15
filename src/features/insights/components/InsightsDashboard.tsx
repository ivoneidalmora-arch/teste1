"use client";

import { useState, useMemo } from 'react';
import { DiagnosticResult, InsightCategory, InsightStatus } from '../types/diagnostics.types';
import { PeriodFilter } from '../types/insights.types';
import { InsightSummaryCards } from './InsightSummaryCards';
import { InsightDetailsModal } from './InsightDetailsModal';
import { InsightErrorState } from './InsightErrorState';
import { cn } from '@/core/utils/formatters';
import { toast } from 'sonner';
import { updateInsightStatusAction } from '../actions/diagnostics.actions';
import { updateAuditIssueAction } from '../actions/audit.actions';
import { updateDuplicateStatusAction } from '../actions/duplicate.actions';

import { MainInsightSection } from './MainInsightSection';
import { RecommendedActionsCard } from './RecommendedActionsCard';
import { DiagnosticsTable } from './DiagnosticsTable';
import { PriorityMatrixCard } from './PriorityMatrixCard';
import { RecentActivityCard } from './RecentActivityCard';

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
  const [selectedInsight, setSelectedInsight] = useState<DiagnosticResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Insight em destaque (mais urgente ou maior impacto)
  const heroInsight = useMemo(() => {
    if (insights.length === 0) return null;
    return insights.find(i => i.priority === 'urgent') || insights[0];
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
    <div className="flex-1 flex flex-col gap-2 animate-in fade-in duration-700 overflow-hidden min-h-0">
      
      {/* 1. Sumário de Indicadores - Linha Única Ultra Compacta */}
      <div className="shrink-0 h-[60px]">
        <InsightSummaryCards stats={stats} loading={loading && !generating} />
      </div>

      {/* 2. Área Principal - 2 Colunas */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        
        {/* Coluna Esquerda: Insight em Destaque + Tabela de Diagnósticos */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 min-h-0">
          <div className="h-[160px] shrink-0">
            <MainInsightSection 
              insight={heroInsight} 
              loading={loading && !generating} 
              onAction={handleAction}
            />
          </div>
          <div className="flex-1 min-h-0">
            <DiagnosticsTable 
              insights={insights} 
              loading={loading && !generating} 
              onAction={handleAction}
            />
          </div>
        </div>

        {/* Coluna Direita: Ações + Matriz de Prioridade + Atividade */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 min-h-0">
          <div className="h-[140px] shrink-0">
            <RecommendedActionsCard 
              insight={heroInsight}
              onAction={handleAction}
              loading={loading && !generating}
            />
          </div>
          <div className="flex-1 min-h-0">
            <PriorityMatrixCard 
              insights={insights} 
              loading={loading && !generating} 
            />
          </div>
          <div className="h-[120px] shrink-0">
            <RecentActivityCard 
              insights={insights} 
              loading={loading && !generating} 
            />
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
