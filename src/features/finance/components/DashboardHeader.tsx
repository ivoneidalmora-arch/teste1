import { Plus, ChevronDown, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/core/utils/formatters';

interface Props {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  availableMonths: string[];
  onNewVistoria: () => void;
  onNewDespesa: () => void;
  onRefresh: () => void;
}

export function DashboardHeader({ 
  selectedDate, 
  setSelectedDate, 
  availableMonths, 
  onNewVistoria, 
  onNewDespesa,
  onRefresh 
}: Props) {
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [year, month] = val.split('-');
    setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900 tracking-tight">
          Dashboard Financeiro
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="relative flex items-center">
            <select 
              value={format(selectedDate, 'yyyy-MM')}
              onChange={handleMonthChange}
              className="appearance-none bg-transparent pr-6 py-0.5 text-slate-500 font-medium cursor-pointer outline-none focus:text-brand-primary transition-colors"
            >
              {availableMonths.map(m => {
                let label = m;
                try {
                  label = format(parseISO(`${m}-01`), 'MMMM yyyy', { locale: ptBR });
                } catch (e) { label = m; }
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-0 pointer-events-none opacity-50" />
          </div>
          <button onClick={onRefresh} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-brand-primary">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={onNewDespesa}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
        <button 
          onClick={onNewVistoria}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Laudo
        </button>
      </div>
    </div>
  );
}
