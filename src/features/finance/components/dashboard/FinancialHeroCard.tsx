"use client";

import { Wallet, TrendingUp, CheckCircle2, Target, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { formatBRL } from '@/core/utils/formatters';

interface Props {
  balance: number;
  lastUpdate: string;
  variation: number;
}

const DECORATIVE_DATA = [
  { val: 400 }, { val: 700 }, { val: 500 }, { val: 900 }, 
  { val: 600 }, { val: 800 }, { val: 1000 }, { val: 700 }
];

export function FinancialHeroCard({ balance, lastUpdate, variation }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden mb-8 group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Lado Esquerdo: Saldo Principal */}
        <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Saldo Disponível</h2>
              <p className="text-[10px] font-bold text-slate-400">Atualizado em {lastUpdate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
              {formatBRL(balance)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                <TrendingUp className="w-4 h-4" />
                +{variation}%
              </span>
              <span className="text-slate-400 text-xs font-semibold">vs. mês anterior</span>
            </div>
          </div>
        </div>

        {/* Centro: Insights Rápidos */}
        <div className="lg:col-span-4 p-8 lg:p-10 bg-slate-50/30 flex flex-col justify-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Receitas em alta</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Suas entradas cresceram 12% na última semana.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Meta de Lucro</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Você atingiu 84% da sua meta mensal projetada.</p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Gráfico Decorativo */}
        <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
            <BarChart3 className="w-6 h-6" />
          </div>
          
          <div className="w-full h-32 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DECORATIVE_DATA}>
                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                  {DECORATIVE_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === DECORATIVE_DATA.length - 1 ? '#2563eb' : '#e2e8f0'} 
                      className="transition-all duration-500"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Atividade Semanal</p>
        </div>

      </div>
    </div>
  );
}
