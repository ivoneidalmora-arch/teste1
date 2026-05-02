"use client";

import { User, ChevronRight } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { TopClient } from '../../types/dashboard.types';

interface Props {
  clients: TopClient[];
}

export function TopClientsCard({ clients }: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Top Clientes</h3>
        <button className="text-xs font-bold text-brand-primary hover:underline">Ver ranking</button>
      </div>

      <div className="space-y-6 flex-1">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all overflow-hidden border-2 border-white shadow-sm">
                {client.avatar ? (
                  <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">{client.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${client.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{client.percentage}%</span>
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-black text-slate-900">{formatBRL(client.amount)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          Análise Completa de Clientes <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
