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
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Fluxo de Caixa</h3>
          <p className="text-[10px] font-bold text-slate-400">Comparativo mensal de entradas e saídas</p>
        </div>
        
        <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
          {['Mensal', 'Semanal', 'Diário'].map((opt) => (
            <button 
              key={opt}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${
                opt === 'Mensal' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[300px]">
        {data.every(d => d.entradas === 0 && d.saidas === 0) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/30 rounded-xl border border-dashed border-slate-100">
            <p className="text-slate-400 text-xs font-bold">Sem dados para exibir</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                dy={5}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                tickFormatter={(val) => `R$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}
              />
              <Bar 
                name="Entradas" 
                dataKey="entradas" 
                fill="url(#colorEntradas)" 
                stroke="#10b981"
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
              <Bar 
                name="Saídas" 
                dataKey="saidas" 
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
              <Line 
                name="Saldo" 
                type="monotone" 
                dataKey="saldo" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 3, stroke: '#fff' }} 
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
