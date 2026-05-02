"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import { formatBRL } from '@/core/utils/formatters';
import { CashFlowData } from '../../types/dashboard.types';

interface Props {
  data: CashFlowData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xl ring-1 ring-slate-900/5">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{label}</p>
        <div className="space-y-2.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-bold text-slate-600">{item.name}</span>
              </div>
              <span className="text-sm font-black text-slate-900">{formatBRL(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data }: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Fluxo de Caixa</h3>
          <p className="text-sm font-semibold text-slate-400">Comparativo mensal de entradas e saídas</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['Mensal', 'Semanal', 'Diário'].map((opt) => (
            <button 
              key={opt}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                opt === 'Mensal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              tickFormatter={(val) => `R$ ${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}
            />
            <Bar 
              name="Entradas" 
              dataKey="entradas" 
              fill="url(#colorEntradas)" 
              radius={[6, 6, 0, 0]} 
              barSize={32}
            />
            <Bar 
              name="Saídas" 
              dataKey="saidas" 
              fill="url(#colorSaidas)" 
              radius={[6, 6, 0, 0]} 
              barSize={32}
            />
            <Line 
              name="Saldo" 
              type="monotone" 
              dataKey="saldo" 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
