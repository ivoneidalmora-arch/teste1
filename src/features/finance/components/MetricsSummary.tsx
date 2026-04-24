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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Saldo Geral - Destaque */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Activity className="w-12 h-12 text-white" />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Saldo Geral Acumulado</p>
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-black text-white tracking-tighter">
            {formatBRL(m.totalGlobalBalance)}
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Patrimônio Líquido Atual</span>
        </div>
      </div>

      <MetricCard 
        title="Receita do Mês"
        value={m.currentIncome}
        variation={m.incomeVariation}
        icon={TrendingUp}
        color="emerald"
      />
      
      <MetricCard 
        title="Despesas do Mês"
        value={m.currentExpense}
        variation={m.expenseVariation}
        icon={TrendingDown}
        color="rose"
        inverse
      />

      <MetricCard 
        title="Lucro no Mês"
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" :
          color === 'rose' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100" :
          "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black",
          variation === 0 ? "bg-slate-50 text-slate-400" :
          isGood ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {variation !== 0 && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {formatVar(variation)}
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatBRL(value)}</p>
      </div>
    </div>
  );
}
