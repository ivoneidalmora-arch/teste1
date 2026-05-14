"use client";

import { useState, useMemo } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'financeiro' | 'operacional' | 'manutencao' | 'outros';
}

interface CalendarAlfaProps {
  events?: CalendarEvent[];
  className?: string;
}

export function CalendarAlfa({ events = [], className }: CalendarAlfaProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
  ];

  return (
    <div className={cn("bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Calendário Alfa</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-2 min-w-[100px] text-center">
              <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
            </div>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={goToToday}
            className="px-4 h-9 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-4">
        {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-blue-600 tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-50 border border-slate-50 rounded-2xl overflow-hidden flex-1">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(e.date, day));
          const isSelected = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div 
              key={i} 
              className={cn(
                "bg-white p-2 min-h-[60px] flex flex-col gap-1 transition-all hover:bg-slate-50/50 cursor-pointer",
                !isCurrentMonth && "opacity-20"
              )}
            >
              <div className="flex justify-center mb-1">
                <span className={cn(
                  "text-[11px] font-black w-6 h-6 flex items-center justify-center transition-all",
                  isSelected ? "bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 scale-110" : "text-slate-500"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "h-1.5 rounded-full",
                      event.type === 'financeiro' ? 'bg-rose-500' :
                      event.type === 'operacional' ? 'bg-blue-600' :
                      event.type === 'manutencao' ? 'bg-orange-500' : 'bg-purple-500'
                    )}
                    title={event.title}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-50 pt-6">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", cat.color)} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
