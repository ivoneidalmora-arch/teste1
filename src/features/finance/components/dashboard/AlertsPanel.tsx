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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Resumo / Alertas</h3>
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {pendingCount || 3} pendências
        </span>
      </div>

      <div className="space-y-4">
        {displayAlerts.map((alert) => (
          <button
            key={alert.id}
            onClick={alert.onClick}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-50 transition-all hover:bg-slate-50 hover:border-slate-100 group text-left"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              alert.type === 'error' ? "bg-rose-50 text-rose-500" :
              alert.type === 'warning' ? "bg-amber-50 text-amber-500" :
              alert.type === 'success' ? "bg-emerald-50 text-emerald-500" :
              "bg-blue-50 text-blue-500"
            )}>
              {alert.type === 'error' && <ShieldAlert className="w-5 h-5" />}
              {alert.type === 'warning' && <AlertCircle className="w-5 h-5" />}
              {alert.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {alert.type === 'info' && <Clock className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#0F172A] group-hover:text-blue-600 transition-colors">
                {alert.title}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {alert.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
