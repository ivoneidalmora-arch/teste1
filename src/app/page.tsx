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
  const m = metrics || {
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
    <div className="container mx-auto px-2 py-2 space-y-2 animate-in fade-in duration-700">
      
      {/* Cabeçalho */}
      <DashboardHeader 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableMonths={ m.availableMonths || []}
        onNewVistoria={() => setIsVistoriaModalOpen(true)}
        onNewDespesa={() => setIsDespesaModalOpen(true)}
        onRefresh={refresh}
      />

      {/* Resumo de Métricas */}
      <MetricsSummary metrics={m as any} />

      {/* Seção Operacional e Inteligência */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Lado Esquerdo (Vistorias) - Mais largo */}
        <div className="lg:col-span-9">
          <RecentActivity 
            transactions={transactions || []} 
            onEdit={setEditingTransaction} 
            onRefresh={refresh}
          />
        </div>
        
        {/* Lado Direito (Balanço) - Mais estreito */}
        <div className="lg:col-span-3">
          <InspectionTypeBalance data={m.inspectionSummary || []} />
        </div>

        {/* Ranking de Clientes (Full Width mas compacto) */}
        <div className="lg:col-span-12">
          <ClientRanking data={m.clientRanking || []} />
        </div>

        {/* Planejamento (Calendário) */}
        <div className="lg:col-span-12">
          <DashboardCalendar currentDate={selectedDate} transactions={transactions || []} />
        </div>
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
