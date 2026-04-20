"use client";

import { ArrowDownRight, ArrowUpRight, Clock, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import { storageService } from '@/services/storage';
import { Transaction, IncomeTransaction } from '@/types/transaction';

interface RecentActivityProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onRefresh: () => void;
}

export function RecentActivity({ transactions, onEdit, onRefresh }: RecentActivityProps) {
  // Pegar as ultimas 6 transações considerando que o array root já veio formatado decrescente
  const recent = transactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="bg-white border-detran rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center h-full min-h-[350px]">
         <Clock className="w-12 h-12 text-slate-200 mb-4" />
         <p className="text-slate-500 font-medium text-sm">Nenhuma atividade recente</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-detran rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 h-full flex flex-col min-h-[350px]">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 mb-6 flex items-center gap-2">
        Atividade Recente <span className="flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] w-5 h-5 rounded-full ml-1">{Math.min(transactions.length, 6)}</span>
      </h3>
      
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {recent.map((t, index) => {
          const isIncome = t.type === 'income';
          
          return (
            <div key={`${t.id}-${index}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  isIncome ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 line-clamp-1">
                    {isIncome ? (t as IncomeTransaction).cliente || 'Movimentação Sem Nome' : (t as any).description || 'Despesa'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {t.category} • {format(new Date(t.date), "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end mr-2">
                  <span className={cn(
                    "text-sm font-bold",
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {isIncome ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.')) {
                        const success = await storageService.deleteTransaction(t.id, t.type);
                        if (success) onRefresh();
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-brand-primary bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
        Ver Todas
      </button>
    </div>
  );
}
