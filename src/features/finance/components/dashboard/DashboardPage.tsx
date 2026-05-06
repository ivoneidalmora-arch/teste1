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
import { FinancialHeroCard } from './FinancialHeroCard';
import { MetricCard } from './MetricCard';
import { CashFlowChart } from './CashFlowChart';
import { AlertsInsightsPanel } from './AlertsInsightsPanel';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { TopClientsCard } from './TopClientsCard';
import { CategoryDonutCard } from './CategoryDonutCard';
import { FinancialCalendarCard } from './FinancialCalendarCard';

import { useFinance } from '../../hooks/useFinance';
import { cn } from '@/core/utils/formatters';
import { 
  calculateFinancialMetrics, 
  calculatePercentageChange, 
  filterByMonth,
  normalizeTransaction 
} from '@/core/utils/finance';
import { subMonths } from 'date-fns';

// Modals
import { NovaVistoriaModal } from '@/features/finance/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/features/finance/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | 'global'>(new Date());
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month' | 'last30' | 'custom' | 'global'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Buscamos todas as transações (o hook useFinance já traz as transações do usuário logado)
  const { transactions, loading, error, refresh } = useFinance();
  
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // 0. Calcular Meses Disponíveis (com lançamentos)
  const availableMonths = useMemo(() => {
    if (!transactions) return [];
    const months = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        months.add(`${d.getFullYear()}-${d.getMonth()}`);
      }
    });
    return Array.from(months).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return yearB !== yearA ? yearB - yearA : monthB - monthA;
    });
  }, [transactions]);

  // 1. Filtragem por Período e Busca
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = [...transactions];

    // Filtro por Busca
    if (searchQuery) {
      const lowSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description || '').toLowerCase().includes(lowSearch) ||
        (t.customer || '').toLowerCase().includes(lowSearch)
      );
    }

    // Filtro por Período Ativo (Month/Week/etc)
    const now = new Date();
    if (activePeriod === 'month' && selectedDate instanceof Date) {
      filtered = filterByMonth(filtered, selectedDate);
    } else if (activePeriod === 'global' || selectedDate === 'global') {
      // Sem filtro de data
    } else if (activePeriod === 'today') {
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
  }, [transactions, searchQuery, activePeriod, selectedDate]);

  // 2. Cálculos Financeiros (Mês Atual e Anterior para Variação)
  const metrics = useMemo(() => {
    const current = calculateFinancialMetrics(filteredTransactions);
    
    // Calcular mês anterior para variação (apenas se não for global)
    if (selectedDate === 'global') {
      return {
        current,
        prev: current,
        variations: { income: 0, net: 0, expense: 0, balance: 0 }
      };
    }

    const prevDate = subMonths(selectedDate as Date, 1);
    const prevTransactions = filterByMonth(transactions || [], prevDate);
    const prev = calculateFinancialMetrics(prevTransactions);

    return {
      current,
      prev,
      variations: {
        income: calculatePercentageChange(current.receitaBruta, prev.receitaBruta),
        net: calculatePercentageChange(current.receitaLiquida, prev.receitaLiquida),
        expense: calculatePercentageChange(current.receitaBruta, prev.receitaBruta),
        balance: calculatePercentageChange(current.lucroMes, prev.lucroMes)
      }
    };
  }, [filteredTransactions, transactions, selectedDate]);

  // 3. Preparação de Dados para Componentes
  const recentTransactions = useMemo(() => 
    filteredTransactions.slice(0, 10).map(t => {
      const norm = normalizeTransaction(t);
      return {
        ...norm,
        date: norm.dateString,
        status: norm.status as any, // Cast para TransactionStatus
        origin: (norm.origin === 'supabase' || norm.origin === 'ocr' || norm.origin === 'import' ? norm.origin : 'manual') as any,
        type: norm.type as any
      };
    }),
  [filteredTransactions]);

  const cashFlowData = useMemo(() => {
    // Agrupar por dia para o gráfico
    const days: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(t => {
      const norm = normalizeTransaction(t);
      const day = norm.date.getDate();
      if (!days[day]) days[day] = { income: 0, expense: 0 };
      if (norm.type === 'income') days[day].income += norm.amount;
      else days[day].expense += norm.amount;
    });
    
    let cumulativeSaldo = 0;
    return Object.entries(days).map(([day, val]) => {
      cumulativeSaldo += (val.income - val.expense);
      return {
        name: `${day}`,
        entradas: val.income,
        saidas: val.expense,
        saldo: cumulativeSaldo
      };
    }).sort((a, b) => Number(a.name) - Number(b.name));
  }, [filteredTransactions]);

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
    <div className="space-y-6 max-w-full overflow-x-hidden pb-10">
      <DashboardHeader 
        title="Dashboard Financeiro" 
        subtitle="Visão Geral Corporativa" 
        selectedDate={selectedDate}
        availableMonths={availableMonths}
        onDateChange={(d) => {
          setSelectedDate(d);
          setActivePeriod(d === 'global' ? 'global' : 'month');
        }}
        onNewTransaction={() => setIsVistoriaModalOpen(true)}
        onNewExpense={() => setIsDespesaModalOpen(true)}
        onImportFile={() => window.location.href = '/importacoes'} 
        onGenerateReport={() => window.location.href = '/relatorios'}
        onSearch={setSearchQuery}
      />

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: 'today', label: 'Hoje' },
          { id: 'week', label: 'Esta Semana' },
          { id: 'month', label: 'Este Mês' },
          { id: 'last30', label: 'Últimos 30 Dias' },
          { id: 'global', label: 'Global' },
          { id: 'custom', label: 'Personalizado' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePeriod(p.id as any);
              if (p.id === 'month') setSelectedDate(new Date());
              if (p.id === 'global') setSelectedDate('global');
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activePeriod === p.id 
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20 border-slate-950" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Destaque Saldo */}
      <FinancialHeroCard 
        balance={metrics.current.lucroMes} 
        lastUpdate={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
        variation={metrics.variations.balance} 
      />

      {/* KPIs Principais */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 mb-8">
        <MetricCard 
          title="Receita Bruta" 
          value={metrics.current.receitaBruta} 
          trend={metrics.variations.income} 
          icon={TrendingUp} 
          variant="green"
        />
        <MetricCard 
          title="Receita Líquida" 
          value={metrics.current.receitaLiquida} 
          trend={metrics.variations.net} 
          icon={ShieldCheck} 
          variant="blue"
          description="Após despesas pagas e ajustes"
        />
        <MetricCard 
          title="Despesa Total" 
          value={metrics.current.receitaBruta - metrics.current.lucroMes} // Simplificado
          trend={metrics.variations.expense} 
          icon={TrendingDown} 
          variant="red"
        />
        <MetricCard 
          title="Despesas Pendentes" 
          value={metrics.current.despesasPendentes} 
          icon={Clock} 
          variant="orange"
        />
        <MetricCard 
          title="Saldo Atual" 
          value={metrics.current.lucroMes} 
          trend={metrics.variations.balance} 
          icon={Wallet} 
          variant="purple"
        />
        <MetricCard 
          title="Lucro do Mês" 
          value={metrics.current.lucroMes} 
          trend={metrics.variations.balance} 
          icon={Target} 
          variant="green"
        />
      </section>

      {/* Gráfico & Alertas */}
      <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mb-8">
        <div className="min-w-0">
          <CashFlowChart data={cashFlowData} />
        </div>
        <div className="min-w-0">
          <AlertsInsightsPanel alerts={[]} />
        </div>
      </section>

      {/* Tabela de Transações */}
      <div className="min-w-0 mb-8">
        <RecentTransactionsTable 
          transactions={recentTransactions} 
          onAction={(id) => {}} 
        />
      </div>

      {/* Cards Secundários */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopClientsCard clients={[]} />
        <CategoryDonutCard 
          data={[]} 
          totalValue={metrics.current.receitaBruta - metrics.current.lucroMes} 
        />
        <FinancialCalendarCard events={[]} />
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
