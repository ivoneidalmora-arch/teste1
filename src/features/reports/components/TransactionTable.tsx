"use client";

import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';
import { transactionService } from '@/features/finance/services/transaction.service';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionTable({ transactions, onEdit, onRefresh }: Props) {
  
  const handleDelete = async (t: Transaction) => {
    if (window.confirm('Excluir este lançamento permanentemente?')) {
      const success = await transactionService.delete(t.id, t.type);
      if (success) onRefresh();
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição / Cliente</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500">{formatDisplayDate(t.date)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {t.description || t.customer || 'Lançamento'}
                        </span>
                        {t.metadata?.placa && (
                          <span className="text-[10px] font-mono text-brand-primary font-bold">{String(t.metadata.placa)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-sm font-black",
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isIncome ? '+' : '-'} {formatBRL(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                  Nenhum registro encontrado para os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
