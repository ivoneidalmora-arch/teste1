"use client";

import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CalendarEvent } from '../types/calendar.types';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { googleCalendarService } from '@/features/finance/services/google-calendar.service';
import { IconBadge } from '@/core/components/ui/IconBadge';

export function GoogleCalendarCard() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]); // Using any temporarily for backward compatibility
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ connected: boolean; status: string; email?: string }>({ 
    connected: false, 
    status: 'loading' 
  });

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
      // Map these to the new internal structure if needed, but for now they work
      setEvents(data.map(e => ({
        ...e,
        start_at: e.start,
        end_at: e.end,
      })));
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

  const handleConnect = () => {
    window.location.href = '/api/auth/google/login';
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header Premium */}
      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <IconBadge icon={CalendarIcon} variant="blue" size="sm" gradient />
          <div>
            <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              Calendário / Google Agenda
            </h3>
            <p className="text-[10px] font-bold text-slate-400 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={goToToday} 
            className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-100"
          >
            Hoje
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Dias da Semana */}
      <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Mensal Principal */}
      <CalendarMonthGrid 
        days={days} 
        currentMonth={currentMonth} 
        events={events as any} 
        onDayClick={(day) => console.log('Click day:', day)}
      />

      {/* Footer Sync Status Premium */}
      <div className="p-4 bg-slate-50/30 border-t border-slate-100">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-2xl border transition-all duration-500",
          status.connected ? "bg-white border-slate-100 shadow-sm" : "bg-slate-100/50 border-transparent"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-all",
              status.connected ? "bg-white border border-slate-100 text-blue-600" : "bg-slate-200 text-slate-400"
            )}>
              {status.connected ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500">G</span>
              ) : 'G'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#0F172A] leading-tight flex items-center gap-1.5">
                {status.connected ? 'Sincronização Ativa' : 'Google Agenda'}
                {status.connected && status.status === 'active' && (
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                {status.connected ? `Vinculado a ${status.email?.split('@')[0]}...` : 'Modo demonstração'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!status.connected || status.status === 'reconnect_required' ? (
              <button 
                onClick={handleConnect}
                className="px-3.5 py-1.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95"
              >
                Ativar
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button 
                  onClick={loadEvents}
                  disabled={loading}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-blue-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
