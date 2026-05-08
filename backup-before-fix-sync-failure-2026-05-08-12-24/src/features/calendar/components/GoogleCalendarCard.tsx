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
  Info,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { toast } from 'sonner';
import { toLocalDateKey } from '../utils/date-key';
import type { CalendarEvent, GoogleConnectionStatus } from '../types/calendar.types';

export function GoogleCalendarCard() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncRunning, setSyncRunning] = useState(false);
  const [status, setStatus] = useState<GoogleConnectionStatus>({ 
    connected: false, 
    status: 'disconnected',
    needs_reconnect: false
  });
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: CalendarEvent[] } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/calendar/status');
      if (response.ok) {
        const res = await response.json();
        setStatus(res);
      } else {
        setStatus({ connected: false, status: 'disconnected', needs_reconnect: false });
      }
    } catch (error) {
      setStatus({ connected: false, status: 'error', needs_reconnect: false });
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const monthParam = format(currentMonth, 'yyyy-MM');
      const response = await fetch(`/api/calendar/events?month=${monthParam}`);
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        const err = await response.json();
        if (err.error === 'RECONNECT_REQUIRED') {
          setStatus(prev => ({ ...prev, status: 'reconnect_required', needs_reconnect: true }));
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (user?.id) {
      loadStatus();
    }
  }, [user?.id, loadStatus]);

  useEffect(() => {
    if (user?.id) {
      loadEvents();
    }
  }, [user?.id, loadEvents]);

  // Lógica de Auto-sync
  useEffect(() => {
    if (status.connected && status.status === 'active' && !syncRunning) {
      const shouldAutoSync = () => {
        if (!status.last_sync_at) return true;
        const last = new Date(status.last_sync_at).getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        return Date.now() - last > oneDay;
      };

      if (shouldAutoSync()) {
        handleSyncHolidays(true);
      }
    }
  }, [status.connected, status.status, status.last_sync_at, syncRunning]);

  const days = useMemo(() => {
    const baseDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 12, 0, 0);
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(baseDate), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(baseDate), { weekStartsOn: 0 }),
    });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleConnect = (forcePrompt = false) => {
    const url = `/api/auth/google/login${forcePrompt || status.needs_reconnect ? '?prompt=consent' : ''}`;
    window.location.href = url;
  };

  const handleSyncHolidays = async (isAuto = false) => {
    if (syncRunning) return;
    
    setSyncRunning(true);
    const tid = !isAuto ? toast.loading('Sincronizando feriados com Google...') : undefined;
    
    try {
      const res = await fetch('/api/calendar/sync-holidays', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentMonth.getFullYear() })
      });
      
      if (res.ok) {
        if (!isAuto && tid) toast.success('Feriados sincronizados com Google Agenda.', { id: tid });
        loadStatus();
        loadEvents();
      } else {
        if (!isAuto && tid) toast.error('Falha na sincronização.', { id: tid });
      }
    } catch (err) {
      if (!isAuto && tid) toast.error('Erro de conexão.', { id: tid });
    } finally {
      setSyncRunning(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <IconBadge icon={CalendarIcon} variant="blue" size="sm" gradient />
          <div>
            <h3 className="text-sm font-black text-[#0F172A]">Calendário Alfa</h3>
            <p className="text-[10px] font-bold text-slate-400 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToToday} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Headers */}
      <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative flex-1">
        {(loading || syncRunning) && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {syncRunning ? 'Sincronizando...' : 'Carregando...'}
              </span>
            </div>
          </div>
        )}
        <CalendarMonthGrid 
          days={days} 
          currentMonth={currentMonth} 
          events={events} 
          onDayClick={(day, dayEvents) => setSelectedDayEvents({ day, events: dayEvents })}
        />
      </div>

      {/* Legend & Footer */}
      <div className="p-3 bg-slate-50/20 border-t border-slate-100 space-y-3">
        {/* Color Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {[
            { label: 'Nacional', color: 'bg-rose-400' },
            { label: 'Estadual', color: 'bg-pink-400' },
            { label: 'Municipal', color: 'bg-amber-400' },
            { label: 'Google', color: 'bg-blue-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Connection Status */}
        <div className={cn(
          "flex items-center justify-between p-2.5 rounded-2xl border transition-all",
          status.connected ? "bg-white border-slate-100 shadow-sm" : "bg-slate-100/50 border-transparent"
        )}>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black",
              status.connected ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-400"
            )}>
              G
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-900 leading-tight">
                  {status.connected ? 'Google Agenda Ativo' : 'Google Desconectado'}
                </span>
                {status.needs_reconnect && (
                   <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">
                {status.connected 
                  ? (status.last_sync_at 
                      ? `Sincronizado: ${format(new Date(status.last_sync_at), "dd/MM 'às' HH:mm")}` 
                      : 'Sincronização em andamento') 
                  : 'Feriados locais ativos'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!status.connected || status.needs_reconnect ? (
              <button 
                onClick={() => handleConnect()}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                  status.needs_reconnect 
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                )}
              >
                {status.needs_reconnect ? 'Reconectar' : 'Conectar'}
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleSyncHolidays()}
                  className={cn(
                    "p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all",
                    syncRunning ? "animate-spin text-blue-600" : "hover:text-blue-600"
                  )}
                  title="Sincronizar Feriados"
                  disabled={syncRunning}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => window.open('https://calendar.google.com', '_blank')}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                  title="Abrir Google Agenda"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Modal/Popover */}
      {selectedDayEvents && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-slate-200">
                {format(selectedDayEvents.day, 'dd')}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {format(selectedDayEvents.day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Detalhes do Dia</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDayEvents(null)}
              className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {selectedDayEvents.events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <Info className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Nenhum evento agendado</p>
              </div>
            ) : (
              selectedDayEvents.events.map(event => (
                <div key={event.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-600">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                          event.type === 'national' ? "bg-rose-100 text-rose-700" :
                          event.type === 'state' ? "bg-pink-100 text-pink-700" :
                          event.type === 'municipal' ? "bg-amber-100 text-amber-700" :
                          event.type === 'optional' ? "bg-slate-100 text-slate-600" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {event.type || 'evento'}
                        </span>
                        {!event.allDay && event.start_at && (
                          <span className="text-[10px] font-black text-blue-600">
                            {format(new Date(event.start_at), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {event.title}
                      </h5>
                      {event.description && (
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.source === 'google' && (
                      <button 
                        onClick={() => window.open(`https://calendar.google.com/calendar/r/eventedit/${event.googleEventId}`, '_blank')}
                        className="p-2 hover:bg-blue-50 rounded-xl text-slate-300 group-hover:text-blue-600 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
