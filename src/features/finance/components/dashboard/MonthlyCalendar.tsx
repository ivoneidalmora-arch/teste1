"use client";

import { cn } from '@/core/utils/formatters';

export function MonthlyCalendar() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
            Calendário Google
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
              Ativo
            </span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400">
            Sincronização em tempo real via Embed
          </p>
        </div>
      </div>

      {/* Grid Mensal Substituído por Iframe para Ativação Rápida */}
      <div className="flex-1 min-h-[450px] w-full">
        <iframe 
          src="https://calendar.google.com/calendar/embed?src=ivoneidalmora%40gmail.com&ctz=America%2FSao_Paulo&showTitle=0&showNav=1&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=MONTH" 
          style={{ border: 0 }} 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no"
          className="rounded-b-2xl"
        />
      </div>

      {/* Footer Sync Status */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
            Conectado: ivoneidalmora@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
}
