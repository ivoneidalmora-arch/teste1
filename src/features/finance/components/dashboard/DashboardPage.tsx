"use client";

import { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  ShieldCheck,
  Clock
} from 'lucide-react';

import { DashboardHeader } from './DashboardHeader';
import { MetricCard } from './MetricCard';
import { CashFlowChart } from './CashFlowChart';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { TopClientsCard } from './TopClientsCard';
import { GoogleCalendarCard } from '@/features/calendar/components/GoogleCalendarCard';
import { 
  getTopClients, 
  getExpensesByCategory, 
  getFinancialCalendarEvents 
} from '@/lib/dashboard-metrics';

import { useFinance } from '../../hooks/useFinance';
import { cn } from '@/core/utils/formatters';
import { subMonths } from 'date-fns';
import { prepareCashFlowChartData } from '../../utils/cashFlowChart';
import { calculateDashboardMetrics } from '../../utils/financialValueUtils';
import { 
  calculateFinancialMetrics, 
  calculatePercentageChange, 
  filterByMonth as legacyFilterByMonth,
  normalizeTransaction 
} from '@/core/utils/finance';

// Modals
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

import { useFinanceContext } from '../../contexts/FinanceContext';

export function DashboardPage() {
  const { 
    transactions, 
    loading, 
    error, 
    refresh, 
    selectedPeriod, 
    selectedYear,
    availableMonths, 
    setPeriod,
    filteredTransactions 
  } = useFinanceContext();
  
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month' | 'last30' | 'custom' | 'global'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Filtro por Busca (adicional ao filtro de período do context)
  const dashboardTransactions = useMemo(() => {
    let filtered = [...filteredTransactions];

    if (searchQuery) {
      const lowSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description || '').toLowerCase().includes(lowSearch) ||
        (t.customer || '').toLowerCase().includes(lowSearch)
      );
    }

    // Filtros rápidos locais (Today, Week, etc)
    const now = new Date();
    if (activePeriod === 'today') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.toDateString() === now.toDateString();
      });
    } else if (activePeriod === 'week') {
      const start = new Date(now.setDate(now.getDate() - now.getDay()));
      const end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
    } else if (activePeriod === 'last30') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter(t => new Date(t.date) >= thirtyDaysAgo);
    }

    return filtered;
  }, [filteredTransactions, searchQuery, activePeriod]);

  // Cálculos Financeiros
  const metrics = useMemo(() => {
    const current = calculateDashboardMetrics(dashboardTransactions);
    
    // Para variação, usamos o mês anterior
    let prevTransactions: any[] = [];
    if (selectedPeriod !== 'global') {
      const [year, month] = selectedPeriod.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const prevDate = subMonths(date, 1);
      prevTransactions = legacyFilterByMonth(transactions || [], prevDate);
    } else {
      // Se global, pegamos o ano anterior para variação? 
      // O requisito diz que para global retorna current como prev (variação 0)
      return {
        current,
        prev: current,
        variations: { income: 0, net: 0, expense: 0, balance: 0 }
      };
    }

    const prev = calculateDashboardMetrics(prevTransactions);

    return {
      current,
      prev,
      variations: {
        income: calculatePercentageChange(current.receitaBruta, prev.receitaBruta),
        net: calculatePercentageChange(current.receitaLiquida, prev.receitaLiquida),
        expense: calculatePercentageChange(current.despesasPagas, prev.despesasPagas),
        balance: calculatePercentageChange(current.saldoDisponivel, prev.saldoDisponivel)
      }
    };
  }, [dashboardTransactions, transactions, selectedPeriod]);

  // Preparação de Dados para Componentes
  const topClients = useMemo(() => 
    getTopClients(dashboardTransactions), 
  [dashboardTransactions]);

  const expensesByCategory = useMemo(() => 
    getExpensesByCategory(dashboardTransactions), 
  [dashboardTransactions]);

  const financialEvents = useMemo(() => 
    getFinancialCalendarEvents(dashboardTransactions), 
  [dashboardTransactions]);

  const recentTransactions = useMemo(() => 
    dashboardTransactions.slice(0, 10).map(t => {
      const norm = normalizeTransaction(t);
      return {
        id: String(norm.id),
        date: norm.date,
        description: norm.description,
        customer: norm.customer || 'N/A',
        category: norm.category || 'Outros',
        amount: norm.amount,
        netAmount: norm.netAmount,
        grossAmount: norm.grossAmount,
        status: norm.status,
        source: (['manual', 'import', 'ocr', 'supabase'].includes(norm.source) ? norm.source : 'manual') as any,
        type: norm.type as any
      } as any;
    }),
  [dashboardTransactions]);

  const cashFlowData = useMemo(() => {
    return prepareCashFlowChartData({
      transactions: transactions || [],
      selectedPeriod,
      selectedYear
    });
  }, [transactions, selectedPeriod, selectedYear]);

  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sincronizando Dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      <DashboardHeader 
        title="Dashboard Financeiro" 
        subtitle="Visão Geral Corporativa" 
        onNewTransaction={() => setIsVistoriaModalOpen(true)}
        onNewExpense={() => setIsDespesaModalOpen(true)}
        onImportFile={() => window.location.href = '/importacoes'} 
        onGenerateReport={() => window.location.href = '/relatorios'}
        onSearch={setSearchQuery}
      />

      {/* Grid Principal Compacto */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* 1. KPIs de Performance (Linha Superior - 5 colunas) */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard 
            title="Saldo Disponível" 
            value={metrics.current.saldoDisponivel} 
            trend={metrics.variations.balance} 
            icon={Wallet} 
            variant="blue" 
            description={`Atualizado: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          />
          <MetricCard title="Receita Bruta" value={metrics.current.receitaBruta} trend={metrics.variations.income} icon={TrendingUp} variant="blue" />
          <MetricCard title="Receita Líquida" value={metrics.current.receitaLiquida} trend={metrics.variations.net} icon={ShieldCheck} variant="green" />
          <MetricCard title="Despesa Paga" value={metrics.current.despesasPagas} trend={metrics.variations.expense} icon={TrendingDown} variant="red" />
          <MetricCard title="Despesas Pendentes" value={metrics.current.despesasPendentes} icon={Clock} variant="orange" />
        </div>

        {/* 2. Fluxo de Caixa + Top Clientes (8/4) */}
        <div className="col-span-12 lg:col-span-8">
          <CashFlowChart 
            data={cashFlowData.data} 
            title={cashFlowData.title}
            subtitle={cashFlowData.subtitle}
            mode={cashFlowData.mode}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TopClientsCard 
            clients={topClients} 
            onSeeAll={() => window.location.href = '/relatorios'}
          />
        </div>

        {/* 3. Transações Recentes + Calendário Google (7/5) */}
        <div className="col-span-12 lg:col-span-7">
          <RecentTransactionsTable 
            transactions={recentTransactions.slice(0, 5)} 
            onAction={(id) => {}} 
          />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <GoogleCalendarCard />
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
          existingTransactions={transactions || []}
        />
      )}
    </div>
  );
}
