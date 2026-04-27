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
          <tbody className="divide-y divide-slate-50">
            {data.map((client, index) => {
              const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
              const isWinner = index === 0;
              const categories = Object.entries(client.categories || {}).sort((a, b) => b[1] - a[1]);
              
              return (
                <tr key={client.name} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-1 px-1 align-middle">
                    <span className={cn(
                      "w-4 h-4 flex items-center justify-center rounded text-[8px] font-black",
                      isWinner ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-1 px-1 align-middle">
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-bold text-[11px] uppercase tracking-tight flex items-center gap-1",
                        isWinner ? "text-slate-900" : "text-slate-700"
                      )}>
                        {client.name}
                        {isWinner && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                      </span>
                      <div className="h-0.5 w-16 bg-slate-100 rounded-full mt-0.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            isWinner ? "bg-blue-600" : "bg-slate-400"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-1 px-1 align-middle hidden md:table-cell">
                    <span className="text-[9px] text-slate-500 font-bold">
                      {client.count}
                    </span>
                  </td>
                  <td className="py-1 px-1 align-middle hidden lg:table-cell">
                    <div className="flex flex-wrap gap-0.5">
                      {categories.slice(0, 2).map(([name, count]) => (
                        <span key={name} className="px-1 py-0 text-[7px] font-medium text-slate-400">
                          {count}x {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-1 px-1 align-middle text-right">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900">{formatBRL(client.liquido)}</span>
                      <span className="text-[7px] text-slate-300 font-bold line-through opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatBRL(client.bruto)}
                      </span>
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
