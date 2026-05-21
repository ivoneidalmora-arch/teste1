"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/core/components/Card';
import { formatCurrencyBRL } from '../utils/reportMetrics';

interface RevenueDistributionChartProps {
  metrics: {
    totalGrossRevenue: number;
    totalNetRevenue: number;
    totalExpenses: number;
    netBalance: number;
    incomeChart: { name: string; value: number }[];
    expenseChart: { name: string; value: number }[];
  };
}

export function RevenueDistributionChart({ metrics }: RevenueDistributionChartProps) {
  const {
    totalGrossRevenue,
    totalExpenses,
    netBalance,
    expenseChart
  } = metrics;

  // Cálculo das categorias de despesas
  const data = useMemo(() => {
    const operacionais = expenseChart
      .filter(e => ['Operacional', 'Manutenção', 'Suprimentos', 'Custo Operacional'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const fixas = expenseChart
      .filter(e => ['Aluguel', 'Folha', 'Sistema/Software', 'Folha de Pagamento'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const impostos = expenseChart
      .filter(e => ['Impostos', 'Tributos'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const somadoConhecido = operacionais + fixas + impostos;
    const variaveis = Math.max(0, totalExpenses - somadoConhecido);

    const chartData = [
      { name: 'Custos Operacionais', value: operacionais, color: '#94a3b8' },
      { name: 'Despesas Fixas', value: fixas, color: '#475569' },
      { name: 'Despesas Variáveis', value: variaveis, color: '#f97316' },
      { name: 'Impostos/Tributos', value: impostos, color: '#f43f5e' },
      { name: 'Lucro Líquido', value: Math.max(0, netBalance), color: '#10b981' },
    ];

    return chartData.filter(item => item.value > 0);
  }, [expenseChart, totalExpenses, netBalance]);

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Título */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Distribuição de Receitas</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Composição do Faturamento</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="flex-1 w-full h-[180px] min-h-[180px] max-h-[200px] relative mt-2">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-bold italic">Sem despesas ou lucro registrados</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrencyBRL(value)}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '10px',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={6}
                formatter={(value: string, entry: any) => {
                  const payload = entry?.payload;
                  const percent = totalGrossRevenue > 0 && payload ? ((payload.value / totalGrossRevenue) * 100).toFixed(1) : '0';
                  return (
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase ml-1">
                      {value} ({percent}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Caixa central ou rodapé executivo */}
      <div className="mt-2 text-center border-t border-slate-50 pt-2 flex justify-around">
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Receita Bruta</span>
          <span className="text-xs font-black text-slate-900 mt-0.5 block">{formatCurrencyBRL(totalGrossRevenue)}</span>
        </div>
        <div className="border-l border-slate-100" />
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Total Despesas</span>
          <span className="text-xs font-black text-slate-900 mt-0.5 block">{formatCurrencyBRL(totalExpenses)}</span>
        </div>
      </div>
    </Card>
  );
}
