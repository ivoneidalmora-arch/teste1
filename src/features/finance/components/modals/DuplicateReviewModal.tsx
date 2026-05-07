"use client";

import { useState } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { DuplicateGroup } from '../../utils/duplicate-check';
import { Transaction } from '@/core/types/finance';
import { formatBRL, cn } from '@/core/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Edit2, AlertTriangle, ChevronRight, Calendar, User, Hash } from 'lucide-react';
import { EditTransactionModal } from './EditTransactionModal';
import { transactionService } from '@/features/finance/services/transaction.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { useFinanceContext } from '../../contexts/FinanceContext';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
}

export function DuplicateReviewModal({ isOpen, onClose, duplicateGroups }: Props) {
  const { user } = useAuthContext();
  const { refresh, transactions } = useFinanceContext();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleDelete = async (t: Transaction) => {
    if (!user) return;
    if (!confirm('Tem certeza que deseja excluir este lançamento duplicado?')) return;

    try {
      await transactionService.delete(t.id, t.type, user.id);
      toast.success('Lançamento excluído com sucesso');
      refresh();
    } catch (err) {
      toast.error('Erro ao excluir lançamento');
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Revisão de Duplicidades"
      headerColorContext="warning"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Identificamos lançamentos com a <strong>mesma placa</strong> e <strong>mesmo serviço</strong> em um intervalo menor que 30 dias. Revise-os abaixo para manter sua saúde financeira.
          </p>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {duplicateGroups.map((group) => (
            <div key={group.key} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-black text-slate-700 shadow-sm">
                    {group.key.split('-')[0]}
                  </div>
                  <span className="text-sm font-bold text-slate-600">{group.key.split('-')[1]}</span>
                </div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                  {group.transactions.length} Registros
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {group.transactions.map((t) => (
                  <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Data
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {format(new Date(t.date + 'T12:00:00'), "dd 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <User className="w-3 h-3" /> Cliente
                        </span>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                          {t.customer || '---'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Valor
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          {formatBRL(t.amount)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit mt-0.5",
                          t.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {t.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingTransaction(t)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors shadow-sm bg-white border border-blue-50"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t)}
                        className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors shadow-sm bg-white border border-rose-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
          >
            Fechar
          </button>
        </div>
      </div>

      {editingTransaction && (
        <EditTransactionModal 
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            setEditingTransaction(null);
            refresh();
          }}
          transaction={editingTransaction}
          existingTransactions={transactions}
        />
      )}
    </BaseModal>
  );
}
