"use client";

import React from 'react';
import { DRECard } from './DRECard';
import { RevenueDistributionChart } from './RevenueDistributionChart';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { ReportMetrics, formatCurrencyBRL } from '../utils/reportMetrics';

interface SeniorFinancialReportProps {
  metrics: ReportMetrics;
}

export function SeniorFinancialReport({ metrics }: SeniorFinancialReportProps) {
  const {
    totalGrossRevenue,
    netBalance,
    netMargin
  } = metrics;

  // Geração do resumo executivo inteligente com marcações para negrito
  const getExecutiveSummaryText = () => {
    if (totalGrossRevenue === 0) return "Nenhuma atividade registrada no período selecionado.";
    
    let text = `O período encerrou com uma receita bruta de **${formatCurrencyBRL(totalGrossRevenue)}**. `;
    
    if (netBalance > 0) {
      text += `A operação foi lucrativa, com um saldo líquido de **${formatCurrencyBRL(netBalance)}** e uma margem líquida de **${netMargin.toFixed(1)}%**. `;
      if (netMargin > 30) text += "O desempenho é **excelente**, superando as metas de eficiência operacional.";
      else if (netMargin > 15) text += "O resultado é **saudável** e dentro dos padrões de mercado.";
      else text += "A margem está **apertada**, sugere-se revisar custos operacionais para elevar a rentabilidade.";
    } else if (netBalance < 0) {
      text += `A operação registrou prejuízo de **${formatCurrencyBRL(Math.abs(netBalance))}**. `;
      text += "É **urgente** realizar uma auditoria detalhada nas despesas fixas e custos operacionais para restabelecer a saúde do caixa.";
    } else {
      text += "O período fechou em **equilíbrio operacional perfeito** (sem lucro ou prejuízo líquido).";
    }
    
    return text;
  };

  const isProfit = netBalance >= 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Faixa Executiva de Resumo */}
      <ExecutiveSummaryCard 
        summaryText={getExecutiveSummaryText()} 
        isProfit={isProfit} 
      />

      {/* Grid Principal Compacto: DRE (Esquerda) e Gráfico (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DRECard metrics={metrics} />
        <RevenueDistributionChart metrics={metrics} />
      </div>
    </div>
  );
}
