"use client";

import { PlusCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/dashboard-metrics';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  value: number;
  type: 'income' | 'expense';
}

interface Props {
  events: CalendarEvent[];
}

export function FinancialCalendarCard({ events }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col min-h-[260px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Agenda Financeira
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Próximos compromissos
          </p>
        </div>

        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Ver todos
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center flex flex-col items-center justify-center h-full min-h-[140px]">
            <p className="text-sm font-black text-slate-700">
              Sem eventos este mês
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Despesas pendentes e receitas previstas aparecerão aqui.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors group cursor-pointer"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  {formatDate(event.date)}
                </p>
              </div>

              <p className={`shrink-0 text-sm font-black ${event.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                {event.type === 'income' ? '+' : ''}{formatCurrency(event.value)}
              </p>
            </div>
          ))
        )}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
        <PlusCircle className="h-4 w-4" />
        Agendar compromisso
      </button>
    </div>
  );
}
