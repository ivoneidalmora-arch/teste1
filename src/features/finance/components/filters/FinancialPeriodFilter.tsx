"use client";

import { Calendar, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useFinanceContext } from '../../contexts/FinanceContext';

export function FinancialPeriodFilter() {
  // Use try-catch or check if context exists to avoid crashing if used outside provider
  let context;
  try {
    context = useFinanceContext();
  } catch (e) {
    return <div className="text-rose-500 text-[10px]">Erro: Contexto Financeiro não encontrado</div>;
  }

  const { selectedPeriod, availableMonths, setPeriod } = context;

  const monthOptions = useMemo(() => {
    const options = [
      { value: 'global', label: 'Tudo (Global)' }
    ];

    if (Array.isArray(availableMonths)) {
      availableMonths.forEach(monthStr => {
        try {
          const parts = monthStr.split('-');
          if (parts.length === 2) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const d = new Date(year, month - 1, 1);
            options.push({
              value: monthStr,
              label: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
            });
          }
        } catch (err) {
          console.error('Erro ao processar mês:', monthStr);
        }
      });
    }

    return options;
  }, [availableMonths]);

  return (
    <div className="relative w-full sm:w-auto min-w-[200px] z-10">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <select
        value={selectedPeriod || 'global'}
        onChange={(e) => setPeriod(e.target.value)}
        className="w-full h-11 pl-10 pr-10 bg-white border-2 border-slate-200 rounded-xl text-sm font-black text-slate-700 shadow-md outline-none transition hover:border-brand-primary focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 appearance-none capitalize cursor-pointer"
      >
        {monthOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}
