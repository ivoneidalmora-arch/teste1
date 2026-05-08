import { 
  format, 
  isSameMonth, 
} from 'date-fns';
import { cn } from '@/core/utils/formatters';
import { toLocalDateKey } from '@/features/finance/services/holiday.service';

interface Props {
  days: Date[];
  currentMonth: Date;
  events: any[]; // Flexível para suportar feriados locais e eventos Google
  onDayClick: (day: Date, events: any[]) => void;
}

const TYPE_COLORS: Record<string, { bg: string, text: string, label: string }> = {
  national: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Nacional' },
  state: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Estadual' },
  municipal: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Municipal' },
  optional: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Ponto Fac.' },
  google: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Google' },
};

export function CalendarMonthGrid({ days, currentMonth, events, onDayClick }: Props) {
  const todayKey = toLocalDateKey(new Date());

  return (
    <div className="flex-1 grid grid-cols-7 auto-rows-fr">
      {days.map((day, idx) => {
        const dayKey = toLocalDateKey(day);
        const dayEvents = events.filter(e => e.date === dayKey);
        const isToday = dayKey === todayKey;
        const isCurrentMonth = isSameMonth(day, currentMonth);

        // Prioridade visual: Nacional > Estadual > Municipal > Opcional > Google
        const sortedEvents = [...dayEvents].sort((a, b) => {
          const priority: Record<string, number> = { national: 1, state: 2, municipal: 3, optional: 4, google: 5 };
          return (priority[a.type] || 9) - (priority[b.type] || 9);
        });

        const hasHoliday = sortedEvents.some(e => ['national', 'state', 'municipal'].includes(e.type));

        return (
          <div 
            key={idx} 
            onClick={() => onDayClick(day, sortedEvents)}
            className={cn(
              "border-b border-r border-slate-50 p-1 flex flex-col gap-1 hover:bg-slate-50/50 transition-all cursor-pointer group relative min-h-[70px]",
              !isCurrentMonth && "bg-slate-50/5 opacity-30",
              hasHoliday && isCurrentMonth && "bg-slate-50/20",
              idx % 7 === 6 && "border-r-0"
            )}
          >
            <div className="flex items-center justify-between">
               {hasHoliday && isCurrentMonth && (
                 <div className="w-1 h-1 rounded-full bg-rose-400 ml-1" />
               )}
               <span className={cn(
                "text-[10px] font-black ml-auto mr-1 transition-all",
                isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center -mr-0.5 -mt-0.5 shadow-md" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {format(day, 'd')}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 overflow-hidden">
              {sortedEvents.slice(0, 2).map(event => {
                const colors = TYPE_COLORS[event.type] || TYPE_COLORS.google;
                return (
                  <div 
                    key={event.id}
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[8px] font-black truncate border transition-all",
                      colors.bg,
                      colors.text,
                      "border-black/5"
                    )}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                );
              })}
              {dayEvents.length > 2 && (
                <div className="text-[7px] font-bold text-slate-400 pl-1 uppercase tracking-tighter">
                  + {dayEvents.length - 2} mais
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
