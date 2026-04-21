"use client";

import { cn } from '@/utils/cn';
import { Trophy, Star, Users } from 'lucide-react';

interface ClientRankData {
  name: string;
  count: number;
  total: number;
  bruto: number;
  liquido: number;
}

interface ClientRankingProps {
  data: ClientRankData[];
}

export function ClientRanking({ data }: ClientRankingProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[440px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl p-6">
        <Users className="w-12 h-12 text-slate-200 mb-2" />
        <p className="text-slate-400 text-sm">Sem ranking disponível</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div className="h-[440px] w-full p-6 lg:p-8 bg-white border-detran rounded-2xl hover:shadow-xl transition-all duration-300 overflow-y-auto scrollbar-thin flex flex-col">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 z-10 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
             Ranking de Clientes
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.length} Clientes</span>
      </div>
      
      <div className="space-y-6">
        {data.map((client, index) => {
          const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
          const isWinner = index === 0;
          
          return (
            <div key={client.name} className="space-y-3 group bg-slate-50/30 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className={cn(
                    "font-bold text-xs uppercase tracking-wider flex items-center gap-2",
                    isWinner ? "text-brand-primary" : "text-slate-800"
                  )}>
                    <span className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-[10px] font-black">{index + 1}</span>
                    {isWinner && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                    {client.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium ml-7 mt-0.5">
                    {client.count} {client.count === 1 ? 'Vistoria Realizada' : 'Vistorias Realizadas'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-right">
                   <div>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.05em]">Bruto</p>
                     <p className="text-xs font-bold text-slate-500 line-through opacity-60">
                       {client.bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                     </p>
                   </div>
                   <div>
                     <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-[0.05em]">Líquido</p>
                     <p className="text-sm font-black text-slate-950">
                       {client.liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                     </p>
                   </div>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-white border border-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    isWinner 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                      : "bg-gradient-to-r from-slate-600 to-slate-800"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
