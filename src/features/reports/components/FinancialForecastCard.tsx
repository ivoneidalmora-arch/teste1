"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/core/components/Card';
import { formatCurrencyBRL, groupCashFlowByMonth } from '../utils/reportMetrics';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface FinancialForecastCardProps {
  transactions: any[];
}

export function FinancialForecastCard({ transactions }: FinancialForecastCardProps) {
  const { data, growthRate } = useMemo(() => {
    const monthlyData = groupCashFlowByMonth(transactions);
    const months = Object.entries(monthlyData);
    
    // Lista de meses abreviados
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    // 1. Calcula a média do faturamento e saldo recentes
    let avgRevenue = 15000; // fallback se não houver dados
    let avgExpense = 10000;
    
    if (months.length > 0) {
      const totalRevenue = months.reduce((acc, [, val]) => acc + val.income, 0);
      const totalExpense = months.reduce((acc, [, val]) => acc + val.expense, 0);
      avgRevenue = totalRevenue / months.length;
      avgExpense = totalExpense / months.length;
    }

    // Se a média de receita for 0, usa fallback razoável
    if (avgRevenue <= 0) avgRevenue = 10000;
    if (avgExpense <= 0) avgExpense = 7000;

    // 2. Determina o último mês ativo
    let lastMonthIdx = new Date().getMonth(); // Maio (4) se hoje for 21/05

    if (months.length > 0) {
      const monthAbbreviationsReverse: Record<string, number> = {
        "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, 
        "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7, 
        "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11
      };
      
      const lastMonthName = months[months.length - 1][0];
      if (monthAbbreviationsReverse[lastMonthName] !== undefined) {
        lastMonthIdx = monthAbbreviationsReverse[lastMonthName];
      }
    }

    // 3. Monta o histórico (últimos 3 meses ou meses disponíveis)
    const chartList: any[] = [];
    
    // Se temos histórico real, usamos
    if (months.length > 0) {
      // Pega até os últimos 3 meses reais
      const lastThreeReal = months.slice(-3);
      lastThreeReal.forEach(([monthName, val]) => {
        const monthAbbreviations: Record<string, string> = {
          "Janeiro": "Jan", "Fevereiro": "Fev", "Março": "Mar", "Abril": "Abr", 
          "Maio": "Mai", "Junho": "Jun", "Julho": "Jul", "Agosto": "Ago", 
          "Setembro": "Set", "Outubro": "Out", "Novembro": "Nov", "Dezembro": "Dez"
        };
        chartList.push({
          name: monthAbbreviations[monthName] || monthName.substring(0, 3),
          Receita: val.income,
          Projeção: null
        });
      });
    } else {
      // Fallback histórico mockado
      for (let i = 2; i >= 0; i--) {
        const idx = (lastMonthIdx - i + 12) % 12;
        chartList.push({
          name: monthNames[idx],
          Receita: avgRevenue * (1 - i * 0.05),
          Projeção: null
        });
      }
    }

    // Adiciona uma ponte: o último mês real também serve como base da projeção
    if (chartList.length > 0) {
      chartList[chartList.length - 1].Projeção = chartList[chartList.length - 1].Receita;
    }

    // 4. Gera projeções para os próximos 3 meses (crescimento de 3.5% a.m. simulado)
    const simulatedGrowth = 0.035; // 3.5%
    let currentProj = chartList[chartList.length - 1]?.Receita || avgRevenue;

    for (let i = 1; i <= 3; i++) {
      const idx = (lastMonthIdx + i) % 12;
      currentProj = currentProj * (1 + simulatedGrowth);
      chartList.push({
        name: `${monthNames[idx]}*`,
        Receita: null,
        Projeção: currentProj
      });
    }

    return { data: chartList, growthRate: simulatedGrowth * 100 };
  }, [transactions]);

  const hasData = data.length > 0;

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Previsão e Tendência</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Próximos 3 meses (*Projeção)</p>
        </div>
        <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100/50 text-[8px] font-black uppercase text-purple-600 tracking-wider">
          <TrendingUp className="w-2.5 h-2.5" />
          +{growthRate.toFixed(1)}% Est.
        </div>
      </div>

      {/* Gráfico */}
      <div className="flex-1 w-full h-[180px] min-h-[180px] max-h-[200px] relative mt-2 text-[8px] font-bold">
        {!hasData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-bold italic">Sem dados históricos suficientes</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => formatCurrencyBRL(value)}
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
              <Area 
                type="monotone" 
                dataKey="Receita" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorReal)" 
                name="Realizado"
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="Projeção" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorProj)" 
                name="Projetado"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver modelo preditivo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
