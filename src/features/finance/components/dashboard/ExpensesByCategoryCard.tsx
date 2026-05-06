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
}

export function ExpensesByCategoryCard({ total, categories }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-[260px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Gastos por Categoria
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Distribuição de despesas
          </p>
        </div>

        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Ver todos
        </button>
      </div>

      <div className="flex-1">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center flex flex-col items-center justify-center h-full min-h-[140px]">
            <p className="text-sm font-black text-slate-700">
              Sem despesas no período
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              As categorias aparecerão aqui quando houver despesas registradas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Total de Gastos
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="group">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-slate-700 group-hover:text-slate-950 transition-colors">
                      {category.name}
                    </p>
                    <p className="shrink-0 text-sm font-black text-slate-950">
                      {formatCurrency(category.value)}
                    </p>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-1000"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
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
