"use client";

import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  subtitle: string;
  onClick?: () => void;
}

interface AlertsPanelProps {
  alerts?: Alert[];
  pendingCount?: number;
}

export function AlertsPanel({ alerts = [], pendingCount = 0 }: AlertsPanelProps) {
  // Alertas padrão baseados na imagem se não houver dados
  const defaultAlerts: Alert[] = [
    {
      id: '1',
      type: 'error',
      title: '3 Despesas pendentes',
      subtitle: 'R$ 7.784,30'
    },
    {
      id: '2',
      type: 'warning',
      title: '2 NF sem categoria',
      subtitle: 'Revisão necessária'
    },
    {
      id: '3',
      type: 'success',
      title: 'Backup realizado',
      subtitle: 'Hoje, 08:15'
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Alertas</h3>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
          {pendingCount || 3} pendências
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 overflow-y-auto flex-1 scrollbar-thin">
        {displayAlerts.slice(0, 3).map((alert) => (
          <button
            key={alert.id}
            onClick={alert.onClick}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-slate-50 transition-all hover:bg-slate-50 text-left"
          >
            <div className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
              alert.type === 'error' ? "bg-rose-50 text-rose-500" :
              alert.type === 'warning' ? "bg-amber-50 text-amber-500" :
              alert.type === 'success' ? "bg-emerald-50 text-emerald-500" :
              "bg-blue-50 text-blue-500"
            )}>
              {alert.type === 'error' && <ShieldAlert className="w-3.5 h-3.5" />}
              {alert.type === 'warning' && <AlertCircle className="w-3.5 h-3.5" />}
              {alert.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {alert.type === 'info' && <Clock className="w-3.5 h-3.5" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-[#0F172A] truncate leading-tight">
                {alert.title}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight truncate leading-none">
                {alert.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
