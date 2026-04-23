import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, Calendar, Plus, Minus, RefreshCcw } from 'lucide-react';
import { ImportButton } from '@/components/ImportButton';

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
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900 tracking-tight flex items-center gap-2">
          Dashboard Financeiro <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 leading-none">v3.5 (Smart Key)</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-500 relative group">
          <Calendar className="w-4 h-4" />
          <select 
            value={format(selectedDate, 'yyyy-MM')}
            onChange={(e) => {
              if (!e.target.value) return;
              const [year, month] = e.target.value.split('-');
              setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
            }}
            className="appearance-none bg-transparent border-none p-0 pr-6 font-semibold focus:ring-0 cursor-pointer hover:text-slate-700 transition-colors capitalize outline-none"
          >
            {availableMonths.length === 0 ? (
              <option value="">Sem lançamentos</option>
            ) : (
              availableMonths.map(m => {
                let label = m;
                try {
                  label = format(parseISO(`${m}-01`), 'MMMM yyyy', { locale: ptBR });
                } catch (e) {
                  label = m;
                }
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })
            )}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-0 pointer-events-none opacity-50" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <ImportButton onSuccess={onRefresh} className="flex-1 sm:flex-none" />
        
        <button 
          onClick={onNewDespesa}
          className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition-colors border border-rose-100"
        >
          <Minus className="w-4 h-4" />
          <span className="text-sm">Despesa</span>
        </button>
        
        <button 
          onClick={onNewVistoria}
          className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 px-5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Nova Vistoria</span>
        </button>

        <button 
          onClick={onRefresh}
          className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          title="Atualizar Dados"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
