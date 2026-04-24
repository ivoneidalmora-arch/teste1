"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/core/components/Card';
import { formatBRL } from '@/core/utils/formatters';

interface ChartData {
  name: string;
  value: number;
}

interface Props {
  data: ChartData[];
  type: 'income' | 'expense' | 'all';
}

const COLORS_INCOME = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const COLORS_EXPENSE = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];
const COLORS_ALL = ['#10b981', '#ef4444']; 

export function ReportChart({ data, type }: Props) {
  const safeData = data || [];
  
  if (safeData.length === 0) {
    return (
      <Card className="h-72 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Sem dados para o gráfico</p>
      </Card>
    );
  }

  const colors = type === 'income' ? COLORS_INCOME : (type === 'expense' ? COLORS_EXPENSE : COLORS_ALL);

  return (
    <Card className="h-80 w-full flex flex-col">
      <h3 className="text-slate-700 font-bold mb-4">
        {type === 'income' ? 'Distribuição de Receitas' : (type === 'expense' ? 'Impacto de Despesas' : 'Balanço (E/S)')}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              animationDuration={700}
            >
              {safeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length] || colors[0]} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value: any) => formatBRL(value)}
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
