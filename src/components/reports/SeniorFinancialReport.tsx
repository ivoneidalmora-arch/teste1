"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { cn } from '@/utils/cn';

interface SeniorFinancialReportProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    incomeChart: { name: string; value: number }[];
    expenseChart: { name: string; value: number }[];
  };
}

export function SeniorFinancialReport({ metrics }: SeniorFinancialReportProps) {
  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Mapeamento para categorias do DRE
  // Como as categorias do banco são específicas, vamos agrupar para o relatório sênior
  const dreData = {
    income: {
      vendas: metrics.incomeChart.reduce((acc, curr) => acc + curr.value, 0), // Simplificado: tudo como prestação/vendas
      servicos: 0, // Poderia ser separado se houvesse flag
      outras: 0,
    },
    expenses: {
      operacionais: metrics.expenseChart
        .filter(e => ['Operacional', 'Manutenção', 'Suprimentos'].includes(e.name))
        .reduce((acc, curr) => acc + curr.value, 0),
      fixas: metrics.expenseChart
        .filter(e => ['Aluguel', 'Folha'].includes(e.name))
        .reduce((acc, curr) => acc + curr.value, 0),
      variaveis: metrics.expenseChart
        .filter(e => ['Outros'].includes(e.name))
        .reduce((acc, curr) => acc + curr.value, 0),
      impostos: metrics.expenseChart
        .filter(e => ['Impostos'].includes(e.name))
        .reduce((acc, curr) => acc + curr.value, 0),
    }
  };

  const totalIncome = metrics.totalIncome;
  const totalExpenses = metrics.totalExpense;
  const netProfit = metrics.netBalance;

  // 2. Dados para o Gráfico de Rosca (Baseado na Receita Total)
  const chartData = [
    { name: 'Custos Operacionais', value: dreData.expenses.operacionais, color: '#94a3b8' },
    { name: 'Despesas Fixas', value: dreData.expenses.fixas, color: '#64748b' },
    { name: 'Despesas Variáveis', value: dreData.expenses.variaveis, color: '#f97316' },
    { name: 'Impostos', value: dreData.expenses.impostos, color: '#ef4444' },
    { name: 'Lucro Líquido', value: Math.max(0, netProfit), color: '#10b981' },
  ].filter(item => item.value > 0);

  // Se houver prejuízo, o gráfico muda um pouco a lógica, mas seguiremos o padrão solicitado
  // (Receita distribuída entre gastos e o que sobrou é lucro)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Parte 1: Tabela Financeira Consolidada */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Consolidado Financeiro (DRE)</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase">Relatório Analítico</span>
          </div>

          <div className="space-y-6">
            {/* Seção Receitas */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Receitas Totais</span>
                <span className="text-lg font-black text-emerald-600">{formatBRL(totalIncome)}</span>
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Vendas e Serviços</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.income.vendas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Outras Receitas</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.income.outras)}</span>
                </div>
              </div>
            </div>

            {/* Seção Despesas */}
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 mb-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Despesas Totais</span>
                <span className="text-lg font-black text-rose-600">{formatBRL(totalExpenses)}</span>
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Custos Operacionais</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.expenses.operacionais)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Despesas Fixas (Aluguel/Folha)</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.expenses.fixas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Despesas Variáveis (Marketing/Outros)</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.expenses.variaveis)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Impostos e Tributos</span>
                  <span className="font-semibold text-slate-800">{formatBRL(dreData.expenses.impostos)}</span>
                </div>
              </div>
            </div>

            {/* Resultado Final */}
            <div className={cn(
              "mt-8 p-5 rounded-2xl flex justify-between items-center",
              netProfit >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100"
            )}>
              <div>
                <span className={cn(
                  "text-[10px] sm:text-xs font-black uppercase tracking-widest block mb-1",
                  netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  Resultado Líquido
                </span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {formatBRL(netProfit)}
                </span>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tighter",
                netProfit >= 0 ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              )}>
                {netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
              </div>
            </div>
          </div>
        </div>

        {/* Parte 2: Gráfico de Rosca */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="mb-2">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Distribuição de Receitas e Despesas</h3>
            <p className="text-sm text-slate-400">Visão proporcional da receita vs custos e lucro</p>
          </div>

          <div className="flex-1 min-h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label 
                    value={formatBRL(totalIncome)} 
                    position="center" 
                    fill="#1e293b"
                    className="text-lg font-black"
                  />
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatBRL(Number(value)), 'Valor']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value, entry: any) => {
                    const { payload } = entry;
                    const percent = ((payload.value / totalIncome) * 100).toFixed(1);
                    return <span className="text-xs font-bold text-slate-600 uppercase ml-1">{value} ({percent}%)</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
