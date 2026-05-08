"use client";

import { Trophy, Star, Users } from 'lucide-react';
import { Card, CardHeader } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';

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
      <Card className="h-auto flex flex-col items-center justify-center py-12">
        <Users className="w-12 h-12 text-slate-200 mb-2" />
        <p className="text-slate-400 text-sm">Sem ranking disponível</p>
      </Card>
    );
  }

  const maxTotal = data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;

  return (
    <Card className="h-auto w-full flex flex-col p-2.5">
      <div className="flex items-center justify-between mb-3 bg-white pb-2 border-b border-slate-50">
        <CardHeader 
          title="Ranking de Clientes" 
          subtitle="Top Performance"
          icon={Trophy}
        />
        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
          {data.length} {data.length === 1 ? 'Cliente' : 'Clientes'}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-1 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-6">#</th>
              <th className="text-left py-1 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-1 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Vol</th>
              <th className="text-left py-1 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Cats</th>
              <th className="text-right py-1 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {data.map((client, index) => {
              const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
              const isWinner = index === 0;
              const categories = Object.entries(client.categories || {}).sort((a, b) => b[1] - a[1]);
              
              return (
                <tr key={client.name} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="py-2 px-1 align-middle">
                    <div className={cn(
                      "w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-black transition-all",
                      isWinner 
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm shadow-amber-200 rotate-3 group-hover:rotate-0" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-2 px-1 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-bold text-[11px] uppercase tracking-tight flex items-center gap-1",
                          isWinner ? "text-slate-900" : "text-slate-700 group-hover:text-brand-primary transition-colors"
                        )}>
                          {client.name}
                        </span>
                        {isWinner && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border border-slate-50">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000 ease-out",
                              isWinner ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-blue-400 to-blue-600"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-1 align-middle hidden md:table-cell">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black text-slate-700 leading-none">{client.count}</span>
                      <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">Vistorias</span>
                    </div>
                  </td>
                  <td className="py-2 px-1 align-middle hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {categories.slice(0, 2).map(([name, count]) => (
                        <div key={name} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[7px] font-bold text-slate-500 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                          <span className="text-brand-primary">{count}x</span>
                          <span className="opacity-70">{name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-1 align-middle text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                        {formatBRL(client.liquido)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                        <span className="text-[8px] text-slate-400 font-bold line-through decoration-slate-300">
                          {formatBRL(client.bruto)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
