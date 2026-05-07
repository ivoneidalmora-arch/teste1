"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { googleCalendarService, CalendarEvent } from '../../services/google-calendar.service';

export function MonthlyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(googleCalendarService.getConnectionStatus());

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await googleCalendarService.getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
            Calendário
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
              syncStatus.connected ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
            )}>
              {syncStatus.mode === 'DEMO' ? 'Demo Mode' : 'Google Sync'}
            </span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToToday} className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Dias da Semana */}
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Mensal */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-[280px]">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div 
              key={idx} 
              className={cn(
                "border-b border-r border-slate-50 p-1 flex flex-col gap-0.5 hover:bg-slate-50/30 transition-colors cursor-pointer group relative",
                !isCurrentMonth && "bg-slate-50/20 opacity-40",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <span className={cn(
                "text-[10px] font-black ml-auto mr-1",
                isToday ? "w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center -mr-0.5 -mt-0.5" : "text-slate-400"
              )}>
                {format(day, 'd')}
              </span>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id}
                    className="h-1.5 w-1.5 rounded-full mx-auto"
                    style={{ backgroundColor: event.color || '#2563EB' }}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[7px] font-black text-slate-300 text-center">+{dayEvents.length - 2}</span>
                )}
              </div>

              {/* Botão Add no Hover */}
              <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/60">
                <Plus className="w-3 h-3 text-blue-600" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Sync Status */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className={cn("w-3 h-3 text-slate-400", loading && "animate-spin")} />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
            {syncStatus.connected ? 'Sincronizado com Google Agenda' : 'Modo Offline (Demo)'}
          </span>
        </div>
        {!syncStatus.connected && (
          <button 
            onClick={() => googleCalendarService.connect().then(() => setSyncStatus(googleCalendarService.getConnectionStatus()))}
            className="flex items-center gap-1 text-[9px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
          >
            Conectar <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}
