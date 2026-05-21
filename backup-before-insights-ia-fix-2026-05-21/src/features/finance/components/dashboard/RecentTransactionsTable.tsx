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
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <div className="flex items-center gap-3">
          <Icon3D icon={History} variant="slate" size="xs" />
          <div>
            <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Transações Recentes</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Últimas movimentações</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/receitas'}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm"
        >
          Ver todas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin pr-1">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-left py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
              <th className="text-left py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
              <th className="text-left py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Cat.</th>
              <th className="text-left py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="text-left py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
              <th className="text-right py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {transactions.map((t) => {
              const date = new Date(t.date);
              const isRevenue = t.type === 'income';
              const status = t.status || 'pendente';
              
              return (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-1.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#0F172A] leading-tight">{date.getDate()}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none">
                        {date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 pr-4">
                    <div className="flex flex-col max-w-[180px]">
                      <span className="text-xs font-black text-[#0F172A] truncate group-hover:text-blue-600 transition-colors">{t.description}</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-center">
                    <span className="inline-flex px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {(t.category || 'Out').substring(0, 5)}
                    </span>
                  </td>
                  <td className="py-1.5">
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px] block">
                      {('customer' in t ? t.customer : '') || 'N/A'}
                    </span>
                  </td>
                  <td className="py-1.5 text-right">
                    <span className={cn(
                      "text-[11px] font-black tracking-tight",
                      isRevenue ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatBRL(t.amount)}
                    </span>
                  </td>
                  <td className="py-1.5 text-right pr-2">
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      status === 'pago' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      status === 'pendente' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      {status === 'pago' ? 'Pago' : status === 'pendente' ? 'Pendente' : 'Análise'}
                    </div>
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
