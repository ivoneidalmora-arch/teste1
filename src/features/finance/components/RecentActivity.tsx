import { ArrowDownRight, ArrowUpRight, Clock, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';
import { formatDisplayDate } from '@/core/utils/date';
import { Transaction, IncomeTransaction } from '@/core/types/finance';
import { transactionService } from '../services/transaction.service';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onRefresh: () => void;
}

export function RecentActivity({ transactions = [], onEdit, onRefresh }: Props) {
  const safeTransactions = transactions || [];
  const recent = safeTransactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
         <Clock className="w-12 h-12 text-slate-200 mb-4" />
         <p className="text-slate-500 font-medium text-sm">Nenhuma atividade recente</p>
      </Card>
    );
  }

  const handleDelete = async (t: Transaction) => {
    if (!t.id) return;
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const success = await transactionService.delete(String(t.id), t.type);
      if (success) onRefresh();
    }
  };

  return (
    <Card className="h-auto flex flex-col p-2.5">
      <div className="flex items-center justify-between mb-3">
        <CardHeader 
          title="Atividade Recente" 
          icon={Clock}
        />
        <span className="flex items-center justify-center bg-blue-100 text-blue-700 text-[8px] w-4 h-4 rounded-full ml-1">
          {recent.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
        <div className="divide-y divide-slate-100">
          {recent.map((t, index) => {
            if (!t) return null;
            const isIncome = t.type === 'income';
            
            return (
              <div key={`${t.id}-${index}`} className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50/80 transition-all group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:shadow-sm",
                    isIncome 
                      ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105" 
                      : "bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:scale-105"
                  )}>
                    {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-800 truncate group-hover:text-brand-primary transition-colors">
                        {t.description || t.customer || 'Lançamento'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        {formatDisplayDate(t.date)}
                      </span>
                      <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                      <span className="text-[8px] font-bold text-brand-primary/60 uppercase tracking-tighter truncate">
                        {t.category || 'Outros'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end mr-0.5">
                    <span className={cn(
                      "text-[11px] font-black tracking-tight",
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {isIncome ? '+' : '-'} {formatBRL(t.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
