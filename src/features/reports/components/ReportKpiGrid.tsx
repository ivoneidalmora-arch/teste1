"use client";

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Percent, 
  ClipboardList, 
  AlertTriangle 
} from 'lucide-react';
import { ReportKpiCard } from './ReportKpiCard';
import { ReportMetrics, formatCurrencyBRL, formatPercentage } from '../utils/reportMetrics';

interface ReportKpiGridProps {
  metrics: ReportMetrics;
  inconsistenciesCount: number;
  onTransactionsClick?: () => void;
  onInconsistenciesClick?: () => void;
}

export function ReportKpiGrid({ 
  metrics, 
  inconsistenciesCount,
  onTransactionsClick,
  onInconsistenciesClick
}: ReportKpiGridProps) {
  const {
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    transactionCount
  } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {/* 1. Receita Bruta */}
      <ReportKpiCard 
        label="Receita Bruta"
        value={formatCurrencyBRL(totalGrossRevenue)}
        icon={TrendingUp}
        iconVariant="blue"
        trend={{ type: 'neutral' }}
      />

      {/* 2. Receita Líquida */}
      <ReportKpiCard 
        label="Receita Líquida"
        value={formatCurrencyBRL(totalNetRevenue)}
        icon={DollarSign}
        iconVariant="green"
        trend={{ type: 'positive' }}
      />

      {/* 3. Despesas */}
      <ReportKpiCard 
        label="Despesas"
        value={formatCurrencyBRL(totalExpenses)}
        icon={TrendingDown}
        iconVariant="red"
        trend={{ type: 'negative' }}
      />

      {/* 4. Saldo Líquido */}
      <ReportKpiCard 
        label="Saldo Líquido"
        value={formatCurrencyBRL(netBalance)}
        icon={Wallet}
        iconVariant={netBalance >= 0 ? "green" : "red"}
        trend={{ 
          type: netBalance >= 0 ? 'positive' : 'negative',
          label: netBalance >= 0 ? 'Lucro' : 'Prejuízo'
        }}
      />

      {/* 5. Margem Líquida */}
      <ReportKpiCard 
        label="Margem Líquida"
        value={formatPercentage(netMargin)}
        icon={Percent}
        iconVariant="purple"
        trend={{ 
          type: netMargin >= 30 ? 'positive' : (netMargin > 0 ? 'neutral' : 'negative')
        }}
      />

      {/* 6. Quantidade de Lançamentos */}
      <ReportKpiCard 
        label="Lançamentos"
        value={transactionCount}
        icon={ClipboardList}
        iconVariant="slate"
        onClick={onTransactionsClick}
      />

      {/* 7. Alertas/Inconsistências */}
      <ReportKpiCard 
        label="Inconsistências"
        value={inconsistenciesCount}
        icon={AlertTriangle}
        iconVariant={inconsistenciesCount > 0 ? "yellow" : "green"}
        trend={{ 
          type: inconsistenciesCount > 0 ? 'alert' : 'positive',
          label: inconsistenciesCount > 0 ? 'Ajustar' : 'Ok'
        }}
        onClick={onInconsistenciesClick}
      />
    </div>
  );
}
