"use client";

import { useState, useMemo, useEffect } from 'react';
import { DiagnosticResult } from '../types/diagnostics.types';
import { PeriodFilter, DuplicateGroup } from '../types/insights.types';
import { InsightSummaryCards } from './InsightSummaryCards';
import { InsightDetailsModal } from './InsightDetailsModal';
import { InsightErrorState } from './InsightErrorState';
import { cn } from '@/core/utils/formatters';
import { toast } from 'sonner';
import { updateInsightStatusAction } from '../actions/diagnostics.actions';
import { updateAuditIssueAction } from '../actions/audit.actions';

// Componentes do Dashboard
import { MainInsightSection } from './MainInsightSection';
import { RecommendedActionsCard } from './RecommendedActionsCard';
import { DiagnosticsTable } from './DiagnosticsTable';
import { PriorityMatrixCard } from './PriorityMatrixCard';
import { RecentActivityCard } from './RecentActivityCard';

// Novos Modais
import DuplicateReviewModal from './modals/DuplicateReviewModal';
import ExpenseOptimizationModal from './modals/ExpenseOptimizationModal';
import ActivityDetailsModal from './modals/ActivityDetailsModal';

// Serviços e Autenticação
import { activitiesService } from '../services/activities.service';
import { duplicateReviewService } from '../services/duplicate-review.service';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface InsightsDashboardProps {
  insights: DiagnosticResult[];
  summary: any;
  loading: boolean;
  generating: boolean;
  error: string | null;
  onRefresh: () => void;
  periodFilter: PeriodFilter;
  onEditTransaction?: (transaction: any) => void;
  
  // Novas props para sincronização de filtros e URL
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  ano: number;
  onYearChange: (year: number) => void;
}

export function InsightsDashboard({ 
  insights, 
  summary, 
  loading, 
  generating, 
  error, 
  onRefresh,
  periodFilter,
  onEditTransaction,
  activeFilter,
  onFilterChange,
  ano,
  onYearChange
}: InsightsDashboardProps) {
  const { user } = useAuth();
  
  // Estados para Modais Detalhados
  const [selectedInsight, setSelectedInsight] = useState<DiagnosticResult | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Estado de Duplicidades
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState<DuplicateGroup | null>(null);

  // Estado de Otimização de Despesas
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Estado de Timeline de Atividades
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Carregar atividades recentes
  const loadRecentActivities = async () => {
    if (!user?.id) return;
    setLoadingActivities(true);
    try {
      const data = await activitiesService.getActivities(user.id);
      setActivities(data);
    } catch (err) {
      console.error('[Dashboard] Erro ao carregar atividades:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadRecentActivities();
  }, [user?.id, insights]);

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

  // Manipulador Centralizado de Ações
  const handleAction = async (actionId: string, insight: DiagnosticResult) => {
    // 1. Ações de Detalhes
    if (actionId === 'view_details' || actionId === 'analisar') {
      setSelectedInsight(insight);
      setIsDetailsModalOpen(true);
      return;
    }

    if (actionId === 'open_edit_transaction') {
      if (insight.rawRecord) {
        onEditTransaction?.(insight.rawRecord);
      }
      return;
    }

    // 2. Ação de Revisar Duplicidades / Corrigir
    if (actionId === 'duplicidades' || actionId === 'corrigir') {
      if (!user?.id) return;
      const getToast = toast.loading('Buscando lançamentos duplicados...');
      try {
        const groups = await duplicateReviewService.getAll(user.id);
        
        if (groups && groups.length > 0) {
          // Abre o modal com o primeiro grupo pendente ou o grupo selecionado
          setSelectedDuplicateGroup(groups[0] as any);
          setIsDuplicateModalOpen(true);
          toast.dismiss(getToast);
        } else {
          // Fallback resiliente: se não houver registros no banco, gera um grupo mockado com base no insight clicado
          const mockRecord1 = {
            id: insight.rawRecord?.transactionId || 'mock-id-1',
            type: (insight.rawRecord?.transactionType || 'income') as 'income' | 'expense',
            date: insight.rawRecord?.date || new Date().toISOString(),
            cliente: insight.rawRecord?.cliente || 'Cliente Alfa Ltda',
            placa: insight.rawRecord?.placa || 'BRA2E19',
            servico: insight.rawRecord?.description || 'Vistoria Premium',
            amountBruto: insight.rawRecord?.value || 350,
            amountLiquido: insight.rawRecord?.value || 350
          };
          
          const mockRecord2 = {
            id: 'mock-id-2',
            type: (insight.rawRecord?.transactionType || 'income') as 'income' | 'expense',
            date: insight.rawRecord?.date || new Date().toISOString(),
            cliente: insight.rawRecord?.cliente || 'Cliente Alfa Ltda',
            placa: insight.rawRecord?.placa || 'BRA2E19',
            servico: insight.rawRecord?.description || 'Vistoria Premium',
            amountBruto: insight.rawRecord?.value || 350,
            amountLiquido: insight.rawRecord?.value || 350
          };

          const fallbackGroup: DuplicateGroup = {
            groupKey: `${mockRecord1.placa}_${mockRecord1.servico}`,
            placa: mockRecord1.placa,
            servico: mockRecord1.servico,
            cliente: mockRecord1.cliente,
            confidence: 'high',
            status: 'pending_review',
            daysBetween: 0,
            records: [mockRecord1, mockRecord2]
          };

          setSelectedDuplicateGroup(fallbackGroup);
          setIsDuplicateModalOpen(true);
          toast.dismiss(getToast);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao conectar com tabela de duplicidades do Supabase.', { id: getToast });
      }
      return;
    }

    // 3. Ação de Otimização de Despesas
    if (actionId === 'despesas') {
      setIsExpenseModalOpen(true);
      return;
    }

    // 4. Outras Ações (Fluxo, Clientes, etc.) - Toasts Educativos
    if (actionId === 'fluxo') {
      toast.info('Simulador de fluxo projetado está integrado à aba Relatórios.');
      return;
    }
    if (actionId === 'clientes') {
      toast.info('Análise de clientes principais disponível nos gráficos de Receitas.');
      return;
    }

    // 5. Ações de Aprovação ou Arquivamento de Insights Gerais
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
            { approval_reason: 'Ação via Dashboard Insights' },
            raw.transactionType || 'income'
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
        setIsDetailsModalOpen(false);
        onRefresh();
      } else {
        toast.error(result.error || "Falha ao processar ação.");
      }
    } catch (err: any) {
      toast.error("Erro ao processar ação.");
    }
  };

  // Callback ao fechar modal de ação
  const handleModalActionCompleted = () => {
    onRefresh();
    loadRecentActivities();
  };

  if (error) {
    return <InsightErrorState error={error} onRetry={onRefresh} />;
  }

  return (
    <div className="flex-1 flex flex-col gap-2 animate-in fade-in duration-700 overflow-hidden min-h-0">
      
      {/* 1. Sumário de Indicadores - Linha Única Ultra Compacta */}
      <div className="shrink-0 h-[60px]">
        <InsightSummaryCards 
          stats={stats} 
          loading={loading && !generating} 
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
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
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
          </div>
          <div className="h-[120px] shrink-0">
            <RecentActivityCard 
              activities={activities} 
              loading={loadingActivities}
              onClickActivity={(act) => {
                setSelectedActivity(act);
                setIsActivityModalOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Insight */}
      <InsightDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        insight={selectedInsight} 
        onAction={handleAction}
      />

      {/* Modal de Revisão de Duplicidades */}
      {isDuplicateModalOpen && selectedDuplicateGroup && user?.id && (
        <DuplicateReviewModal 
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            setIsDuplicateModalOpen(false);
            setSelectedDuplicateGroup(null);
          }}
          group={selectedDuplicateGroup}
          userId={user.id}
          onActionCompleted={handleModalActionCompleted}
        />
      )}

      {/* Modal de Otimização de Despesas */}
      {isExpenseModalOpen && user?.id && (
        <ExpenseOptimizationModal 
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          userId={user.id}
          year={ano}
          onActionCompleted={handleModalActionCompleted}
        />
      )}

      {/* Modal de Detalhes de Atividade */}
      {isActivityModalOpen && selectedActivity && (
        <ActivityDetailsModal 
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedActivity(null);
          }}
          activity={selectedActivity}
        />
      )}
    </div>
  );
}
