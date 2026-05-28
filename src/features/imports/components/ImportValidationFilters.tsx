import { Search, Filter } from 'lucide-react';
import { FilterStatus } from '../hooks/useImportValidation';
import { cn } from '@/core/utils/formatters';

interface ImportValidationFiltersProps {
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function ImportValidationFilters({
  filter, setFilter, searchQuery, setSearchQuery
}: ImportValidationFiltersProps) {
  
  const options: { value: FilterStatus, label: string, color: string }[] = [
    { value: 'all', label: 'Todos', color: 'bg-slate-100 text-slate-600' },
    { value: 'valid', label: 'Válidos', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'invalid', label: 'Inconsistentes', color: 'bg-rose-100 text-rose-700' },
    { value: 'duplicate', label: 'Duplicados', color: 'bg-orange-100 text-orange-700' },
    { value: 'corrected', label: 'Corrigidos', color: 'bg-blue-100 text-blue-700' },
    { value: 'manual_approved', label: 'Aprovados', color: 'bg-purple-100 text-purple-700' },
    { value: 'ignored', label: 'Ignorados', color: 'bg-slate-200 text-slate-500' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar placa, cliente, valor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2 mr-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
        </div>
        
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              filter === opt.value 
                ? `${opt.color} ring-2 ring-offset-1 ring-current shadow-sm` 
                : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
