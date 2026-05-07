"use client";

import { X, Calendar as CalendarIcon, Clock, MapPin, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../services/google-calendar.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: CalendarEvent[];
}

export function EventListModal({ isOpen, onClose, date, events }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">Eventos do Dia</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {format(date, "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
          {events.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Info className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-400">Nenhum evento para este dia.</p>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-1.5 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: event.color || '#2563eb' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {event.title}
                      </h4>
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-50 text-[8px] font-black uppercase text-slate-400 border border-slate-100">
                        {event.source}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-[10px] text-slate-500 font-bold mb-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" />
                        {event.start.includes('T') ? format(new Date(event.start), 'HH:mm') : 'Dia Todo'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
