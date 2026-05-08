"use client";

import { 
  MoreVertical, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink,
  Car,
  User,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { cn, formatBRL } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { Transaction } from '@/core/types/finance';

interface Props {
  transactions: Transaction[];
  onAction?: (action: string, transaction: Transaction) => void;
}

const STATUS_MAP = {
  paid: { label: 'Pago', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  pending: { label: 'Pendente', class: 'bg-amber-50 text-amber-600 border-amber-100' },
  overdue: { label: 'Atrasado', class: 'bg-rose-50 text-rose-600 border-rose-100' },
  cancelled: { label: 'Cancelado', class: 'bg-slate-50 text-slate-400 border-slate-100' },
};

export function RecentTransactionsTable({ transactions, onAction }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight">Transações Recentes</h3>
          <p className="text-[11px] font-bold text-slate-400">Últimas atividades financeiras registradas</p>
        </div>
        <button 
          onClick={() => window.location.href = '/relatorios'}
          className="px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest border border-slate-100"
        >
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalhes / Cliente</th>
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Categoria</th>
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Valor</th>
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
              <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400 italic">Nenhuma transação para exibir</td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isIncome = t.type === 'income';
                const status = STATUS_MAP[t.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
                
                // Escolha de ícone baseada na descrição
                const Icon = t.description.toLowerCase().includes('vistoria') ? Car : (isIncome ? ArrowUpRight : ArrowDownRight);
                const iconColor = t.description.toLowerCase().includes('vistoria') ? 'bg-blue-50 text-blue-500' : (isIncome ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500');

                return (
                  <tr key={t.id} className="group hover:bg-slate-50/50 transition-all duration-200 cursor-default">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 leading-tight">{formatDisplayDate(t.date, 'dd MMM').split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{formatDisplayDate(t.date, 'dd MMM').split(' ')[1]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                          iconColor
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-black text-[#0F172A] truncate leading-tight group-hover:text-blue-600 transition-colors">{t.description}</span>
                          <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                            <User className="w-2.5 h-2.5" />
                            {t.customer}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[12px] font-black leading-tight",
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {isIncome ? '+' : '-'} {formatBRL(isIncome ? (t.netAmount || t.amount) : t.amount)}
                        </span>
                        {isIncome && t.grossAmount && t.grossAmount !== t.netAmount && (
                          <span className="text-[9px] font-bold text-slate-300 line-through">
                            {formatBRL(t.grossAmount)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        status.class
                      )}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90">
                        <MoreVertical className="w-4 h-4" />
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
