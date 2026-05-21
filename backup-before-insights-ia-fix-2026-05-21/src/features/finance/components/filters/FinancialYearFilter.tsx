"use client";

import { CalendarDays, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useFinanceContext } from '../../contexts/FinanceContext';
import { getAvailableYears } from '../../utils/financialFilters';

export function FinancialYearFilter() {
  const { transactions, selectedYear, setYear } = useFinanceContext();

  const years = useMemo(() => {
    return getAvailableYears(transactions || []);
  }, [transactions]);

  return (
    <div className="relative w-full sm:w-auto min-w-[120px] z-10">
      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <select
        value={selectedYear}
        onChange={(e) => setYear(parseInt(e.target.value))}
        className="w-full h-10 pl-9 pr-9 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm outline-none transition hover:border-blue-600 focus:border-blue-600 appearance-none cursor-pointer"
      >
        {years.map((year) => (
          <option key={year} value={year}>
             Ano {year}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}
