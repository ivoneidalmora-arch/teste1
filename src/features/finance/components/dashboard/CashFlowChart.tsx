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
  data: any[];
  title?: string;
  subtitle?: string;
  mode?: "daily" | "monthly";
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

import { Icon3D } from '@/core/components/ui/Icon3D';
import { BarChart3 } from 'lucide-react';

export function CashFlowChart({ data, title, subtitle, mode }: Props) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <Icon3D icon={BarChart3} variant="blue" size="sm" />
          <div>
            <h3 className="text-base font-black text-[#0F172A] tracking-tight">{title || "Fluxo de Caixa (Global)"}</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtitle || "Comparativo mensal consolidado de entradas e saídas"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saídas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo</span>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 min-h-0">
        {data.every(d => d.entradas === 0 && d.saidas === 0) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-100">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sem dados para o período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(val) => `R$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
              
              <Bar 
                name="Entradas" 
                dataKey="entradas" 
                fill="#10B981" 
                radius={[6, 6, 0, 0]} 
                barSize={12}
              />
              <Bar 
                name="Saídas" 
                dataKey="saidas" 
                fill="#E11D48" 
                radius={[6, 6, 0, 0]} 
                barSize={12}
              />
              <Line 
                name="Saldo" 
                type="monotone" 
                dataKey="saldo" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

