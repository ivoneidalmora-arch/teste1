"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/core/utils/formatters';
import { useFinanceContext } from '../../finance/contexts/FinanceContext';
import { FinancialPeriodFilter } from '../../finance/components/filters/FinancialPeriodFilter';
import { startOfMonth, endOfMonth, format } from 'date-fns';

// Novos Serviços e Tipos
import { diagnosticGeneratorService } from '../services/diagnostics/diagnostic-generator.service';
import { DiagnosticResult, InconsistencyRecord } from '../types/diagnostics.types';
import { PeriodFilter } from '../types/insights.types';

// Componentes
import { DiagnosticPanel, DiagnosticPanelSkeleton } from './diagnostics/DiagnosticPanel';
import { InconsistenciesModal } from './diagnostics/InconsistenciesModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

export function InsightsPage() {
  const { user } = useAuth();
  
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [inconsistencies, setInconsistencies] = useState<InconsistencyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modais
  const [showInconsistenciesModal, setShowInconsistenciesModal] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  
  const { selectedPeriod, transactions, refresh: refreshFinance } = useFinanceContext();
  
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

  const loadDiagnostics = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) {
      setGenerating(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    try {
      const data = await diagnosticGeneratorService.generateDiagnostics(user.id, periodFilter);
      setDiagnostics(data.diagnostics);
      setInconsistencies(data.inconsistencies);
    } catch (err: any) {
      console.error("Erro ao gerar diagnósticos:", err);
      setError("Não foi possível carregar os dados financeiros para este período.");
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

  const handleEditTransaction = (transactionId: string) => {
    setShowInconsistenciesModal(false);
    setEditingTransactionId(transactionId);
  };

  const onTransactionEdited = () => {
    setEditingTransactionId(null);
    refreshFinance();
    loadDiagnostics(true);
  };

  const transactionToEdit = useMemo(() => {
    if (!editingTransactionId || !transactions) return null;
    return transactions.find(t => String(t.id) === editingTransactionId) || null;
  }, [editingTransactionId, transactions]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <IconBadge icon={Sparkles} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Diagnósticos Inteligentes</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {periodFilter.type === 'global' ? 'Análise do Histórico Completo' : `Análise de ${periodFilter.label}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <FinancialPeriodFilter />

          <button 
            onClick={() => loadDiagnostics(true)}
            disabled={generating || loading}
            className={cn(
              "flex items-center gap-3 px-8 h-14 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg disabled:opacity-50",
              generating 
                ? "bg-slate-900 text-white" 
                : "bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:shadow-blue-200/50 hover:-translate-y-0.5"
            )}
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {generating ? 'Atualizando...' : 'Atualizar Diagnóstico'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-xs font-bold text-rose-700">{error}</p>
        </div>
      )}

      {/* Painel de Diagnósticos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Painel Executivo
          </h2>
          {diagnostics.length > 0 && !loading && !generating && (
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Sincronizado</span>
          )}
        </div>
        
        {loading ? (
          <DiagnosticPanelSkeleton />
        ) : (
          <DiagnosticPanel 
            diagnostics={diagnostics} 
            onAction={handleAction}
          />
        )}
      </div>

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

      {transactionToEdit && (
        <EditTransactionModal 
          isOpen={!!transactionToEdit}
          onClose={() => setEditingTransactionId(null)}
          transaction={transactionToEdit}
          onSuccess={onTransactionEdited}
          existingTransactions={transactions || []}
        />
      )}

    </div>
  );
}
