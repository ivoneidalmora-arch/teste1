"use client";

import { CalendarDays, ChevronRight, PlusCircle } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { CalendarEvent } from '../../types/dashboard.types';
import { cn } from '@/core/utils/formatters';

interface Props {
  events: CalendarEvent[];
}

export function FinancialCalendarCard({ events }: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Calendário Financeiro</h3>
        </div>
        <button className="text-xs font-bold text-brand-primary hover:underline">Ver agenda</button>
      </div>

      <div className="space-y-4 flex-1">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Maio</span>
              <span className="text-sm font-black text-slate-900 leading-none">{event.date.split('-')[2]}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{event.title}</h4>
              <p className={cn(
                "text-xs font-black",
                event.type === 'income' ? "text-emerald-600" : "text-rose-600"
              )}>
                {event.type === 'income' ? '+' : '-'} {formatBRL(event.amount)}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
          </div>
        ))}
      </div>

      <button className="mt-8 py-3 w-full border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-bold">
        <PlusCircle className="w-4 h-4" />
        Agendar compromisso futuro
      </button>
    </div>
  );
}
