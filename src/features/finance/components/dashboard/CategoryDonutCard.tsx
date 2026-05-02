"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatBRL } from '@/core/utils/formatters';
import { CategoryDistribution } from '../../types/dashboard.types';

interface Props {
  data: CategoryDistribution[];
  totalValue: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xl">
        {payload[0].name}: {formatBRL(payload[0].value)}
      </div>
    );
  }
  return null;
};

export function CategoryDonutCard({ data, totalValue }: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8">Gastos por Categoria</h3>

      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centro do Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
          <span className="text-xl font-black text-slate-900">{formatBRL(totalValue)}</span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-bold text-slate-600">{item.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900">
              {((item.value / totalValue) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
