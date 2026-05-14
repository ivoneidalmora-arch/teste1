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
    <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-700 overflow-hidden min-h-0">
      
      {/* 1. Sumário de Indicadores */}
      <InsightSummaryCards stats={stats} loading={loading && !generating} />

      {/* 2. Insight Principal e Ações Recomendadas */}
      <div className="h-[25%] min-h-[180px]">
        <MainInsightSection 
          insight={heroInsight} 
          loading={loading && !generating} 
          onAction={handleAction}
        />
      </div>

      {/* 3. Tabela de Diagnósticos */}
      <div className="flex-1 min-h-0">
        <DiagnosticsTable 
          insights={insights} 
          loading={loading && !generating} 
          onAction={handleAction}
        />
      </div>

      {/* 4. Rodapé do Dashboard: Matriz e Atividade */}
      <div className="h-[25%] grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[150px]">
        <PriorityMatrixCard 
          insights={insights} 
          loading={loading && !generating} 
        />
        <RecentActivityCard 
          insights={insights} 
          loading={loading && !generating} 
        />
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
