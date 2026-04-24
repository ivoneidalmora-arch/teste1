"use client";

import { Search, Filter, Calendar } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { cn } from '@/core/utils/formatters';

interface Props {
  filters: {
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    filterType: 'all' | 'income' | 'expense';
    setFilterType: (v: 'all' | 'income' | 'expense') => void;
    searchPlaca: string;
    setSearchPlaca: (v: string) => void;
    searchCliente: string;
    setSearchCliente: (v: string) => void;
  };
}

export function ReportFilters({ filters }: Props) {
  return (
    <Card className="p-4 bg-slate-50/50 border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Filtro de Tipo */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => filters.setFilterType(type)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                filters.filterType === type 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {type === 'all' ? 'Todos' : (type === 'income' ? 'Receitas' : 'Despesas')}
            </button>
          ))}
        </div>

        {/* Busca por Placa/Cliente */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por Placa ou Cliente..."
            value={filters.searchPlaca || filters.searchCliente}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 7 && /^[A-Z0-9]*$/.test(val.toUpperCase())) {
                filters.setSearchPlaca(val.toUpperCase());
                filters.setSearchCliente('');
              } else {
                filters.setSearchCliente(val.toUpperCase());
                filters.setSearchPlaca('');
              }
            }}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-2 lg:col-span-2">
           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => filters.setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-2 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
           </div>
           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => filters.setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-2 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
           </div>
        </div>

      </div>
    </Card>
  );
}
