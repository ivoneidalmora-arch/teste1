"use client";

import { DashboardLayout } from './DashboardLayout';
import { DashboardHeader } from './DashboardHeader';
import { FinancialHeroCard } from './FinancialHeroCard';
import { MetricsGrid } from './MetricsGrid';
import { CashFlowChart } from './CashFlowChart';
import { AlertsInsightsPanel } from './AlertsInsightsPanel';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { TopClientsCard } from './TopClientsCard';
import { CategoryDonutCard } from './CategoryDonutCard';
import { FinancialCalendarCard } from './FinancialCalendarCard';

import { 
  MOCK_METRICS, 
  MOCK_CASH_FLOW, 
  MOCK_ALERTS, 
  MOCK_TRANSACTIONS, 
  MOCK_TOP_CLIENTS, 
  MOCK_CATEGORIES, 
  MOCK_EVENTS 
} from '../../data/dashboard.mock';
import { useFinance } from '../../hooks/useFinance';
import { formatBRL } from '@/core/utils/formatters';
import { useState } from 'react';
import { Transaction } from '@/core/types/finance';

// Modals
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { transactions, metrics: realMetrics, loading, error, refresh } = useFinance(selectedDate);
  
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Integrando dados reais com o visual premium
  const displayMetrics = MOCK_METRICS.map(m => {
    if (!realMetrics) return m;
    
    switch(m.title) {
      case 'Receita Bruta':
        return { ...m, value: realMetrics.currentIncome, formattedValue: formatBRL(realMetrics.currentIncome), change: Number(realMetrics.incomeVariation.toFixed(1)) };
      case 'Receita Líquida':
        return { ...m, value: realMetrics.currentIncome, formattedValue: formatBRL(realMetrics.currentIncome), change: Number(realMetrics.incomeVariation.toFixed(1)) };
      case 'Despesa Total':
        return { ...m, value: realMetrics.currentExpense, formattedValue: formatBRL(realMetrics.currentExpense), change: Number(realMetrics.expenseVariation.toFixed(1)) };
      case 'Despesas Pendentes':
        return { ...m, value: realMetrics.currentPendingExpense || 0, formattedValue: formatBRL(realMetrics.currentPendingExpense || 0) };
      case 'Saldo Atual':
        return { ...m, value: realMetrics.totalGlobalBalance, formattedValue: formatBRL(realMetrics.totalGlobalBalance), change: Number(realMetrics.balanceVariation.toFixed(1)) };
      case 'Lucro do Mês':
        return { ...m, value: realMetrics.currentBalance, formattedValue: formatBRL(realMetrics.currentBalance), change: Number(realMetrics.balanceVariation.toFixed(1)) };
      default:
        return m;
    }
  });

  const recentTransactions = (transactions || []).slice(0, 10).map(t => ({
    id: String(t.id),
    date: t.date,
    description: t.description,
    customer: t.customer || 'N/A',
    category: t.category || 'Outros',
    amount: t.amount,
    status: t.status as any,
    origin: t.source || 'supabase',
    type: t.type
  }));

  const totalBalance = realMetrics?.totalGlobalBalance ?? 0;

  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-sm text-slate-500 mb-6">Não conseguimos conectar ao banco de dados. Verifique sua conexão.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Dashboard Financeiro" 
        subtitle="Visão Geral Corporativa" 
        onNewTransaction={() => setIsVistoriaModalOpen(true)}
        onImportFile={() => setIsVistoriaModalOpen(true)} 
      />

      {/* Destaque Saldo */}
      <FinancialHeroCard 
        balance={totalBalance} 
        lastUpdate="Atualizado agora" 
        variation={realMetrics?.balanceVariation || 0} 
      />

      {/* KPIs Principais */}
      <MetricsGrid metrics={displayMetrics} />

      {/* Gráfico & Alertas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <CashFlowChart data={realMetrics?.cashFlowData || MOCK_CASH_FLOW} />
        </div>
        <div className="xl:col-span-4">
          <AlertsInsightsPanel alerts={MOCK_ALERTS} />
        </div>
      </div>

      {/* Tabela de Transações */}
      <RecentTransactionsTable 
        transactions={recentTransactions.length > 0 ? recentTransactions : MOCK_TRANSACTIONS} 
        onAction={(id) => {}} 
      />

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TopClientsCard clients={realMetrics?.topClients || MOCK_TOP_CLIENTS} />
        <CategoryDonutCard 
          data={realMetrics?.categoryDistribution || MOCK_CATEGORIES} 
          totalValue={realMetrics?.currentExpense || 1} 
        />
        <FinancialCalendarCard events={realMetrics?.calendarEvents || MOCK_EVENTS} />
      </div>

      {/* Modais de Operação */}
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
