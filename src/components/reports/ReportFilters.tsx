import { Search } from 'lucide-react';
import { PlacaInput } from '@/components/ui/PlacaInput';
import { ReportFilter } from '@/hooks/useReports';

interface Props {
  filters: {
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    filterType: ReportFilter;
    setFilterType: (val: ReportFilter) => void;
    searchPlaca: string;
    setSearchPlaca: (val: string) => void;
    searchCliente: string;
    setSearchCliente: (val: string) => void;
  };
}

export function ReportFilters({ filters }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 border-detran hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Inicial</label>
          <input 
            type="date" 
            value={filters.startDate} 
            onChange={e => filters.setStartDate(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
          />
        </div>
        <div className="w-full md:w-1/5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Final</label>
          <input 
            type="date" 
            value={filters.endDate} 
            onChange={e => filters.setEndDate(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
          />
        </div>
        <div className="w-full md:w-1/5">
          <PlacaInput 
            label="Placa (Exata)"
            value={filters.searchPlaca}
            onChange={e => filters.setSearchPlaca(e.target.value)}
            className="px-3 py-2 text-sm"
          />
        </div>
        <div className="w-full md:w-1/5">
           <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente (Nome)</label>
           <input 
             type="text" 
             value={filters.searchCliente} 
             onChange={e => filters.setSearchCliente(e.target.value)} 
             placeholder="João Silva..." 
             className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
           />
        </div>
        <div className="w-full md:w-1/5">
           <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
           <select 
             value={filters.filterType} 
             onChange={e => filters.setFilterType(e.target.value as any)} 
             className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
           >
              <option value="all">Todas</option>
              <option value="income">Apenas Receitas</option>
              <option value="expense">Apenas Despesas</option>
           </select>
        </div>
      </div>
    </div>
  );
}
