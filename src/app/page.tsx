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

      {/* Seção de Gestão de Vistorias (Operacional) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1 h-4 bg-brand-primary rounded-full"></div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Gestão Operacional de Vistorias</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <RecentActivity 
              transactions={transactions || []} 
              onEdit={setEditingTransaction} 
              onRefresh={refresh}
            />
          </div>
          <div className="lg:col-span-4">
            <InspectionTypeBalance data={safeMetrics.inspectionSummary || []} />
          </div>
        </div>
      </section>

      {/* Seção de Inteligência e Performance (Estratégico) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1 h-4 bg-amber-400 rounded-full"></div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Inteligência e Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <ClientRanking data={safeMetrics.clientRanking || []} />
          </div>
        </div>
      </section>

      {/* Seção de Planejamento (Calendário) */}
      <section className="space-y-4 pb-24">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Planejamento Mensal</h2>
        </div>
        <DashboardCalendar currentDate={selectedDate} transactions={transactions || []} />
      </section>

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
