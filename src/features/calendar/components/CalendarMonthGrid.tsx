import { 
  format, 
  isSameMonth, 
} from 'date-fns';
import { cn } from '@/core/utils/formatters';
import { toLocalDateKey } from '../utils/date-key';
import type { CalendarEvent } from '../types/calendar.types';

interface Props {
  days: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date, events: CalendarEvent[]) => void;
}

const TYPE_COLORS: Record<string, { bg: string, text: string, border: string, label: string }> = {
  national: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Nacional' },
  state: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', label: 'Estadual' },
  municipal: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Municipal' },
  optional: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Ponto Fac.' },
  google: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Google' },
};

export function CalendarMonthGrid({ days, currentMonth, events, onDayClick }: Props) {
  const todayKey = toLocalDateKey(new Date());

  return (
    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
      {days.map((day, idx) => {
        const dayKey = toLocalDateKey(day);
        const dayEvents = events.filter(e => e.date === dayKey);
        
        // Também filtrar eventos com horário que caiam neste dia (usando o fuso de SP no servidor, aqui usamos local)
        // No entanto, o servidor já nos manda a dateKey correta para eventos Google all-day.
        // Para eventos Google com horário, precisamos checar se o start_at cai nesse dia.
        const timedEvents = events.filter(e => !e.allDay && e.start_at && toLocalDateKey(new Date(e.start_at)) === dayKey);
        
        const allDayEvents = [...dayEvents, ...timedEvents];

        const isToday = dayKey === todayKey;
        const isCurrentMonth = isSameMonth(day, currentMonth);

        // Prioridade visual: Nacional > Estadual > Municipal > Opcional > Google
        const sortedEvents = allDayEvents.sort((a, b) => {
          const priority: Record<string, number> = { national: 1, state: 2, municipal: 3, optional: 4, google: 5 };
          const pA = a.type ? priority[a.type] : 9;
          const pB = b.type ? priority[b.type] : 9;
          return pA - pB;
        });

        const hasHoliday = sortedEvents.some(e => ['national', 'state', 'municipal'].includes(e.type || ''));

        return (
          <div 
            key={idx} 
            onClick={() => onDayClick(day, sortedEvents)}
            className={cn(
              "border-b border-r border-slate-50 p-1 flex flex-col gap-1 hover:bg-slate-50/50 transition-all cursor-pointer group relative min-h-[80px]",
              !isCurrentMonth && "bg-slate-50/5 opacity-30",
              hasHoliday && isCurrentMonth && "bg-rose-50/10",
              idx % 7 === 6 && "border-r-0"
            )}
          >
            <div className="flex items-center justify-between mb-0.5">
               <div className="flex gap-0.5">
                 {hasHoliday && isCurrentMonth && (
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm" />
                 )}
                 {timedEvents.length > 0 && isCurrentMonth && (
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" />
                 )}
               </div>
               <span className={cn(
                "text-[10px] font-black transition-all",
                isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {format(day, 'd')}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 overflow-hidden">
              {sortedEvents.slice(0, 3).map(event => {
                const colors = TYPE_COLORS[event.type || ''] || TYPE_COLORS.google;
                return (
                  <div 
                    key={event.id}
                    className={cn(
                      "px-1 py-0.5 rounded text-[7px] font-black truncate border shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                    title={event.title}
                  >
                    {!event.allDay && event.start_at && (
                      <span className="opacity-60 mr-1">
                        {format(new Date(event.start_at), 'HH:mm')}
                      </span>
                    )}
                    {event.title}
                  </div>
                );
              })}
              {sortedEvents.length > 3 && (
                <div className="text-[7px] font-bold text-slate-400 pl-1 uppercase tracking-tighter">
                  + {sortedEvents.length - 3} mais
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
