"use client";

import { ChevronDown } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';

interface ClientMetric {
  name: string;
  totalAmount: number;
}

interface TopClientsCardProps {
  clients: ClientMetric[];
  onSeeAll?: () => void;
}

import { Icon3D } from '@/core/components/ui/Icon3D';
import { Users } from 'lucide-react';

export function TopClientsCard({ clients }: TopClientsCardProps) {
  const maxAmount = Math.max(...clients.map(c => c.totalAmount), 1);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Icon3D icon={Users} variant="purple" size="sm" />
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Top Clientes</h3>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Este mês</span>
           <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="space-y-6">
        {clients.slice(0, 5).map((client, index) => {
          const percentage = (client.totalAmount / maxAmount) * 100;
          return (
            <div key={index} className="group cursor-default">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs font-black text-slate-300 w-4">{index + 1}</span>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between gap-4 mb-1.5">
                      <p className="text-[13px] font-black text-[#0F172A] truncate group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </p>
                      <p className="text-[13px] font-black text-slate-900 shrink-0">
                        {formatBRL(client.totalAmount)}
                      </p>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 w-10 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {clients.length === 0 && (
          <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem clientes no período</p>
          </div>
        )}
      </div>
    </div>
  );
}
