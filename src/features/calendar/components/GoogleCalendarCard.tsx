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
  AlertCircle
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { toast } from 'sonner';
import { toLocalDateKey, getHolidays } from '@/features/finance/services/holiday.service';

export function GoogleCalendarCard() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ connected: boolean; status: string; email?: string; last_sync_at?: string }>({ 
    connected: false, 
    status: 'loading' 
  });
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: any[] } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/calendar/status');
      if (response.ok) {
        const res = await response.json();
        setStatus(res);
      } else {
        setStatus({ connected: false, status: 'disconnected' });
      }
    } catch (error) {
      setStatus({ connected: false, status: 'error' });
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
        if (err.code === 'RECONNECT_REQUIRED') {
          setStatus(prev => ({ ...prev, status: 'reconnect_required' }));
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

  // Auto-sync trigger
  useEffect(() => {
    if (status.connected && status.status === 'active' && !status.last_sync_at) {
      handleSyncHolidays(true);
    }
  }, [status.connected, status.status, status.last_sync_at]);

  const days = useMemo(() => {
    // Normalizamos para o meio do dia para evitar que 00:00 em fusos negativos mude o mês/dia
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
    const url = `/api/auth/google/login${forcePrompt ? '?prompt=consent' : ''}`;
    window.location.href = url;
  };

  const handleSyncHolidays = async (isAuto = false) => {
    const tid = !isAuto ? toast.loading('Sincronizando feriados com Google...') : undefined;
    try {
      const res = await fetch('/api/calendar/sync-holidays', { method: 'POST' });
      if (res.ok) {
        if (!isAuto && tid) toast.success('Feriados sincronizados com Google Agenda.', { id: tid });
        loadStatus();
        loadEvents();
      } else {
        if (!isAuto && tid) toast.error('Falha na sincronização.', { id: tid });
      }
    } catch (err) {
      if (!isAuto && tid) toast.error('Erro de conexão.', { id: tid });
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
          <button onClick={goToToday} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all active:scale-90">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Headers */}
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
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
      <div className="p-3 bg-slate-50/30 border-t border-slate-100 space-y-3">
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
              "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black",
              status.connected ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-400"
            )}>
              G
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-900 leading-tight">
                {status.connected ? 'Google Sincronizado' : 'Google Agenda Desconectado'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">
                {status.connected ? (status.last_sync_at ? `Última sync: ${format(new Date(status.last_sync_at), 'HH:mm')}` : 'Sincronização pendente') : 'Feriados locais ativos'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!status.connected ? (
              <button 
                onClick={() => handleConnect()}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase hover:bg-blue-700 transition-all"
              >
                Conectar
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleSyncHolidays()}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                  title="Sincronizar Feriados"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => window.open('https://calendar.google.com', '_blank')}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Modal/Popover Placeholder */}
      {selectedDayEvents && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">
                {format(selectedDayEvents.day, 'dd')}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {format(selectedDayEvents.day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eventos e Feriados</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDayEvents(null)}
              className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {selectedDayEvents.events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                <Info className="w-8 h-8 opacity-20" />
                <p className="text-xs font-bold italic">Nenhum evento para este dia</p>
              </div>
            ) : (
              selectedDayEvents.events.map(event => (
                <div key={event.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                          event.type === 'national' ? "bg-rose-100 text-rose-700" :
                          event.type === 'state' ? "bg-pink-100 text-pink-700" :
                          event.type === 'municipal' ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {event.type}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h5>
                      </div>
                      {event.description && (
                        <p className="text-[10px] font-medium text-slate-500 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.source === 'google' && <ExternalLink className="w-3 h-3 text-slate-300" />}
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
