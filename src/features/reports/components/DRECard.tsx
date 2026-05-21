"use client";

import React from 'react';
import { Card } from '@/core/components/Card';
import { formatCurrencyBRL, formatPercentage } from '../utils/reportMetrics';
import { cn } from '@/core/utils/formatters';
import { ArrowRight } from 'lucide-react';

interface DRECardProps {
  metrics: {
    totalGrossRevenue: number;
    totalNetRevenue: number;
    totalExpenses: number;
    netBalance: number;
    netMargin: number;
    incomeChart: { name: string; value: number }[];
    expenseChart: { name: string; value: number }[];
  };
  onViewDRE?: () => void;
}

export function DRECard({ metrics, onViewDRE }: DRECardProps) {
  const {
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    expenseChart
  } = metrics;

  // Agrupamento de despesas garantindo somatório 100% consistente
  const operacionais = expenseChart
    .filter(e => ['Operacional', 'Manutenção', 'Suprimentos', 'Custo Operacional'].includes(e.name))
    .reduce((acc, curr) => acc + curr.value, 0);

  const fixas = expenseChart
    .filter(e => ['Aluguel', 'Folha', 'Sistema/Software', 'Folha de Pagamento'].includes(e.name))
    .reduce((acc, curr) => acc + curr.value, 0);

  const impostos = expenseChart
    .filter(e => ['Impostos', 'Tributos'].includes(e.name))
    .reduce((acc, curr) => acc + curr.value, 0);

  // Todo o resto cai em despesas variáveis para manter a integridade matemática
  const somadoConhecido = operacionais + fixas + impostos;
  const variaveis = Math.max(0, totalExpenses - somadoConhecido);

  const isProfit = netBalance >= 0;

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Título e Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Consolidado Financeiro (DRE)</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Regime de Competência</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100/50 rounded-lg text-[8px] font-black uppercase text-emerald-500 tracking-wider">
          Acumulado
        </span>
      </div>

      {/* Tabela do DRE Compacta */}
      <div className="space-y-2.5 flex-1 justify-center flex flex-col mb-2">
        {/* Receitas */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Receita Bruta</span>
            <span className="text-xs font-black text-emerald-600">{formatCurrencyBRL(totalGrossRevenue)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] pl-3 pt-0.5">
            <span className="text-slate-500 font-medium">(-) Deduções (Receita Líquida)</span>
            <span className="font-semibold text-slate-700">{formatCurrencyBRL(totalNetRevenue)}</span>
          </div>
        </div>

        {/* Despesas */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-50 pb-0.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Despesas Totais</span>
            <span className="text-xs font-black text-rose-600">{formatCurrencyBRL(totalExpenses)}</span>
          </div>
          <div className="space-y-0.5 pl-3 pt-0.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Custos Operacionais</span>
              <span className="font-semibold text-slate-700">{formatCurrencyBRL(operacionais)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Despesas Fixas</span>
              <span className="font-semibold text-slate-700">{formatCurrencyBRL(fixas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Despesas Variáveis</span>
              <span className="font-semibold text-slate-700">{formatCurrencyBRL(variaveis)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Impostos e Tributos</span>
              <span className="font-semibold text-slate-700">{formatCurrencyBRL(impostos)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Destaque do Resultado */}
      <div className={cn(
        "p-2.5 rounded-xl flex justify-between items-center border",
        isProfit 
          ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" 
          : "bg-rose-50/50 border-rose-100 text-rose-800"
      )}>
        <div className="min-w-0">
          <span className="text-[8px] font-black uppercase tracking-wider block opacity-75">
            Resultado Líquido do Período
          </span>
          <span className="text-sm font-black tracking-tight leading-none block mt-0.5">
            {formatCurrencyBRL(netBalance)}
          </span>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs",
          isProfit ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        )}>
          {isProfit ? `Lucro (${formatPercentage(netMargin)})` : `Prejuízo (${formatPercentage(netMargin)})`}
        </div>
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button 
          onClick={onViewDRE}
          className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group"
        >
          Ver DRE completo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
