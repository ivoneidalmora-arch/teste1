"use client";

import { cn } from '@/utils/cn';
import { Trophy, Star, Users } from 'lucide-react';

interface ClientRankData {
  name: string;
  count: number;
  total: number;
}

interface ClientRankingProps {
  data: ClientRankData[];
}

export function ClientRanking({ data }: ClientRankingProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl p-6">
        <Users className="w-12 h-12 text-slate-200 mb-2" />
        <p className="text-slate-400 text-sm">Sem ranking disponível</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div className="h-72 w-full p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="text-slate-700 font-bold">Ranking: Top Clientes</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((client, index) => {
          const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
          const isWinner = index === 0;
          
          return (
            <div key={client.name} className="space-y-1 group">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className={cn(
                    "font-bold text-[11px] uppercase tracking-wider flex items-center gap-1",
                    isWinner ? "text-brand-primary" : "text-slate-700"
                  )}>
                    {isWinner && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                    {index + 1}. {client.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {client.count} {client.count === 1 ? 'Vistoria' : 'Vistorias'} realizada(s)
                  </span>
                </div>
                <div className="text-right">
                   <div className="text-sm font-black text-slate-800">
                     {client.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                   </div>
                </div>
              </div>
              
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    isWinner 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                      : "bg-gradient-to-r from-slate-400 to-slate-500"
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
