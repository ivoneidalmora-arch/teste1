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
  onSeeAll?: () => void;
}

export function FinancialCalendarCard({ events, onSeeAll }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-[#0F172A]">
            Agenda Financeira
          </h2>
          <p className="text-[10px] font-bold text-slate-400">
            Próximos compromissos
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
        {events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-2">
               <PlusCircle className="w-4 h-4" />
            </div>
            <p className="text-slate-400 text-[10px] font-bold">Sem eventos este mês</p>
          </div>
        ) : (
          events.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/50 p-2 hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black text-[#0F172A] group-hover:text-blue-600 transition-colors leading-tight">
                  {event.title}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  {formatDate(event.date)}
                </p>
              </div>

              <p className={`shrink-0 text-[11px] font-black ${event.type === 'income' ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                {event.type === 'income' ? '+' : ''}{formatCurrency(event.value)}
              </p>
            </div>
          ))
        )}
      </div>

      <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-400 transition hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-600">
        <PlusCircle className="h-3.5 w-3.5" />
        Agendar compromisso
      </button>
    </div>
  );
}
