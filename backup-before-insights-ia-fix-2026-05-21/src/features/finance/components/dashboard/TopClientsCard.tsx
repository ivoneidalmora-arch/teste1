"use client";

import { ChevronDown } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';

interface ClientMetric {
  name: string;
  total: number;
}

interface TopClientsCardProps {
  clients: ClientMetric[];
  onSeeAll?: () => void;
}

import { Icon3D } from '@/core/components/ui/Icon3D';
import { Users } from 'lucide-react';

export function TopClientsCard({ clients }: TopClientsCardProps) {
  const maxAmount = Math.max(...clients.map(c => c.total), 1);

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon3D icon={Users} variant="purple" size="xs" />
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Top Clientes</h3>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Este mês</span>
           <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto flex-1 scrollbar-thin">
        {clients.slice(0, 4).map((client, index) => {
          const percentage = (client.total / maxAmount) * 100;
          return (
            <div key={index} className="group cursor-default py-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-300 w-3">{index + 1}</span>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[11px] font-black text-[#0F172A] truncate group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </p>
                      <p className="text-[11px] font-black text-slate-900 shrink-0">
                        {formatBRL(client.total)}
                      </p>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-0.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 w-8 text-right shrink-0">
                        {percentage.toFixed(1)}%
                      </span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {clients.length === 0 && (
          <div className="py-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sem dados</p>
          </div>
        )}
      </div>
    </div>
  );
}
