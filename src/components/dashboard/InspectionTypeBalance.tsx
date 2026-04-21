"use client";

import { cn } from '@/utils/cn';
import { ClipboardCheck, TrendingUp } from 'lucide-react';

interface InspectionData {
  name: string;
  count: number;
  total: number;
}

interface InspectionTypeBalanceProps {
  data: InspectionData[];
}

export function InspectionTypeBalance({ data }: InspectionTypeBalanceProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <ClipboardCheck className="w-12 h-12 text-slate-100 mb-4" />
        <p className="text-slate-400 text-sm font-medium">Nenhuma vistoria neste período</p>
      </div>
    );
  }

  const grandTotal = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="bg-white border-detran rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 flex items-center gap-2">
          Balanço por Tipo
        </h3>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
          {data.reduce((acc, curr) => acc + curr.count, 0)} Laudos
        </span>
      </div>
      
      <div className="space-y-6 flex-1">
        {data.map((item) => {
          const percentage = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;
          
          return (
            <div key={item.name} className="space-y-2 group">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.count} Unidades realizadas
                  </span>
                </div>
                <div className="text-right">
                   <div className="text-sm font-black text-slate-800">
                     {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                   </div>
                   <div className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                     <TrendingUp className="w-2 h-2" />
                     {percentage.toFixed(1)}%
                   </div>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all duration-1000 group-hover:bg-blue-600"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50">
         <div className="flex justify-between items-center bg-slate-900 rounded-xl p-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Líquido</span>
            <span className="text-xl font-black">{grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>
         </div>
      </div>
    </div>
  );
}
