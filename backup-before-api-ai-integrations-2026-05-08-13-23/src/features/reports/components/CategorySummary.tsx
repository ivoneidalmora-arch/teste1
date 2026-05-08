"use client";

import { Card } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';

interface Props {
  data: { name: string, value: number }[];
  type: 'income' | 'expense' | 'all';
  totalValue: number;
}

export function CategorySummary({ data, type, totalValue }: Props) {
  return (
    <Card className="h-80 w-full flex flex-col">
      <h3 className="text-slate-700 font-bold mb-4">Detalhamento por Categoria</h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {data.map((item) => {
          const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 truncate mr-2">{item.name}</span>
                <span className="text-slate-900">{formatBRL(item.value)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    type === 'income' ? "bg-emerald-500" : (type === 'expense' ? "bg-rose-500" : "bg-blue-500")
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
