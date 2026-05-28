import { ImportSummary } from '../types/import.types';
import { formatBRL, cn } from '@/core/utils/formatters';

interface ImportValidationCardProps {
  summary: ImportSummary;
}

export function ImportValidationCard({ summary }: ImportValidationCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total de Itens</p>
        <h3 className="text-4xl font-black">{summary.totalItems}</h3>
      </div>
      
      <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Prontos para Salvar</p>
        <h3 className="text-4xl font-black">{summary.readyToSave}</h3>
      </div>

      <div className={cn(
        "p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group transition-colors",
        summary.invalidItems > 0 ? "bg-rose-600" : "bg-slate-800"
      )}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Inconsistentes</p>
        <h3 className="text-4xl font-black">{summary.invalidItems}</h3>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor Bruto Total</p>
        <h3 className="text-3xl font-black text-slate-900 truncate" title={formatBRL(summary.grossTotal)}>
          {formatBRL(summary.grossTotal)}
        </h3>
      </div>
    </div>
  );
}
