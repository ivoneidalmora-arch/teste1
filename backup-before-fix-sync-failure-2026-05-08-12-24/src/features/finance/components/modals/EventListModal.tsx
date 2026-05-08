"use client";

import { X, Calendar as CalendarIcon, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalendarEvent } from '@/features/calendar/types/calendar.types';
import { cn } from '@/core/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: CalendarEvent[];
}

const TYPE_COLORS: Record<string, string> = {
  national: '#f43f5e', // rose-500
  state: '#ec4899',    // pink-500
  municipal: '#f59e0b', // amber-500
  optional: '#64748b',  // slate-500
  google: '#3b82f6',    // blue-500
};

export function EventListModal({ isOpen, onClose, date, events }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">Eventos do Dia</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[450px] overflow-y-auto space-y-3 custom-scrollbar">
          {events.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                <Info className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">Nenhum evento agendado</p>
            </div>
          ) : (
            events.map((event) => {
              const color = TYPE_COLORS[event.type || ''] || TYPE_COLORS.google;
              
              return (
                <div 
                  key={event.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group border-l-4"
                  style={{ borderLeftColor: color }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                          event.type === 'national' ? "bg-rose-50 text-rose-700 border-rose-100" :
                          event.type === 'state' ? "bg-pink-50 text-pink-700 border-pink-100" :
                          event.type === 'municipal' ? "bg-amber-50 text-amber-700 border-amber-100" :
                          event.type === 'optional' ? "bg-slate-50 text-slate-600 border-slate-100" :
                          "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          {event.type || 'evento'}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h4>
                      </div>
                      <span className="shrink-0 text-[8px] font-black uppercase text-slate-300 tracking-tighter">
                        {event.source}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {!event.allDay && event.start_at 
                          ? format(new Date(event.start_at), 'HH:mm') 
                          : 'Dia Todo'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
