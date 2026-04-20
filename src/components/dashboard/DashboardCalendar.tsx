"use client";

import { useMemo, memo } from 'react';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/utils/cn';

interface CalendarProps {
  currentDate: Date;
  transactions: Transaction[];
}

export const DashboardCalendar = memo(function DashboardCalendar({ currentDate, transactions }: CalendarProps) {
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Pré-agregador de dados por dia para busca O(1)
  const dayStats = useMemo(() => {
    const stats: Record<string, { totalIn: number, totalOut: number, hasIn: boolean, hasOut: boolean }> = {};
    
    transactions.forEach(t => {
      const dateKey = t.date.substring(0, 10); // Normaliza para YYYY-MM-DD
      if (!stats[dateKey]) {
        stats[dateKey] = { totalIn: 0, totalOut: 0, hasIn: false, hasOut: false };
      }

      const tValue = t.type === 'income' 
        ? ((t as IncomeTransaction).amountLiquido || t.amount) 
        : t.amount;

      if (t.type === 'income') {
        stats[dateKey].totalIn += tValue;
        stats[dateKey].hasIn = true;
      } else {
        stats[dateKey].totalOut += tValue;
        stats[dateKey].hasOut = true;
      }
    });

    return stats;
  }, [transactions]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white border-detran rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
          Calendário de Fluxo <span className="text-sm font-normal text-slate-400 block sm:inline sm:ml-2">{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</span>
        </h3>
        <div className="flex items-center gap-3 text-[10px] md:text-xs">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-success"></span> Recebimentos</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-danger"></span> Saídas</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Misto</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
          <div key={dayName} className="text-center text-xs font-semibold text-slate-400 py-2 uppercase tracking-wide">
            {dayName}
          </div>
        ))}
        
        {/* Placeholder for offset days based on month start */}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 border border-transparent"></div>
        ))}

        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const stats = dayStats[dateKey] || { totalIn: 0, totalOut: 0, hasIn: false, hasOut: false };
          const isToday = dateKey === todayStr;

          return (
            <div 
              key={dateKey} 
              className={cn(
                "relative p-1 md:p-2 h-16 md:h-20 border border-slate-100/50 rounded-xl flex flex-col items-center justify-start hover:border-blue-300 hover:bg-blue-50/50 transition-colors group cursor-pointer",
                isToday && "ring-2 ring-blue-500 ring-offset-1 bg-blue-50/20"
              )}
            >
              <span className={cn(
                 "text-xs md:text-sm font-semibold mb-1",
                 isToday ? "text-blue-600" : "text-slate-600"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Pontos de Lógica */}
              <div className="flex gap-1 mb-1">
                {stats.hasIn && stats.hasOut && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse drop-shadow-sm"></span>
                )}
                {stats.hasIn && !stats.hasOut && (
                  <span className="w-2 h-2 rounded-full bg-brand-success drop-shadow-sm"></span>
                )}
                {!stats.hasIn && stats.hasOut && (
                  <span className="w-2 h-2 rounded-full bg-brand-danger drop-shadow-sm"></span>
                )}
              </div>

              {/* Overlay de Valores - visível apenas quando há valores e com hover suave */}
              <div className="flex flex-col items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute bottom-1 md:bottom-2">
                {stats.totalIn > 0 && <span className="text-[7px] md:text-[9px] font-medium text-brand-success leading-none mb-0.5">+{stats.totalIn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '')}</span>}
                {stats.totalOut > 0 && <span className="text-[7px] md:text-[9px] font-medium text-brand-danger leading-none">-{stats.totalOut.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '')}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
