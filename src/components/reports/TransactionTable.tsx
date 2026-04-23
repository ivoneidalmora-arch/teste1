import { Edit2, Trash2 } from 'lucide-react';
import { Transaction, IncomeTransaction } from '@/types/transaction';
import { formatBRL, formatDisplayDate } from '@/utils/formatters';
import { storageService } from '@/services/storage';
import { cn } from '@/utils/cn';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionTable({ transactions, onEdit, onRefresh }: Props) {
  const handleDelete = async (t: Transaction) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.')) {
      const success = await storageService.deleteTransaction(t.id, t.type);
      if (success) onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl border-detran overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">Listagem Resultante</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded-md">
          Total: {transactions.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100/50">
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificação</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor Final</th>
              <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">Nenhum resultado filtrado.</td>
              </tr>
            ) : (
              transactions.map((t, i) => {
                const isInc = t.type === 'income';
                const inc = t as IncomeTransaction;
                
                return (
                  <tr key={`${t.id}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-800 font-medium">{formatDisplayDate(t.date)}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{formatDisplayDate(t.date, 'eeee')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-800 font-medium">{t.category}</td>
                    <td className="py-3 px-6 text-sm text-slate-600">
                      {isInc ? (inc.cliente || 'S/N') : ((t as any).description || 'Despesa')}
                      {isInc && inc.placa && (
                        <span className="ml-2 px-2 py-0.5 bg-slate-200/50 text-[10px] rounded border border-slate-200 font-mono">
                          {inc.placa}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isInc ? "bg-brand-success/10 text-brand-success" : ((t as any).status === 'Pago' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")
                      )}>
                        {isInc ? 'Recebido' : (t as any).status}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-right whitespace-nowrap">
                      {isInc ? (
                        <span className="text-brand-success">+{formatBRL(inc.amountLiquido || t.amount)}</span>
                      ) : (
                        <span className="text-brand-danger">-{formatBRL(t.amount)}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
