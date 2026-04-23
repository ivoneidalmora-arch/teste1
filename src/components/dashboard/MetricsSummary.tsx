import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatBRL, formatVar } from '@/utils/formatters';

interface Props {
  metrics: {
    currentIncome: number;
    incomeVariation: number;
    currentExpense: number;
    expenseVariation: number;
    currentBalance: number;
    balanceVariation: number;
  };
}

export function MetricsSummary({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card Receitas */}
      <div className="bg-white border-detran rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
          <ArrowUpRight className="w-24 h-24 text-brand-success translate-x-4 -translate-y-4" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-brand-success">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-sm">Receitas do Mês</h3>
            <p className="text-2xl font-bold text-slate-800">{formatBRL(metrics.currentIncome)}</p>
          </div>
        </div>
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
          metrics.incomeVariation >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        )}>
          {metrics.incomeVariation >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatVar(metrics.incomeVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
        </div>
      </div>

      {/* Card Despesas */}
      <div className="bg-white border-detran rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
          <ArrowDownRight className="w-24 h-24 text-brand-danger translate-x-4 -translate-y-4" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-brand-danger">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium text-sm">Despesas do Mês</h3>
            <p className="text-2xl font-bold text-slate-800">{formatBRL(metrics.currentExpense)}</p>
          </div>
        </div>
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
          metrics.expenseVariation <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        )}>
          {metrics.expenseVariation <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          {formatVar(metrics.expenseVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
        </div>
      </div>

      {/* Card Saldo Líquido */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-transparent rounded-2xl p-6 shadow-xl relative overflow-hidden group text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-300 font-medium text-sm">Saldo Líquido</h3>
            <p className="text-2xl font-bold text-white tracking-tight">{formatBRL(metrics.currentBalance)}</p>
          </div>
        </div>
        <div className={cn(
          "relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm",
          metrics.currentBalance >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
        )}>
          {metrics.balanceVariation >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatVar(metrics.balanceVariation)} <span className="font-normal opacity-70 ml-1">vs Mês Anterior</span>
        </div>
      </div>
    </div>
  );
}
