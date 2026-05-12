"use client";

import { useState } from 'react';
import { X, AlertTriangle, Search, CheckCircle2, FileEdit } from 'lucide-react';
import { InconsistencyRecord } from '../../types/diagnostics.types';
import { updateDuplicateStatusAction } from '../../actions/duplicate.actions';
import { formatBRL, cn } from '@/core/utils/formatters';
import { toast } from 'sonner';

interface InconsistenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: InconsistencyRecord[];
  userId: string;
  onRefresh: () => void;
  onEditTransaction?: (transaction: any) => void;
}

export function InconsistenciesModal({ isOpen, onClose, records, userId, onRefresh, onEditTransaction }: InconsistenciesModalProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateDuplicate = async (groupId: string) => {
    try {
      setProcessingId(groupId);
      const res = await updateDuplicateStatusAction(userId, groupId, 'ignored');
      if (res.error) throw new Error(res.error);
      
      toast.success('Duplicidade ignorada com sucesso!');
      onRefresh(); // Recarrega os dados do painel, o que fará a inconsistência sumir
    } catch (err: any) {
      toast.error(err.message || 'Erro ao validar duplicidade');
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'duplicate': return <Search className="w-5 h-5 text-orange-500" />;
      case 'invalid_value': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 pb-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100 shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Central de Auditoria</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {records.length} {records.length === 1 ? 'Inconsistência encontrada' : 'Inconsistências encontradas'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {records.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Tudo Certo!</h3>
              <p className="text-sm font-medium text-slate-500">Nenhuma inconsistência pendente de revisão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {record.date.split('-').reverse().join('/')}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          record.transactionType === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        )}>
                          {record.transactionType === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {record.description}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-1 max-w-lg">
                        {record.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:ml-auto">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</p>
                      <p className="text-sm font-black text-slate-900">{formatBRL(record.value)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {record.type === 'duplicate' && record.groupId && (
                        <button
                          onClick={() => handleValidateDuplicate(record.groupId!)}
                          disabled={processingId === record.groupId}
                          className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {processingId === record.groupId ? 'Validando...' : 'Ignorar Alerta'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => onEditTransaction && onEditTransaction(record.rawRecord)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
