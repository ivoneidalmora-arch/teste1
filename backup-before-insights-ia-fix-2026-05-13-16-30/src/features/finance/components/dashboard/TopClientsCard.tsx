"use client";

import { formatCurrency } from '@/lib/dashboard-metrics';

interface TopClient {
  name: string;
  total: number;
  count: number;
}

interface Props {
  clients: TopClient[];
  onSeeAll?: () => void;
}

export function TopClientsCard({ clients, onSeeAll }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[#0F172A]">
            Top Clientes
          </h2>
          <p className="text-[10px] font-bold text-slate-400">
            Principais fontes de receita
          </p>
        </div>

        <button 
          onClick={onSeeAll}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Ver todos
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {clients.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6 text-center">
            <p className="text-slate-400 text-[10px] font-bold">Sem dados</p>
          </div>
        ) : (
          clients.slice(0, 5).map((client, index) => (
            <div
              key={client.name}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/50 p-2 hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-black text-blue-600">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-black text-[#0F172A] group-hover:text-blue-600 transition-colors leading-tight">
                    {client.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                    {client.count} lanç.
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-[11px] font-black text-emerald-600">
                {formatCurrency(client.total)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
