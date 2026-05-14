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
import { MetricsSummaryCards } from './MetricsSummaryCards';
import { DiagnosticPanel, DiagnosticPanelSkeleton } from './diagnostics/DiagnosticPanel';
import { InconsistenciesModal } from './diagnostics/InconsistenciesModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

import { startOfMonth, endOfMonth, format } from 'date-fns';

export function InsightsPage() {
  const { user } = useAuth();
  
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [inconsistencies, setInconsistencies] = useState<InconsistencyRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modais
  const [showInconsistenciesModal, setShowInconsistenciesModal] = useState(false);
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
    } catch (e) {
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
        setDiagnostics(res.data.diagnostics || []);
        setInconsistencies(res.data.inconsistencies || []);
        setSummary(res.data.summary);
      } else {
        throw new Error(res.error || "Erro ao processar diagnósticos");
      }
    } catch (err: any) {
      console.error("Erro ao gerar diagnósticos:", err);
      setError("Não foi possível carregar os dados financeiros para este período. O sistema utilizará diagnósticos locais.");
      // Fallback para arrays vazios para não quebrar a UI
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

  const handleAction = (actionId: string) => {
    if (actionId === 'open_inconsistencies_modal') {
      setShowInconsistenciesModal(true);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    // Garantir que o tipo está presente para o modal de edição
    if (!transaction.type && transaction.amountBruto !== undefined) transaction.type = 'income';
    if (!transaction.type && transaction.dueDate !== undefined) transaction.type = 'expense';
    
    setShowInconsistenciesModal(false);
    setEditingTransaction(transaction);
  };

  const onTransactionEdited = () => {
    setEditingTransaction(null);
    refreshFinance();
    loadDiagnostics(true);
    toast.success('Inconsistência resolvida após edição!');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header Unificado */}
      <InsightsHeader 
        periodFilter={periodFilter}
        onRefresh={() => loadDiagnostics(true)}
        loading={loading}
        generating={generating}
        error={error}
      />

      {/* Resumo Inteligente */}
      {summary && (
        <MetricsSummaryCards 
          metrics={summary} 
          loading={loading && !generating} 
        />
      )}

      {/* Painel de Diagnósticos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Central de Auditoria & Inteligência
          </h2>
          {diagnostics.length > 0 && !loading && !generating && (
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
               <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
               Análise Atualizada
             </span>
          )}
        </div>
        
        {loading && !generating ? (
          <DiagnosticPanelSkeleton />
        ) : (
          <DiagnosticPanel 
            diagnostics={diagnostics} 
            onAction={handleAction}
          />
        )}
      </div>

      {/* Estados Vazios */}
      {!loading && !generating && diagnostics.length === 0 && (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
          <div className="max-w-sm mx-auto space-y-4">
            <p className="text-slate-400 text-sm font-medium">
              Ainda não existem dados suficientes para gerar diagnósticos avançados neste período.
            </p>
            <p className="text-xs text-slate-300">
              Cadastre receitas e despesas para ativar a inteligência financeira.
            </p>
          </div>
        </div>
      )}

      {/* Modais */}
      {user && (
        <InconsistenciesModal 
          isOpen={showInconsistenciesModal}
          onClose={() => setShowInconsistenciesModal(false)}
          records={inconsistencies}
          userId={user.id}
          onRefresh={() => loadDiagnostics(true)}
          onEditTransaction={handleEditTransaction}
        />
      )}

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
