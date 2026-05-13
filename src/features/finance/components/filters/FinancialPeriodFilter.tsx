"use client";

import { Calendar, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useFinanceContext } from '../../contexts/FinanceContext';

export function FinancialPeriodFilter() {
  const context = useFinanceContext();
  
  const { selectedPeriod, setPeriod, availableMonths } = context;

  const monthOptions = useMemo(() => {
    return [
      { value: 'global', label: 'Tudo (Global) - DEBUG' },
      ...availableMonths.map(m => ({
        value: m.value,
        label: `${m.label} (${m.count})`
      }))
    ];
  }, [availableMonths]);

  if (!context) {
    return <div className="text-rose-500 text-[10px]">Erro: Contexto Financeiro não encontrado</div>;
  }


  return (
    <div className="relative w-full sm:w-auto min-w-[160px] z-10">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <select
        value={selectedPeriod || 'global'}
        onChange={(e) => setPeriod(e.target.value)}
        className="w-full h-10 pl-9 pr-9 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm outline-none transition hover:border-blue-600 focus:border-blue-600 appearance-none capitalize cursor-pointer"
      >
        {monthOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}
