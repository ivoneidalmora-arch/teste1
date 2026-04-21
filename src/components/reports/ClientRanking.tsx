"use client";

import { cn } from '@/utils/cn';
import { Trophy, Star, Users } from 'lucide-react';

interface ClientRankData {
  name: string;
  count: number;
  total: number;
  bruto: number;
  liquido: number;
  categories: Record<string, number>;
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

  // Memoize maxTotal for performance optimization
  const maxTotal = data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;

  return (
    <div className="h-[500px] w-full p-6 lg:p-8 bg-white border-detran rounded-2xl hover:shadow-xl transition-all duration-300 overflow-y-auto scrollbar-thin flex flex-col">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 z-10 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-500 animate-bounce-subtle" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
               Ranking de Clientes
            </h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Performance por Volume Financeiro</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
          {data.length} {data.length === 1 ? 'Cliente' : 'Clientes'}
        </span>
      </div>
      
      <div className="space-y-6">
        {data.map((client, index) => {
          const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
          const isWinner = index === 0;
          const categories = Object.entries(client.categories || {}).sort((a, b) => b[1] - a[1]);
          
          return (
            <div key={client.name} className="space-y-3 group bg-slate-50/30 p-4 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5 flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors",
                      isWinner 
                        ? "bg-brand-primary text-white shadow-lg shadow-blue-200" 
                        : "bg-white border border-slate-200 text-slate-500"
                    )}>
                      {index + 1}
                    </span>
                    <span className={cn(
                      "font-bold text-sm uppercase tracking-tight flex items-center gap-2",
                      isWinner ? "text-slate-900" : "text-slate-700"
                    )}>
                      {client.name}
                      {isWinner && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    </span>
                  </div>
                  
                  <div className="ml-8 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {client.count} {client.count === 1 ? 'Vistoria' : 'Vistorias'}
                    </span>
                    
                    {/* Detalhamento de vistorias */}
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(([name, count]) => (
                        <span key={name} className="px-2 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-semibold text-slate-500 shadow-sm">
                          {count}x <span className="text-slate-400 font-normal">{name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end pt-1">
                   <div className="text-right mb-2">
                     <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Líquido</p>
                     <p className="text-base font-black text-slate-950 leading-tight">
                       {client.liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                     </p>
                   </div>
                   <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Faturamento Bruto</p>
                     <p className="text-xs font-bold text-slate-400 line-through decoration-slate-300">
                       {client.bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                     </p>
                   </div>
                </div>
              </div>
              
              <div className="ml-8">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      isWinner 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[2px_0_10px_rgba(37,99,235,0.4)]" 
                        : "bg-gradient-to-r from-slate-400 to-slate-600"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
