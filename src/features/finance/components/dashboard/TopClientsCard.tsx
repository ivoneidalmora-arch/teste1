"use client";

import { formatCurrency } from '@/lib/dashboard-metrics';

interface TopClient {
  name: string;
  total: number;
  count: number;
}

interface Props {
  clients: TopClient[];
}

export function TopClientsCard({ clients }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-[260px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Top Clientes
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Principais fontes de receita
          </p>
        </div>

        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Ver todos
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center flex flex-col items-center justify-center h-full min-h-[140px]">
            <p className="text-sm font-black text-slate-700">
              Nenhum cliente encontrado
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Os principais clientes aparecerão aqui conforme novas receitas forem registradas.
            </p>
          </div>
        ) : (
          clients.map((client, index) => (
            <div
              key={client.name}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors group cursor-pointer"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                    {client.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {client.count} lançamento(s)
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-sm font-black text-emerald-600">
                {formatCurrency(client.total)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
