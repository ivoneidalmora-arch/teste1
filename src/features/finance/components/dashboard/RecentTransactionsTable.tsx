"use client";

import { cn, formatBRL } from '@/core/utils/formatters';
import { Transaction } from '@/core/types/finance';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onAction?: (id: string) => void;
}

import { Icon3D } from '@/core/components/ui/Icon3D';
import { History } from 'lucide-react';

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Icon3D icon={History} variant="slate" size="sm" />
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Transações Recentes</h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Últimas movimentações registradas</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/receitas'}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm shadow-blue-100/20"
        >
          Ver todas
        </button>
      </div>

      <div className="flex-1 overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Categoria</th>
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {transactions.map((t) => {
              const date = new Date(t.date);
              const isRevenue = t.type === 'income';
              const status = t.status || 'pendente';
              
              return (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#0F172A]">{date.getDate()}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col max-w-[220px]">
                      <span className="text-sm font-black text-[#0F172A] truncate group-hover:text-blue-600 transition-colors">{t.description}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">NF-e {Math.floor(Math.random() * 90000) + 10000}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {t.category || 'Outros'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[120px] block">
                      {('customer' in t ? t.customer : '') || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={cn(
                      "text-sm font-black tracking-tight",
                      isRevenue ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatBRL(t.amount)}
                    </span>
                  </td>
                  <td className="py-5 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      status === 'pago' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50" :
                      status === 'pendente' ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50" :
                      "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-100/50"
                    )}>
                      {status === 'pago' ? 'Pago' : status === 'pendente' ? 'Pendente' : 'Em Análise'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 text-center">
        <button 
          onClick={() => window.location.href = '/receitas'}
          className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
        >
          Ver todas as transações
        </button>
      </div>
    </div>
  );
}
