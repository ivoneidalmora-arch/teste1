"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Hooks e Contextos
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFinanceContext } from '../../finance/contexts/FinanceContext';

// Server Actions
import { generateDiagnosticsAction } from '../actions/diagnostics.actions';

// Tipos
import { DiagnosticResult, InconsistencyRecord } from '../types/diagnostics.types';
import { PeriodFilter } from '../types/insights.types';

// Componentes
import { InsightsHeader } from './InsightsHeader';
import { InsightsDashboard } from './InsightsDashboard';
import { InsightsErrorBoundary } from './InsightsErrorBoundary';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

// Utilitários
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { standardizeInsights } from '../utils/insight-standardizer';

export function InsightsPage() {
  const { user } = useAuth();
  
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [inconsistencies, setInconsistencies] = useState<InconsistencyRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const financeContext = useFinanceContext();
  
  const selectedPeriod = financeContext?.selectedPeriod || 'global';
  const transactions = financeContext?.transactions || [];
  const refreshFinance = financeContext?.refresh || (() => {});
  
  // Derivar o objeto de filtro a partir do estado do contexto
  const periodFilter: PeriodFilter = useMemo(() => {
    if (!selectedPeriod || selectedPeriod === 'global' || !selectedPeriod.includes('-')) {
      return { type: 'global', label: 'Tudo (Global)' };
    }
    try {
      const [y, m] = selectedPeriod.split('-').map(Number);
      if (isNaN(y) || isNaN(m)) return { type: 'global', label: 'Tudo (Global)' };
      
      const d = new Date(y, m - 1, 1);
      return {
        type: 'month',
        label: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        month: m,
        year: y,
        startDate: format(startOfMonth(d), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(d), 'yyyy-MM-dd')
      };
    } catch (error) {
      return { type: 'global', label: 'Tudo (Global)' };
    }
  }, [selectedPeriod]);

  const loadDiagnostics = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) {
      setGenerating(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    try {
      const res = await generateDiagnosticsAction(periodFilter);
      
      if (res.success && res.data) {
        // Padronizar diagnósticos para o novo layout
        const standardDiagnostics = standardizeInsights(res.data.diagnostics || []);
        
        // Converter inconsistências críticas em insights se necessário
        // (Isso permite que apareçam no grid principal do Dashboard)
        const inconsistencyInsights: DiagnosticResult[] = (res.data.inconsistencies || [])
          .filter((inc: InconsistencyRecord) => inc.severity === 'critical')
          .map((inc: InconsistencyRecord) => ({
            id: `inc-${inc.id}`,
            type: 'inconsistency',
            category: 'duplicidades',
            title: inc.description,
            classification: 'Auditório',
            severity: 'critical',
            priority: 'urgent',
            status: 'novo',
            impactLevel: 'alto',
            effortLevel: 'baixo',
            mainMetric: inc.value > 0 ? `R$ ${inc.value.toFixed(2)}` : 'Erro de Registro',
            text: inc.details,
            recommendation: inc.recommendation,
            actionLabel: 'Corrigir Lançamento',
            actionId: 'open_edit_transaction',
            hasData: true,
            detectedAt: inc.date,
            period: periodFilter.label,
            rawRecord: inc // Guardar para uso posterior
          }));

        setDiagnostics([...standardDiagnostics, ...inconsistencyInsights]);
        setInconsistencies(res.data.inconsistencies || []);
        setSummary(res.data.summary);
      } else {
        throw new Error(res.error || "Erro ao processar diagnósticos");
      }
    } catch (err: any) {
      console.error("Erro ao gerar diagnósticos:", err);
      setError("Não foi possível carregar os diagnósticos. Verifique sua sessão e tente novamente.");
      setDiagnostics([]);
      setInconsistencies([]);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [user?.id, periodFilter]);

  // Recarregar quando o período mudar
  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  const onTransactionEdited = () => {
    setEditingTransaction(null);
    refreshFinance();
    loadDiagnostics(true);
    toast.success('Inconsistência resolvida após edição!');
  };

  return (
    <div className="max-w-[1800px] mx-auto space-y-6 p-4 lg:p-6 animate-in fade-in duration-700 pb-10">
      
      {/* Header Unificado */}
      <InsightsHeader 
        periodFilter={periodFilter}
        onRefresh={() => loadDiagnostics(true)}
        loading={loading}
        generating={generating}
        error={null} // Erro agora é tratado pelo Dashboard
      />

      {/* Dashboard Premium IA */}
      <InsightsDashboard 
        insights={diagnostics}
        summary={summary}
        loading={loading}
        generating={generating}
        error={error}
        onRefresh={() => loadDiagnostics(true)}
        periodFilter={periodFilter}
        onEditTransaction={(transaction) => setEditingTransaction(transaction)}
      />

      {/* Modais de Suporte */}
      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onSuccess={onTransactionEdited}
          existingTransactions={transactions || []}
        />
      )}

    </div>
  );
}
