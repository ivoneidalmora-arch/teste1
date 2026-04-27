"use client";

import { useMemo, memo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatBRL } from '@/core/utils/formatters';
import { Transaction, IncomeTransaction } from '@/core/types/finance';
import { isHoliday } from '@/core/utils/holidays';

interface CalendarProps {
  currentDate: Date;
  transactions: Transaction[];
}

export const DashboardCalendar = memo(function DashboardCalendar({ currentDate, transactions = [] }: CalendarProps) {
  // Garantia de que currentDate é um Date válido
  const safeDate = currentDate instanceof Date ? currentDate : new Date();
  const safeTransactions = transactions || [];

  const days = useMemo(() => {
    try {
      const start = startOfMonth(safeDate);
      const end = endOfMonth(safeDate);
      return eachDayOfInterval({ start, end });
    } catch (e) {
      return [];
    }
  }, [safeDate]);

  const dayStats = useMemo(() => {
    const stats: Record<string, { totalIn: number, totalOut: number, hasIn: boolean, hasOut: boolean }> = {};
    
    safeTransactions.forEach(t => {
      if (!t || !t.date) return;
      const dateKey = t.date.substring(0, 10);
      if (!stats[dateKey]) {
        stats[dateKey] = { totalIn: 0, totalOut: 0, hasIn: false, hasOut: false };
      }

      const tValue = t.type === 'income' 
        ? ((t as IncomeTransaction).amountLiquido || t.amount || 0) 
        : (t.amount || 0);

      if (t.type === 'income') {
        stats[dateKey].totalIn += tValue;
        stats[dateKey].hasIn = true;
      } else {
        stats[dateKey].totalOut += tValue;
        stats[dateKey].hasOut = true;
      }
    });

    return stats;
  }, [safeTransactions]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  if (days.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 flex items-center flex-wrap gap-x-3">
          Calendário de Fluxo 
          <span className="text-xs font-normal text-slate-400">{format(safeDate, "MMMM 'de' yyyy", { locale: ptBR })}</span>
          
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-tight mt-1 md:mt-0 md:ml-4">
            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Feriado</div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">Recebimentos</div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">Saídas</div>
          </div>
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
          <div key={dayName} className="text-center text-[10px] md:text-xs font-semibold text-slate-400 py-2 uppercase tracking-wide">
            {dayName}
          </div>
        ))}
        
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 border border-transparent"></div>
        ))}

        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const stats = dayStats[dateKey] || { totalIn: 0, totalOut: 0, hasIn: false, hasOut: false };
          const isToday = dateKey === todayStr;
          const holidayName = isHoliday(day);

          return (
            <div 
              key={dateKey} 
              className={cn(
                "relative p-1 md:p-2 h-16 md:h-20 border border-slate-100/50 rounded-xl flex flex-col items-center justify-start hover:border-blue-300 hover:bg-blue-50/50 transition-colors group cursor-pointer",
                isToday && "ring-2 ring-blue-500 ring-offset-1 bg-blue-50/20",
                holidayName && "bg-amber-50/40 border-l-4 border-l-amber-400 shadow-sm"
              )}
            >
              <span className={cn(
                 "text-xs md:text-sm font-semibold mb-1",
                 isToday ? "text-blue-600" : (holidayName ? "text-amber-700" : "text-slate-600")
              )}>
                {format(day, 'd')}
              </span>

              {holidayName && (
                <span className="text-[7px] md:text-[8px] font-bold text-amber-600 uppercase leading-tight text-center px-1 line-clamp-1">
                  {holidayName}
                </span>
              )}
              
              <div className="flex gap-1 mb-1 mt-auto">
                {stats.hasIn && stats.hasOut ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                ) : (
                  <>
                    {stats.hasIn && <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>}
                    {stats.hasOut && <span className="w-1.5 h-1.5 rounded-full bg-brand-danger"></span>}
                  </>
                )}
              </div>

              <div className="hidden md:flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">
                {stats.totalIn > 0 && <span className="text-[8px] font-bold text-brand-success leading-none mb-0.5">+{formatBRL(stats.totalIn).replace('R$', '')}</span>}
                {stats.totalOut > 0 && <span className="text-[8px] font-bold text-brand-danger leading-none">-{formatBRL(stats.totalOut).replace('R$', '')}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
