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
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatBRL, cn } from '@/core/utils/formatters';
import { useState } from 'react';
import { Transaction } from '@/core/types/finance';
import { DashboardMetric } from '../../types/dashboard.types';

// Modals
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'last30' | 'custom'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { transactions, metrics: realMetrics, loading, error, refresh } = useFinance(selectedDate);
  
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtro de Transações por busca
  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    return (
      t.description?.toLowerCase().includes(searchLower) ||
      t.customer?.toLowerCase().includes(searchLower) ||
      t.category?.toLowerCase().includes(searchLower)
    );
  });

  // KPIs dinâmicos baseados em dados reais
  const displayMetrics: DashboardMetric[] = [
    {
      id: 'revenue-gross',
      title: 'Receita Bruta',
      value: realMetrics?.currentIncome || 0,
      formattedValue: formatBRL(realMetrics?.currentIncome || 0),
      change: Number(realMetrics?.incomeVariation.toFixed(1)) || 0,
      trend: (realMetrics?.incomeVariation || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'revenue-net',
      title: 'Receita Líquida',
      value: realMetrics?.currentIncome || 0, // Ajustar se houver cálculo de líquido
      formattedValue: formatBRL(realMetrics?.currentIncome || 0),
      change: Number(realMetrics?.incomeVariation.toFixed(1)) || 0,
      trend: (realMetrics?.incomeVariation || 0) >= 0 ? 'up' : 'down',
      icon: ShieldCheck,
      color: 'blue'
    },
    {
      id: 'expense-total',
      title: 'Despesa Total',
      value: realMetrics?.currentExpense || 0,
      formattedValue: formatBRL(realMetrics?.currentExpense || 0),
      change: Number(realMetrics?.expenseVariation.toFixed(1)) || 0,
      trend: (realMetrics?.expenseVariation || 0) <= 0 ? 'down' : 'up',
      icon: TrendingDown,
      color: 'red'
    },
    {
      id: 'expense-pending',
      title: 'Despesas Pendentes',
      value: realMetrics?.currentPendingExpense || 0,
      formattedValue: formatBRL(realMetrics?.currentPendingExpense || 0),
      change: 0,
      trend: 'up',
      icon: Clock,
      color: 'orange'
    },
    {
      id: 'balance-global',
      title: 'Saldo Atual',
      value: realMetrics?.totalGlobalBalance || 0,
      formattedValue: formatBRL(realMetrics?.totalGlobalBalance || 0),
      change: Number(realMetrics?.balanceVariation.toFixed(1)) || 0,
      trend: (realMetrics?.balanceVariation || 0) >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: 'purple'
    },
    {
      id: 'profit-month',
      title: 'Lucro do Mês',
      value: realMetrics?.currentBalance || 0,
      formattedValue: formatBRL(realMetrics?.currentBalance || 0),
      change: Number(realMetrics?.balanceVariation.toFixed(1)) || 0,
      trend: (realMetrics?.balanceVariation || 0) >= 0 ? 'up' : 'down',
      icon: Target,
      color: 'green'
    }
  ];

  const recentTransactions = (filteredTransactions || []).slice(0, 10).map(t => ({
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
        onNewExpense={() => setIsDespesaModalOpen(true)}
        onImportFile={() => window.location.href = '/importacoes'} 
        onGenerateReport={() => window.location.href = '/relatorios'}
        onSearch={setSearchQuery}
      />

      {/* Filtros de Período */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'today', label: 'Hoje' },
          { id: 'week', label: 'Esta Semana' },
          { id: 'month', label: 'Este Mês' },
          { id: 'last30', label: 'Últimos 30 Dias' },
          { id: 'custom', label: 'Personalizado' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodFilter(p.id as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              periodFilter === p.id 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

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
          <CashFlowChart data={realMetrics?.cashFlowData || []} />
        </div>
        <div className="xl:col-span-4">
          <AlertsInsightsPanel alerts={[]} />
        </div>
      </div>

      {/* Tabela de Transações */}
      <RecentTransactionsTable 
        transactions={recentTransactions} 
        onAction={(id) => {}} 
      />

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TopClientsCard clients={realMetrics?.topClients || []} />
        <CategoryDonutCard 
          data={realMetrics?.categoryDistribution || []} 
          totalValue={realMetrics?.currentExpense || 0} 
        />
        <FinancialCalendarCard events={realMetrics?.calendarEvents || []} />
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
