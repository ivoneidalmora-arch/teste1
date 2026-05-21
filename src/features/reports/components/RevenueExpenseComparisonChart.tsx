"use client";

import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/core/components/Card';
import { formatCurrencyBRL, groupCashFlowByMonth } from '../utils/reportMetrics';
import { ArrowRight } from 'lucide-react';

interface RevenueExpenseComparisonChartProps {
  transactions: any[];
}

export function RevenueExpenseComparisonChart({ transactions }: RevenueExpenseComparisonChartProps) {
  const data = useMemo(() => {
    const monthlyData = groupCashFlowByMonth(transactions);
    
    // Lista de meses abreviados em português do Brasil
    const monthAbbreviations: Record<string, string> = {
      "Janeiro": "Jan", "Fevereiro": "Fev", "Março": "Mar", "Abril": "Abr", 
      "Maio": "Mai", "Junho": "Jun", "Julho": "Jul", "Agosto": "Ago", 
      "Setembro": "Set", "Outubro": "Out", "Novembro": "Nov", "Dezembro": "Dez"
    };

    return Object.entries(monthlyData).map(([month, val]) => {
      const margin = val.income > 0 ? (val.balance / val.income) * 100 : 0;
      return {
        name: monthAbbreviations[month] || month.substring(0, 3),
        Receita: val.income,
        Despesa: val.expense,
        Margem: Math.max(-100, Math.min(100, margin)) // limitar visualmente entre -100% e 100%
      };
    });
  }, [transactions]);

  const hasData = data.length > 0;

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Título e Badge */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Comparativo Receita x Despesa</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Faturamento vs Custos</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100/50 rounded-lg text-[8px] font-black uppercase text-emerald-500 tracking-wider">
          Acumulado
        </span>
      </div>

      {/* Gráfico */}
      <div className="flex-1 w-full h-[180px] min-h-[180px] max-h-[200px] relative mt-2 text-[8px] font-bold">
        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-bold italic">Sem movimentações para exibir</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: -25, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={8} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={8} tickLine={false} domain={[-100, 100]} />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'Margem') return [`${parseFloat(value).toFixed(1)}%`, 'Margem'];
                  return [formatCurrencyBRL(value), name];
                }}
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
                formatter={(value) => (
                  <span className="text-[8px] font-extrabold text-slate-500 uppercase ml-0.5 mr-2">
                    {value}
                  </span>
                )}
              />
              <Bar yAxisId="left" dataKey="Receita" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={12} name="Receita" />
              <Bar yAxisId="left" dataKey="Despesa" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={12} name="Despesa" />
              <Line yAxisId="right" type="monotone" dataKey="Margem" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Margem" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver comparativo completo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
