"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RefreshCw, X, Info } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { BaseModal } from '@/core/components/BaseModal';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  type: 'financeiro' | 'operacional' | 'manutencao' | 'outros' | 'google' | string;
  source?: string;
}

interface CalendarAlfaProps {
  events?: CalendarEvent[];
  className?: string;
}

export function CalendarAlfa({ events: propEvents = [], className }: CalendarAlfaProps) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'reconnect_required'>('idle');
  
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: Date, events: CalendarEvent[] } | null>(null);
  
  const [status, setStatus] = useState({ 
    connected: false, 
    status: 'disconnected',
    needs_reconnect: false
  });

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/calendar/status');
      if (response.ok) {
        const res = await response.json();
        setStatus(res);
        if (res.needs_reconnect) setSyncStatus('reconnect_required');
      }
    } catch (error) {}
  }, []);

  const loadGoogleEvents = useCallback(async () => {
    setLoading(true);
    try {
      const monthParam = format(currentMonth, 'yyyy-MM');
      const response = await fetch(`/api/calendar/events?month=${monthParam}`);
      if (response.ok) {
        const data = await response.json();
        // Converte as datas recebidas da API para objetos Date para garantir compatibilidade
        const formattedEvents = data.map((e: any) => ({
          ...e,
          date: new Date(e.date || e.start_at)
        }));
        setGoogleEvents(formattedEvents);
      } else if (response.status === 403) {
        setStatus(prev => ({ ...prev, status: 'reconnect_required', needs_reconnect: true }));
        setSyncStatus('reconnect_required');
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (user?.id) loadStatus();
  }, [user?.id, loadStatus]);

  useEffect(() => {
    if (user?.id && status.connected) loadGoogleEvents();
  }, [user?.id, status.connected, loadGoogleEvents]);

  const handleConnect = () => {
    window.location.href = `/api/auth/google/login?prompt=consent`;
  };

  const handleSync = async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const tid = toast.loading('Sincronizando com Google...');
    try {
      const res = await fetch('/api/calendar/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: currentMonth.getFullYear() })
      });
      if (res.ok) {
        toast.success('Sincronização concluída!', { id: tid });
        setSyncStatus('success');
        loadStatus();
        loadGoogleEvents();
      } else {
        throw new Error('Falha');
      }
    } catch (err) {
      toast.error('Erro ao sincronizar.', { id: tid });
      setSyncStatus('error');
    }
  };

  const events = useMemo(() => [...propEvents, ...googleEvents], [propEvents, googleEvents]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const categories = [
    { label: 'Financeiro', color: 'bg-rose-500' },
    { label: 'Operacional', color: 'bg-blue-600' },
    { label: 'Manutenção', color: 'bg-orange-500' },
    { label: 'Outros', color: 'bg-purple-500' },
    { label: 'Google', color: 'bg-teal-500' },
  ];

  return (
    <div className={cn("bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Calendário</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded transition-all text-slate-400">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="px-1.5 min-w-[80px] text-center">
              <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-wider">
                {format(currentMonth, 'MMM yy', { locale: ptBR })}
              </span>
            </div>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded transition-all text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-2 h-7 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 shadow-sm"
          >
            Hoje
          </button>
          
          {!status.connected || status.needs_reconnect ? (
            <button 
              onClick={handleConnect}
              className="px-2 h-7 bg-blue-600 border border-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-700 shadow-sm transition-all"
              title="Conectar Google Agenda"
            >
              Google
            </button>
          ) : (
            <button 
              onClick={handleSync}
              disabled={syncStatus === 'syncing' || loading}
              className={cn(
                "w-7 h-7 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-500 hover:bg-slate-50 shadow-sm transition-all",
                (syncStatus === 'syncing' || loading) && "animate-spin text-blue-600"
              )}
              title="Sincronizar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
          <div key={day} className="text-center text-[9px] font-black text-blue-600 tracking-widest py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-50 border border-slate-50 rounded-lg overflow-hidden flex-1">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          const isSelected = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div 
              key={i} 
              onClick={() => {
                if (dayEvents.length > 0) setSelectedDayEvents({ day, events: dayEvents });
              }}
              className={cn(
                "bg-white p-1 min-h-[25px] flex flex-col gap-0.5 transition-all cursor-pointer",
                !isCurrentMonth && "opacity-20",
                dayEvents.length > 0 ? "hover:bg-slate-50 hover:shadow-sm" : "hover:bg-slate-50/50"
              )}
            >
              <div className="flex justify-center mb-0.5">
                <span className={cn(
                  "text-[9px] font-black w-4 h-4 flex items-center justify-center transition-all",
                  isSelected ? "bg-blue-600 text-white rounded-full" : "text-slate-500"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-row justify-center gap-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "w-1 h-1 rounded-full",
                      event.type === 'financeiro' ? 'bg-rose-500' :
                      event.type === 'operacional' ? 'bg-blue-600' :
                      event.type === 'manutencao' ? 'bg-orange-500' : 
                      event.type === 'google' || event.source === 'google' ? 'bg-teal-500' :
                      event.type === 'national' || event.type === 'municipal' || event.type === 'state' ? 'bg-amber-400' :
                      'bg-purple-500'
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-2 border-t border-slate-50 pt-2 shrink-0">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", cat.color)} />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{cat.label.substring(0, 3)}</span>
          </div>
        ))}
      </div>

      <BaseModal
        isOpen={!!selectedDayEvents}
        onClose={() => setSelectedDayEvents(null)}
        title={selectedDayEvents ? format(selectedDayEvents.day, "EEEE, d 'de' MMMM", { locale: ptBR }) : ''}
        headerColorContext="info"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          {selectedDayEvents?.events.map(event => (
            <div key={event.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  event.type === 'financeiro' ? 'bg-rose-500' :
                  event.type === 'operacional' ? 'bg-blue-600' :
                  event.type === 'manutencao' ? 'bg-orange-500' : 
                  event.type === 'google' || event.source === 'google' ? 'bg-teal-500' :
                  event.type === 'national' || event.type === 'municipal' || event.type === 'state' ? 'bg-amber-400' :
                  'bg-purple-500'
                )} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {event.type === 'google' || event.source === 'google' ? 'Google Agenda' : event.type}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{event.title}</p>
            </div>
          ))}
        </div>
      </BaseModal>
    </div>
  );
}
