"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ReportChartProps {
  data: ChartData[];
  type: 'income' | 'expense' | 'all';
}

const COLORS_INCOME = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const COLORS_EXPENSE = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];
const COLORS_ALL = ['#10b981', '#ef4444']; // Green for Income, Red for Expense

export function ReportChart({ data, type }: ReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl">
        <p className="text-slate-400 text-sm">Sem dados suficientes para o gráfico</p>
      </div>
    );
  }

  const colors = type === 'income' ? COLORS_INCOME : (type === 'expense' ? COLORS_EXPENSE : COLORS_ALL);

  const getTitle = () => {
    switch (type) {
      case 'income': return 'Distribuição de Receitas';
      case 'expense': return 'Impacto de Despesas';
      case 'all': return 'Balanço (Receitas vs Despesas)';
      default: return '';
    }
  };

  return (
    <div className="h-72 w-full p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300">
      <h3 className="text-slate-700 font-bold mb-2 ml-4">
        {getTitle()}
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}) : value}
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
