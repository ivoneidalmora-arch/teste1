"use client";

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
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/core/utils/formatters';
import { googleCalendarService, CalendarEvent } from '../../services/google-calendar.service';
import { useAuth } from '@/features/auth/hooks/useAuth';

import { EventListModal } from '../modals/EventListModal';

export function MonthlyCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ connected: boolean; status: string; email?: string }>({ 
    connected: false, 
    status: 'loading' 
  });

  // Modal State
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStatus();
      loadEvents();
    }
  }, [currentMonth, user?.id]);

  const loadStatus = async () => {
    if (!user?.id) return;
    const res = await googleCalendarService.getConnectionStatus(user.id);
    setStatus(res);
  };

  const loadEvents = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await googleCalendarService.getEvents(user.id, currentMonth);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleConnect = () => {
    window.location.href = '/api/auth/google/login';
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header logic remains same... */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
            Calendário
            {status.connected ? (
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                status.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
              )}>
                {status.status === 'active' ? (
                  <>
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Google Conectado
                  </>
                ) : 'Reconectar'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest">
                Offline
              </span>
            )}
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
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-[300px]">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          // Priorização visual: Municipal > Estadual > Nacional > Google
          const sortedEvents = [...dayEvents].sort((a, b) => {
            const priority = { municipal: 1, state: 2, national: 3, google: 4, system: 5 };
            return (priority[a.type || 'google'] || 99) - (priority[b.type || 'google'] || 99);
          });

          return (
            <div 
              key={idx} 
              onClick={() => handleDayClick(day)}
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

              <div className="flex flex-wrap gap-0.5 mt-1 justify-center px-0.5">
                {sortedEvents.slice(0, 4).map(event => (
                  <div 
                    key={event.id}
                    className="w-1.5 h-1.5 rounded-full shadow-sm"
                    style={{ backgroundColor: event.color || '#2563eb' }}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 4 && (
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Sync Status Premium */}
      <div className="p-4 bg-slate-50/40 border-t border-slate-100">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
          status.connected ? "bg-white border-slate-100 shadow-sm" : "bg-slate-100/50 border-transparent"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm",
              status.connected ? "bg-white border border-slate-100 text-blue-600" : "bg-slate-200 text-slate-400"
            )}>
              {status.connected ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500">G</span>
              ) : 'G'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#0F172A] leading-tight">
                {status.connected ? 'Sincronização Ativa' : 'Google Agenda'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                {status.connected ? `Vinculado a ${status.email?.split('@')[0]}...` : 'Modo demonstração'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status.connected && status.status === 'active' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {!status.connected || status.status === 'reconnect_required' ? (
              <button 
                onClick={handleConnect}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
              >
                Ativar
              </button>
            ) : (
              <button 
                onClick={loadEvents}
                disabled={loading}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-blue-600"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedDay && (
        <EventListModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDay}
          events={events.filter(e => isSameDay(new Date(e.start), selectedDay))}
        />
      )}
    </div>
  );
}

