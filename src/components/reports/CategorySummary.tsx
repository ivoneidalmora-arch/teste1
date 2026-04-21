"use client";

import { cn } from '@/utils/cn';

interface ChartData {
  name: string;
  value: number;
}

interface CategorySummaryProps {
  data: ChartData[];
  type: 'income' | 'expense' | 'all';
  totalValue: number;
}

export function CategorySummary({ data, type, totalValue }: CategorySummaryProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white border border-slate-100 rounded-2xl">
        <p className="text-slate-400 text-sm">Sem dados agrupáveis</p>
      </div>
    );
  }

  const getTitle = () => {
    switch (type) {
      case 'income': return 'Top Receitas (Ranking)';
      case 'expense': return 'Top Gastos (Ranking)';
      case 'all': return 'Resumo do Balanço';
      default: return '';
    }
  };

  return (
    <div className="h-72 w-full p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-y-auto scrollbar-thin">
      <h3 className="text-slate-700 font-bold mb-4">
        {getTitle()}
      </h3>
      
      <div className="space-y-5">
        {data.map((item, index) => {
          const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          const isIncomeItem = type === 'income' || (type === 'all' && item.name === 'Receitas');
          
          return (
            <div key={index} className="space-y-1 group">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors uppercase text-[11px] tracking-wider">
                  {type === 'all' ? item.name : `${index + 1}. ${item.name}`}
                </span>
                <span className={cn(
                  "font-bold",
                  isIncomeItem ? "text-emerald-600" : "text-rose-600"
                )}>
                  {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    isIncomeItem ? "bg-gradient-to-r from-emerald-500 to-green-400" : "bg-gradient-to-r from-rose-500 to-red-400"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">{percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
