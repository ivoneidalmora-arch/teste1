"use client";

import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';
import { transactionService } from '@/features/finance/services/transaction.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/core/components/ConfirmationModal';
import { useState } from 'react';
import { MoreHorizontal, Edit, Trash, CheckCircle, Copy } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionTable({ transactions, onEdit, onRefresh }: Props) {
  const { user } = useAuthContext();
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!user || !deletingTransaction) return;
    setIsDeleting(true);
    try {
      const success = await transactionService.delete(deletingTransaction.id, deletingTransaction.type, user.id);
      if (success) {
        toast.success('Lançamento excluído com sucesso!');
        onRefresh();
      } else {
        toast.error('Não foi possível excluir o lançamento.');
      }
    } catch (err) {
      toast.error('Erro ao excluir lançamento.');
    } finally {
      setIsDeleting(false);
      setDeletingTransaction(null);
    }
  };

  const handleDuplicate = async (t: Transaction) => {
    if (!user) return;
    try {
      const { id, ...dataToSave } = t;
      await transactionService.save({
        ...dataToSave,
        date: new Date().toISOString().split('T')[0],
        description: `${t.description} (Cópia)`
      } as any, user.id);
      toast.success('Lançamento duplicado!');
      onRefresh();
    } catch (err) {
      toast.error('Erro ao duplicar.');
    }
  };

  const handleToggleStatus = async (t: Transaction) => {
    if (!user) return;
    if (t.type === 'income') return;
    const newStatus = t.status === 'paid' ? 'pending' : 'paid';
    try {
      await transactionService.update(t.id, t.type, { status: newStatus }, user.id);
      toast.success(`Status alterado para ${newStatus === 'paid' ? 'Pago' : 'Pendente'}`);
      onRefresh();
    } catch (err) {
      toast.error('Erro ao alterar status.');
    }
  };

  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  return (
    <Card className="p-0 border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição / Cliente</th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              const isMenuOpen = openMenuId === t.id;

              return (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group relative">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-bold text-slate-500">{formatDisplayDate(t.date)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {t.description || (('customer' in t ? t.customer : '') || 'Lançamento')}
                        </span>
                        {t.metadata?.placa && (
                          <span className="text-[10px] font-mono text-brand-primary font-bold">{String(t.metadata.placa)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn(
                      "text-sm font-black",
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isIncome ? '+' : '-'} {formatBRL(t.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : t.id);
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            isMenuOpen ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {isMenuOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-300/50 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                              <button 
                                onClick={() => {
                                  onEdit(t);
                                  setOpenMenuId(null);
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                              >
                                <Edit className="w-4 h-4 text-slate-400" /> Editar Registro
                              </button>
                              {!isIncome && (
                                <button 
                                  onClick={() => {
                                    handleToggleStatus(t);
                                    setOpenMenuId(null);
                                  }} 
                                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <CheckCircle className={cn("w-4 h-4", t.status === 'paid' ? "text-emerald-500" : "text-slate-400")} /> 
                                  {t.status === 'paid' ? 'Marcar Pendente' : 'Marcar como Pago'}
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  handleDuplicate(t);
                                  setOpenMenuId(null);
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                              >
                                <Copy className="w-4 h-4 text-slate-400" /> Duplicar Lançamento
                              </button>
                              <div className="h-px bg-slate-50 my-1" />
                              <button 
                                onClick={() => {
                                  setDeletingTransaction(t);
                                  setOpenMenuId(null);
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                              >
                                <Trash className="w-4 h-4 text-rose-400" /> Excluir Registro
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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

      <ConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir Lançamento?"
        description={`Você está prestes a excluir "${deletingTransaction?.description || (deletingTransaction && 'customer' in deletingTransaction ? deletingTransaction.customer : '') || 'Lançamento'}". Esta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
      />
    </Card>
  );
}
