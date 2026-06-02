"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';
import { getTopClients } from '@/lib/dashboard-metrics';
import { Transaction } from '@/core/types/finance';
import { parseISO, isAfter, subDays } from 'date-fns';
import { Icon3D } from '@/core/components/ui/Icon3D';

interface TopClientsCardProps {
  transactions: Transaction[];
  selectedPeriod: string;
  selectedYear: number;
}

export function TopClientsCard({ transactions, selectedPeriod, selectedYear }: TopClientsCardProps) {
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'last30' | 'year' | 'global'>('month');

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
      // Quando 'Tudo' está selecionado no card, e há um ano selecionado no dashboard global,
      // devemos respeitar o ano selecionado no dashboard global para bater com os KPIs globais,
      // a menos que o painel global estivesse em 'global' e sem ano, mas o FinanceContext
      // sempre tem um selectedYear. Vamos filtrar por selectedYear.
      list = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getFullYear() === selectedYear;
      });
    }

    return getTopClients(list);
  }, [transactions, filterPeriod, selectedPeriod, selectedYear]);

  const maxAmount = Math.max(...filteredClients.map(c => c.total), 1);

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon3D icon={Users} variant="purple" size="xs" />
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Top Clientes</h3>
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
        {filteredClients.slice(0, 4).map((client, index) => {
          const percentage = client.percentage; // Use the percentage calculated globally in getTopClients
          const barWidth = maxAmount > 0 ? (client.total / maxAmount) * 100 : 0; // Keep visual bar relative to max to look good
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
  );
}
