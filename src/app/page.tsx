"use client";

import { useState, useEffect } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsSummary } from '@/components/dashboard/MetricsSummary';
import { NovaVistoriaModal } from '@/components/modals/NovaVistoriaModal';
import { NovaDespesaModal } from '@/components/modals/NovaDespesaModal';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import { Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/transaction';
import { ClientRanking } from '@/components/reports/ClientRanking';
import { InspectionTypeBalance } from '@/components/dashboard/InspectionTypeBalance';
import { formatBRL } from '@/utils/formatters';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isVistoriaModalOpen, setIsVistoriaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { metrics, transactions, loading, refresh } = useFinance(selectedDate);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const handleModalSuccess = (date?: Date) => {
    if (date) setSelectedDate(date);
    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24">
      
      <DashboardHeader 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableMonths={metrics.availableMonths}
        onNewVistoria={() => setIsVistoriaModalOpen(true)}
        onNewDespesa={() => setIsDespesaModalOpen(true)}
        onRefresh={refresh}
      />

      {/* Seção Balanço Global */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
          <Globe className="w-20 md:w-32 h-20 md:h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Balanço Global
            </h2>
            <p className="text-5xl font-black text-white tracking-tight leading-none">
              {formatBRL(metrics.totalGlobalBalance)}
            </p>
            <p className="text-slate-400 mt-2 text-sm">Patrimônio líquido acumulado no sistema</p>
          </div>
          
          <div className="hidden md:block h-12 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               Sistema Online & Sincronizado
             </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Análise Mensal: <span className="text-brand-primary capitalize">{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</span>
        </h2>
      </div>

      <MetricsSummary metrics={metrics} />

      {/* Seção Estratégica: Ranking e Balanço de Tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <ClientRanking data={metrics.clientRanking} />
        <InspectionTypeBalance data={metrics.inspectionSummary} />
      </div>

      {/* Grid Inferior (Calendário e Atividades) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2">
          <DashboardCalendar currentDate={selectedDate} transactions={metrics.currentMonthTransactions} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity 
            transactions={transactions} 
            onEdit={(t) => setEditingTransaction(t)}
            onRefresh={refresh}
          />
        </div>
      </div>

      <EditTransactionModal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={handleModalSuccess}
        transaction={editingTransaction}
      />

      <NovaVistoriaModal 
        isOpen={isVistoriaModalOpen} 
        onClose={() => setIsVistoriaModalOpen(false)} 
        onSuccess={handleModalSuccess}
        existingTransactions={transactions}
        defaultDate={selectedDate}
      />
      
      <NovaDespesaModal 
        isOpen={isDespesaModalOpen} 
        onClose={() => setIsDespesaModalOpen(false)} 
        onSuccess={handleModalSuccess}
        defaultDate={selectedDate}
      />
    </div>
  );
}
