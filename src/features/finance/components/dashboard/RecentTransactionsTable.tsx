"use client";

import { MoreVertical, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { cn } from '@/core/utils/formatters';
import { RecentTransaction } from '../../types/dashboard.types';

interface Props {
  transactions: RecentTransaction[];
  onAction?: (id: string) => void;
}

const STATUS_MAP = {
  paid: { label: 'Pago', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  pending: { label: 'Pendente', class: 'bg-amber-50 text-amber-600 border-amber-100' },
  overdue: { label: 'Atrasado', class: 'bg-rose-50 text-rose-600 border-rose-100' },
  cancelled: { label: 'Cancelado', class: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export function RecentTransactionsTable({ transactions, onAction }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Transações Recentes</h3>
          <p className="text-[10px] font-bold text-slate-400">Últimas atividades financeiras registradas</p>
        </div>
        <button 
          onClick={() => window.location.href = '/relatorios'}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Ver todas <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente / Placa</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Categoria</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Origem</th>
              <th className="px-5 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-xs font-bold text-slate-400">Nenhuma transação encontrada</td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isIncome = t.type === 'income';
                const status = STATUS_MAP[t.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;

                return (
                  <tr key={t.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-3 text-[11px] font-bold text-slate-500">
                      {formatDisplayDate(t.date)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-[#0F172A] truncate leading-tight">{t.description}</span>
                          <span className="text-[9px] font-bold text-slate-400 truncate uppercase">{t.customer}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black text-slate-400 uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-black leading-tight",
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {isIncome ? '+' : '-'} {formatBRL(isIncome ? (t.netAmount || t.amount) : t.amount)}
                        </span>
                        {isIncome && t.grossAmount && t.grossAmount !== t.netAmount && (
                          <span className="text-[8px] font-bold text-slate-300">
                            Bruto: {formatBRL(t.grossAmount)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                        status.class
                      )}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.origin}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="p-1 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
