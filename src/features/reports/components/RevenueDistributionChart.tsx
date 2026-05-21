"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/core/components/Card';
import { formatCurrencyBRL } from '../utils/reportMetrics';
import { ArrowRight } from 'lucide-react';

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

// Cores premium e elegantes para fatias do gráfico de receitas
const COLORS = ['#8b5cf6', '#ec4899', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#14b8a6'];

export function RevenueDistributionChart({ metrics }: RevenueDistributionChartProps) {
  const {
    totalGrossRevenue,
    incomeChart
  } = metrics;

  // Filtra categorias de receita com valor maior que zero
  const data = useMemo(() => {
    return [...incomeChart]
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [incomeChart]);

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Título e Cabeçalho */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Distribuição de Receitas</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Participação por Categoria</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100/50 rounded-lg text-[8px] font-black uppercase text-emerald-500 tracking-wider">
          Faturamento Real
        </span>
      </div>

      {/* Gráfico de Pizza */}
      <div className="flex-1 w-full h-[180px] min-h-[180px] max-h-[200px] relative mt-2 text-[8px] font-bold">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-bold italic">Sem faturamento registrado no período</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                animationDuration={850}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrencyBRL(value)}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #f1f5f9', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '9px',
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={5}
                formatter={(value: string, entry: any) => {
                  const payload = entry?.payload;
                  const percent = totalGrossRevenue > 0 && payload ? ((payload.value / totalGrossRevenue) * 100).toFixed(1) : '0';
                  return (
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase ml-1 mr-2">
                      {value} ({percent}%)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Rodapé e Link de Detalhamento */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
        <div>
          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">Faturamento Bruto</span>
          <span className="text-[10px] font-black text-slate-900 mt-0.5 block leading-none">{formatCurrencyBRL(totalGrossRevenue)}</span>
        </div>
        
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver detalhamento
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
