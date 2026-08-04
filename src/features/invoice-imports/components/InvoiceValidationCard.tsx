import { formatBRL, cn } from '@/core/utils/formatters';

interface Props {
  summary: {
    totalItems: number;
    validItems: number;
    errorItems: number;
    noPlateItems: number;
    totalValue: number;
    readyToSave: number;
  };
}

export function InvoiceValidationCard({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Encontradas</p>
        <h3 className="text-4xl font-black">{summary.totalItems}</h3>
      </div>
      
      <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Prontas para Salvar</p>
        <h3 className="text-4xl font-black">{summary.readyToSave}</h3>
      </div>

      <div className={cn(
        "p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group transition-colors",
        summary.errorItems > 0 ? "bg-rose-600" : "bg-slate-800"
      )}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Com Erro</p>
        <h3 className="text-4xl font-black">{summary.errorItems}</h3>
      </div>

      <div className={cn(
        "p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group transition-colors",
        summary.noPlateItems > 0 ? "bg-orange-500" : "bg-slate-800"
      )}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Sem Placa</p>
        <h3 className="text-4xl font-black">{summary.noPlateItems}</h3>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor Total</p>
        <h3 className="text-2xl font-black text-slate-900 truncate" title={formatBRL(summary.totalValue)}>
          {formatBRL(summary.totalValue)}
        </h3>
      </div>
    </div>
  );
}
