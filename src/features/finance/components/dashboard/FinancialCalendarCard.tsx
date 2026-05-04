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
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-bold">Sem eventos este mês</p>
            <p className="text-slate-400 text-xs font-semibold">Suas próximas receitas e despesas aparecerão aqui.</p>
          </div>
        ) : (
          events.map((event) => {
            const date = new Date(event.date + 'T12:00:00');
            const day = date.getDate();
            const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

            return (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-tight">{month}</span>
                  <span className="text-sm font-black text-slate-900 leading-none">{day}</span>
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
            );
          })
        )}
      </div>

      <button className="mt-8 py-3 w-full border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 text-xs font-bold">
        <PlusCircle className="w-4 h-4" />
        Agendar compromisso futuro
      </button>
    </div>
  );
}
