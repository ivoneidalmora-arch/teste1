"use client";

import React, { useMemo } from 'react';
import { Scale, TrendingUp, TrendingDown, DollarSign, Percent, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ReportMetrics, formatCurrencyBRL, formatPercentage } from '../../utils/reportMetrics';
import { BaseModal } from '@/core/components/BaseModal';

interface FullComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ReportMetrics;
  transactions: any[];
  periodStr: string;
}

export function FullComparisonModal({ isOpen, onClose, metrics, transactions, periodStr }: FullComparisonModalProps) {
  const {
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    bestMonth,
    worstMonth,
    ytdVariation
  } = metrics;

  const comparisonData = useMemo(() => {
    // Proporção de despesas sobre receitas
    const expenseToRevenueRatio = totalNetRevenue > 0 ? (totalExpenses / totalNetRevenue) * 100 : 0;
    
    // Alerta de crescimento de despesas
    const isExpenseWarning = expenseToRevenueRatio >= 70;
    
    let analysisMessage = "";
    if (expenseToRevenueRatio < 40) {
      analysisMessage = "Excelente controle de despesas. A operação consome uma porcentagem mínima de caixa, garantindo alta margem operacional.";
    } else if (expenseToRevenueRatio < 70) {
      analysisMessage = "Equilíbrio adequado. As despesas operacionais estão sob controle e dentro dos limites recomendados de caixa.";
    } else {
      analysisMessage = "Atenção: A taxa de consumo operacional está muito elevada. As despesas consomem mais de 70% da receita líquida, reduzindo drasticamente as margens de lucro.";
    }

    return {
      expenseToRevenueRatio,
      isExpenseWarning,
      analysisMessage
    };
  }, [totalNetRevenue, totalExpenses]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Comparativo de Receitas x Despesas"
      maxWidthClass="md:max-w-2xl"
    >
      <div className="space-y-6 text-slate-800">
        
        {/* Bloco Superior - Balanço */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Análise de Balanço</h3>
              <p className="text-[11px] font-black text-slate-200 uppercase">{periodStr}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Saldo Operacional</span>
            <span className={`text-sm font-black ${netBalance >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
              {formatCurrencyBRL(netBalance)}
            </span>
          </div>
        </div>

        {/* Comparação Gráfica Simples por Proporções */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            Proporção de Consumo
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider block mb-1">
                Receita Operacional Líquida
              </span>
              <span className="text-sm font-black text-slate-100 block">
                {formatCurrencyBRL(totalNetRevenue)}
              </span>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
              <span className="text-[8px] text-slate-500 font-bold mt-1.5 block">100% dos Recursos</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider block mb-1">
                Despesas Operacionais Totais
              </span>
              <span className="text-sm font-black text-slate-100 block">
                {formatCurrencyBRL(totalExpenses)}
              </span>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full rounded-full ${comparisonData.isExpenseWarning ? 'bg-rose-500 animate-pulse' : 'bg-purple-500'}`} 
                  style={{ width: `${Math.min(100, comparisonData.expenseToRevenueRatio)}%` }} 
                />
              </div>
              <span className="text-[8px] text-slate-500 font-bold mt-1.5 block">
                Consumo: {comparisonData.expenseToRevenueRatio.toFixed(1)}% da Receita
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de Despesas */}
        <div className={`p-4 rounded-xl border flex gap-3 items-start ${
          comparisonData.isExpenseWarning 
            ? 'bg-rose-950/20 border-rose-900/50 text-rose-200' 
            : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-250'
        }`}>
          {comparisonData.isExpenseWarning ? (
            <AlertTriangle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
          )}
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-wider">
              {comparisonData.isExpenseWarning ? 'Alerta de Custo Elevado' : 'Consumo sob Controle'}
            </h5>
            <p className="text-xs text-slate-350 font-medium leading-relaxed mt-1">
              {comparisonData.analysisMessage}
            </p>
          </div>
        </div>

        {/* Indicadores Temporais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-900 pt-4">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Melhor Mês</span>
            <span className="text-[10px] font-black text-slate-200 block mt-1 uppercase">{bestMonth.month}</span>
            <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">{formatCurrencyBRL(bestMonth.value)}</span>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Pior Mês</span>
            <span className="text-[10px] font-black text-slate-200 block mt-1 uppercase">{worstMonth.month}</span>
            <span className="text-[9px] font-bold text-rose-450 block mt-0.5">{formatCurrencyBRL(worstMonth.value)}</span>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Margem Líquida</span>
            <span className="text-[11px] font-black text-slate-200 block mt-1">{formatPercentage(netMargin)}</span>
            <span className={`text-[8px] font-bold block mt-0.5 ${netMargin >= 30 ? 'text-emerald-450' : 'text-slate-400'}`}>
              {netMargin >= 30 ? 'Superavitária' : 'Normal'}
            </span>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Crescimento YTD</span>
            <span className="text-[11px] font-black text-slate-200 block mt-1">
              {ytdVariation !== 0 ? `${ytdVariation.toFixed(1)}%` : '---'}
            </span>
            <span className={`text-[8px] font-bold block mt-0.5 ${ytdVariation >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
              {ytdVariation >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all border border-slate-800"
          >
            Fechar Comparativo
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
