"use client";

import { formatCurrency } from '@/lib/dashboard-metrics';

interface Category {
  name: string;
  value: number;
  percentage: number;
}

interface Props {
  total: number;
  categories: Category[];
  onSeeAll?: () => void;
}

export function ExpensesByCategoryCard({ total, categories, onSeeAll }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[#0F172A]">
            Gastos por Categoria
          </h2>
          <p className="text-[10px] font-bold text-slate-400">
            Distribuição de despesas
          </p>
        </div>

        <button 
          onClick={onSeeAll}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Ver todos
        </button>
      </div>

      <div className="flex-1">
        {categories.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6 text-center">
            <p className="text-slate-400 text-[10px] font-bold">Sem despesas</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-4 rounded-xl bg-slate-50/50 p-3 border border-slate-50">
              <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                TOTAL DE GASTOS
              </p>
              <p className="text-xl font-black text-[#0F172A]">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="space-y-3">
              {categories.slice(0, 3).map((category) => (
                <div key={category.name} className="group">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-slate-600 group-hover:text-[#0F172A] transition-colors leading-tight">
                      {category.name}
                    </p>
                    <p className="shrink-0 text-[11px] font-black text-[#0F172A]">
                      {formatCurrency(category.value)}
                    </p>
                  </div>

                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#E11D48] transition-all duration-1000"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="mt-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      {category.percentage.toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
