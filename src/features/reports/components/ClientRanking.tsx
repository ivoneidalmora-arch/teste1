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
    <Card className="h-auto w-full flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-white pb-4 border-b border-slate-50">
        <CardHeader 
          title="Ranking de Clientes" 
          subtitle="Performance por Volume Financeiro"
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
              <th className="text-left py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
              <th className="text-left py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Volume</th>
              <th className="text-left py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Categorias</th>
              <th className="text-right py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((client, index) => {
              const percentage = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
              const isWinner = index === 0;
              const categories = Object.entries(client.categories || {}).sort((a, b) => b[1] - a[1]);
              
              return (
                <tr key={client.name} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-1 align-top">
                    <span className={cn(
                      "w-5 h-5 flex items-center justify-center rounded text-[9px] font-black",
                      isWinner ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-2 px-1 align-top">
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-bold text-xs uppercase tracking-tight flex items-center gap-1",
                        isWinner ? "text-slate-900" : "text-slate-700"
                      )}>
                        {client.name}
                        {isWinner && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                      </span>
                      <div className="h-1 w-24 bg-slate-100 rounded-full mt-1 overflow-hidden">
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
                  <td className="py-2 px-1 align-top hidden md:table-cell">
                    <span className="text-[10px] text-slate-500 font-bold">
                      {client.count} <span className="text-slate-400 font-normal">vistorias</span>
                    </span>
                  </td>
                  <td className="py-2 px-1 align-top hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {categories.slice(0, 3).map(([name, count]) => (
                        <span key={name} className="px-1.5 py-0.5 bg-white border border-slate-100 rounded text-[8px] font-medium text-slate-500">
                          {count}x {name}
                        </span>
                      ))}
                      {categories.length > 3 && (
                        <span className="text-[8px] text-slate-400 pt-0.5">+{categories.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-1 align-top text-right">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900">{formatBRL(client.liquido)}</span>
                      <span className="text-[8px] text-slate-400 font-bold line-through opacity-0 group-hover:opacity-100 transition-opacity">
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
