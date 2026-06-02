"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';
import { getTopClients } from '@/lib/dashboard-metrics';
import { Transaction } from '@/core/types/finance';
import { parseISO, isAfter, subDays } from 'date-fns';
import { Icon3D } from '@/core/components/ui/Icon3D';
import { AllClientsModal } from '../modals/AllClientsModal';
import { ExternalLink } from 'lucide-react';

interface TopClientsCardProps {
  transactions: Transaction[];
  selectedPeriod: string;
  selectedYear: number;
}

export function TopClientsCard({ transactions, selectedPeriod, selectedYear }: TopClientsCardProps) {
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'last30' | 'year' | 'global'>('month');
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    if (selectedPeriod === 'global') {
      setFilterPeriod('global');
    } else {
      setFilterPeriod('month');
    }
  }, [selectedPeriod]);

  const filteredClients = useMemo(() => {
    let list = [...transactions];
    const now = new Date();

    if (filterPeriod === 'month') {
      if (selectedPeriod !== 'global') {
        const monthNum = parseInt(selectedPeriod) - 1;
        list = transactions.filter(t => {
          const d = parseISO(t.date);
          return d.getFullYear() === selectedYear && d.getMonth() === monthNum;
        });
      } else {
        list = transactions.filter(t => {
          const d = parseISO(t.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
      }
    } else if (filterPeriod === 'last30') {
      const thirtyDaysAgo = subDays(now, 30);
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return isAfter(d, thirtyDaysAgo);
      });
    } else if (filterPeriod === 'year') {
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getFullYear() === selectedYear;
      });
    } else if (filterPeriod === 'global') {
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getFullYear() === selectedYear;
      });
    }

    return getTopClients(list);
  }, [transactions, filterPeriod, selectedPeriod, selectedYear]);

  const maxAmount = Math.max(...filteredClients.map(c => c.total), 1);

  // Filter list again to pass to modal (so modal doesn't have to re-filter by date, only by client)
  const modalTransactions = useMemo(() => {
    let list = [...transactions];
    const now = new Date();
    
    if (filterPeriod === 'month') {
      if (selectedPeriod !== 'global') {
        const monthNum = parseInt(selectedPeriod) - 1;
        list = transactions.filter(t => {
          const d = parseISO(t.date);
          return d.getFullYear() === selectedYear && d.getMonth() === monthNum;
        });
      } else {
        list = transactions.filter(t => {
          const d = parseISO(t.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
      }
    } else if (filterPeriod === 'last30') {
      const thirtyDaysAgo = subDays(now, 30);
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return isAfter(d, thirtyDaysAgo);
      });
    } else if (filterPeriod === 'year' || filterPeriod === 'global') {
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getFullYear() === selectedYear;
      });
    }
    return list;
  }, [transactions, filterPeriod, selectedPeriod, selectedYear]);

  return (
    <>
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon3D icon={Users} variant="purple" size="xs" />
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Top Clientes</h3>
          <button 
            onClick={() => setShowAllModal(true)}
            className="ml-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors border border-slate-100"
            title="Ver todos os clientes detalhadamente"
          >
            VER TODOS <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        
        <div className="relative w-auto min-w-[110px] h-7">
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="w-full h-full pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 shadow-sm outline-none transition hover:border-blue-600 focus:border-blue-600 appearance-none cursor-pointer"
          >
            <option value="month">Este mês</option>
            <option value="last30">Últimos 30 dias</option>
            <option value="year">Este ano</option>
            <option value="global">Tudo</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto flex-1 scrollbar-thin">
        {filteredClients.map((client, index) => {
          const percentage = client.percentage; 
          const barWidth = maxAmount > 0 ? (client.total / maxAmount) * 100 : 0; 
          
          return (
            <div key={index} className="group py-0.5 rounded-lg px-1 -mx-1 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-300 w-3">{index + 1}</span>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[11px] font-black truncate text-[#0F172A]">
                        {client.name}
                      </p>
                      <p className="text-[11px] font-black text-slate-900 shrink-0">
                        {formatBRL(client.total)}
                      </p>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-0.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)] bg-emerald-500"
                          style={{ width: `${barWidth}%` }}
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

        {filteredClients.length === 0 && (
          <div className="py-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sem dados</p>
          </div>
        )}
      </div>
    </div>
    
    <AllClientsModal 
      isOpen={showAllModal}
      onClose={() => setShowAllModal(false)}
      transactions={modalTransactions}
    />
    </>
  );
}
