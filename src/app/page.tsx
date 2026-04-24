"use client";

import { useState, useEffect } from 'react';

// Hooks
import { useFinance } from '@/features/finance/hooks/useFinance';

// Feature Components
import { DashboardHeader } from '@/features/finance/components/DashboardHeader';
import { MetricsSummary } from '@/features/finance/components/MetricsSummary';
import { InspectionTypeBalance } from '@/features/finance/components/InspectionTypeBalance';
import { RecentActivity } from '@/features/finance/components/RecentActivity';
import { DashboardCalendar } from '@/features/finance/components/DashboardCalendar';
import { ClientRanking } from '@/features/reports/components/ClientRanking';
import { ImportButton } from '@/features/ai-ocr/components/ImportButton';

// Modals
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

// Shared
import { Transaction } from '@/core/types/finance';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [mounted, setMounted] = useState(false);

  const { transactions, metrics, loading, refresh } = useFinance(selectedDate);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Garantia de que metrics nunca seja nulo para os componentes filhos
  const safeMetrics = metrics || {
    availableMonths: [],
    inspectionSummary: [],
    clientRanking: [],
    totalGlobalBalance: 0,
    currentIncome: 0,
    incomeVariation: 0,
    currentExpense: 0,
    expenseVariation: 0,
    currentBalance: 0,
    balanceVariation: 0,
    ticketMedio: 0
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Cabeçalho */}
      <DashboardHeader 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableMonths={safeMetrics.availableMonths || []}
        onNewVistoria={() => setIsVistoriaModalOpen(true)}
        onNewDespesa={() => setIsDespesaModalOpen(true)}
        onRefresh={refresh}
      />

      {/* Resumo de Métricas */}
      <MetricsSummary metrics={safeMetrics as any} />

      {/* Grid de Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Balanço e IA */}
        <div className="lg:col-span-1 space-y-8">
          <InspectionTypeBalance data={safeMetrics.inspectionSummary || []} />
          
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
             <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-tight">Ações Rápidas</h4>
             <ImportButton onSuccess={refresh} className="w-full" />
          </div>
        </div>

        {/* Coluna Central/Direita: Atividade e Ranking */}
        <div className="lg:col-span-2 space-y-8">
          <RecentActivity 
            transactions={transactions || []} 
            onEdit={setEditingTransaction} 
            onRefresh={refresh}
          />
          
          <div className="grid grid-cols-1 gap-8">
            <ClientRanking data={safeMetrics.clientRanking || []} />
          </div>
        </div>
      </div>

      {/* Seção de Calendário */}
      <div className="grid grid-cols-1 gap-8 pb-24">
        <DashboardCalendar currentDate={selectedDate} transactions={transactions || []} />
      </div>

      {/* Modais */}
      <NovaVistoriaModal 
        isOpen={isVistoriaModalOpen} 
        onClose={() => setIsVistoriaModalOpen(false)} 
        onSuccess={refresh}
        existingTransactions={transactions || []}
      />
      <NovaDespesaModal 
        isOpen={isDespesaModalOpen} 
        onClose={() => setIsDespesaModalOpen(false)} 
        onSuccess={refresh} 
      />
      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
