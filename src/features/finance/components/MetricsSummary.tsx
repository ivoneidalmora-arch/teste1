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
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-2.5 shadow-xl border border-slate-800 overflow-hidden group relative">
        <div className="flex justify-between items-start mb-0.5 relative z-10">
          <div className="p-1 bg-white/10 rounded text-white group-hover:bg-white/20 transition-all group-hover:scale-110">
            <Activity className="w-3 h-3" />
          </div>
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-80">Patrimônio</span>
        </div>
        <div className="relative z-10">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-0 opacity-60">Saldo Geral</p>
          <h3 className="text-base font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
            {formatBRL(m.totalGlobalBalance)}
          </h3>
        </div>
        
        {/* Background glow effect */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700" />
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

interface MetricCardProps {
  title: string;
  value: number;
  variation: number;
  icon: React.ElementType;
  color: 'emerald' | 'rose' | 'blue';
  inverse?: boolean;
}

function MetricCard({ title, value, variation, icon: Icon, color, inverse = false }: MetricCardProps) {
  const isPositive = variation >= 0;
  const isGood = inverse ? !isPositive : isPositive;

  return (
    <div className={cn(
      "bg-white rounded-xl p-2.5 border border-slate-100 transition-all duration-300 group relative overflow-hidden",
      color === 'emerald' ? "hover:shadow-lg hover:shadow-emerald-100/50" :
      color === 'rose' ? "hover:shadow-lg hover:shadow-rose-100/50" :
      "hover:shadow-lg hover:shadow-blue-100/50"
    )}>
      <div className="flex justify-between items-start mb-1 relative z-10">
        <div className={cn(
          "p-1 rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100" :
          color === 'rose' ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" :
          "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-tighter",
          variation === 0 ? "bg-slate-50 text-slate-400" :
          isGood ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {variation !== 0 && (isPositive ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />)}
          {formatVar(variation)}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-0 opacity-70">{title}</p>
        <p className="text-base font-black text-slate-900 tracking-tighter group-hover:text-brand-primary transition-colors">{formatBRL(value)}</p>
      </div>

      {/* Decorative background element */}
      <div className={cn(
        "absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500",
        color === 'emerald' ? "bg-emerald-600" :
        color === 'rose' ? "bg-rose-600" :
        "bg-blue-600"
      )} />
    </div>
  );
}
