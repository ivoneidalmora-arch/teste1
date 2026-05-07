"use client";

import { 
  format, 
  isSameDay, 
  isSameMonth, 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/core/utils/formatters';
import { CalendarEvent } from '../types/calendar.types';

interface Props {
  days: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  finance: '#2563eb',     // Blue
  appointment: '#059669', // Green
  pending: '#f97316',     // Orange
  reminder: '#7c3aed',    // Purple
  expense: '#e11d48',     // Red/Pink
  external: '#64748b',    // Slate
};

export function CalendarMonthGrid({ days, currentMonth, events, onDayClick }: Props) {
  return (
    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
      {days.map((day, idx) => {
        const dayEvents = events.filter(e => isSameDay(new Date(e.start_at), day));
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, currentMonth);

        // Prioritization: Municipal > State > National > Google
        const sortedEvents = [...dayEvents].sort((a, b) => {
          const priority = { municipal: 1, state: 2, national: 3, google: 4, site: 5 };
          // For now, mapping 'holiday' type to these priorities if we had them in types.
          // Since types are SaaS-focused, we'll use 'category'.
          return 0; // Simplified for now
        });

        return (
          <div 
            key={idx} 
            onClick={() => onDayClick(day)}
            className={cn(
              "border-b border-r border-slate-50 p-1 flex flex-col gap-0.5 hover:bg-slate-50/50 transition-all cursor-pointer group relative min-h-[50px]",
              !isCurrentMonth && "bg-slate-50/10 opacity-30",
              idx % 7 === 6 && "border-r-0"
            )}
          >
            <span className={cn(
              "text-[10px] font-black ml-auto mr-1 transition-all",
              isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center -mr-0.5 -mt-0.5 shadow-md" : "text-slate-400 group-hover:text-slate-600"
            )}>
              {format(day, 'd')}
            </span>

            <div className="flex flex-wrap gap-0.5 mt-auto justify-center px-0.5 pb-1">
              {sortedEvents.slice(0, 4).map(event => (
                <div 
                  key={event.id}
                  className="w-1.5 h-1.5 rounded-full shadow-sm ring-1 ring-white"
                  style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category || 'external'] }}
                  title={event.title}
                />
              ))}
              {dayEvents.length > 4 && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 border border-white" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
