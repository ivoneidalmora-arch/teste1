import { TrendingUp, TrendingDown, DollarSign, Receipt, CreditCard, Activity } from 'lucide-react';
import { formatBRL, formatVar, cn } from '@/core/utils/formatters';

interface MetricsSummaryProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    totalGlobalBalance: number;
    currentIncome: number;
    incomeVariation: number;
    currentExpense: number;
    expenseVariation: number;
    currentBalance: number;
    balanceVariation: number;
    ticketMedio: number;
  };
}

export function MetricsSummary({ metrics }: MetricsSummaryProps) {
  // Garantia de objeto metrics seguro
  const m = metrics || {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    totalGlobalBalance: 0,
    currentIncome: 0,
    incomeVariation: 0,
    currentExpense: 0,
    expenseVariation: 0,
    currentBalance: 0,
    balanceVariation: 0,
    ticketMedio: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Saldo Geral - Destaque */}
      <div className="bg-slate-900 rounded-xl p-4 shadow-md border border-slate-800 overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-slate-800 rounded-lg text-white group-hover:bg-slate-700 transition-colors">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patrimônio</span>
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Saldo Geral</p>
          <h3 className="text-xl font-black text-white tracking-tighter">
            {formatBRL(m.totalGlobalBalance)}
          </h3>
        </div>
      </div>

      <MetricCard 
        title="Receita"
        value={m.currentIncome}
        variation={m.incomeVariation}
        icon={TrendingUp}
        color="emerald"
      />
      
      <MetricCard 
        title="Despesas"
        value={m.currentExpense}
        variation={m.expenseVariation}
        icon={TrendingDown}
        color="rose"
        inverse
      />

      <MetricCard 
        title="Lucro"
        value={m.currentBalance}
        variation={m.balanceVariation}
        icon={Activity}
        color="blue"
      />
    </div>
  );
}

function MetricCard({ title, value, variation, icon: Icon, color, inverse = false }: any) {
  const isPositive = variation >= 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" :
          color === 'rose' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100" :
          "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black",
          variation === 0 ? "bg-slate-50 text-slate-400" :
          isGood ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {variation !== 0 && (isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />)}
          {formatVar(variation)}
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-xl font-black text-slate-900 tracking-tighter">{formatBRL(value)}</p>
      </div>
    </div>
  );
}
