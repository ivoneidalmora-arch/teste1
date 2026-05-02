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
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Transações Recentes</h3>
          <p className="text-sm font-semibold text-slate-400">Últimas atividades financeiras registradas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-200/50">
          Ver todas <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Descrição / Cliente</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Valor</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Origem</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              const status = STATUS_MAP[t.status];

              return (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500">{formatDisplayDate(t.date)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors">{t.description}</span>
                        <span className="text-[11px] font-semibold text-slate-400 truncate uppercase tracking-wider">{t.customer}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tight border border-slate-200/50">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "text-sm font-black",
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isIncome ? '+' : '-'} {formatBRL(t.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                      status.class
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t.origin}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
