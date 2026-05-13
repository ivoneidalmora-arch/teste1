"use client";

import { useState, useMemo } from 'react';
import { X, ShieldAlert, CheckCircle2, Filter, ChevronDown } from 'lucide-react';
import { InconsistencyRecord, AuditStatus } from '../../types/diagnostics.types';
import { AuditIssueCard } from './AuditIssueCard';
import { AuditApprovalModal } from './AuditApprovalModal';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';
import { toast } from 'sonner';

interface InconsistenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: InconsistencyRecord[];
  userId: string;
  onRefresh: () => void;
  onEditTransaction?: (transaction: any) => void;
}

type FilterStatus = 'all' | 'pending' | 'critical' | 'alert' | 'income' | 'expense';

export function InconsistenciesModal({ isOpen, onClose, records, userId, onRefresh, onEditTransaction }: InconsistenciesModalProps) {
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [approvingRecord, setApprovingRecord] = useState<InconsistencyRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filter === 'all') return true;
      if (filter === 'pending') return r.status === 'pending';
      if (filter === 'critical') return r.severity === 'critical';
      if (filter === 'alert') return r.severity === 'alert';
      if (filter === 'income') return r.transactionType === 'income';
      if (filter === 'expense') return r.transactionType === 'expense';
      return true;
    });
  }, [records, filter]);

  if (!isOpen) return null;

  const handleDelete = async (record: InconsistencyRecord) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento permanentemente?')) return;
    
    try {
      await transactionService.delete(record.transactionId, record.transactionType, userId);
      toast.success('Lançamento excluído com sucesso.');
      onRefresh();
    } catch (err) {
      toast.error('Erro ao excluir lançamento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
        
        {/* Header Premium */}
        <div className="p-8 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-white relative z-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-[1.25rem] flex items-center justify-center border border-rose-100 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Central de Auditoria</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {records.length} {records.length === 1 ? 'Inconsistência identificada' : 'Inconsistências identificadas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <Filter className="w-4 h-4 text-slate-400 ml-3 mr-2" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer pr-8"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="critical">Críticas</option>
                <option value="alert">Alertas</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>

            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Listagem de Cards */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6 opacity-30" />
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Nada por aqui!</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto italic">
                {filter === 'pending' 
                  ? 'Todos os lançamentos estão consistentes ou foram revisados.' 
                  : 'Nenhum registro encontrado para este filtro.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 pb-8">
              {filteredRecords.map((record) => (
                <AuditIssueCard 
                  key={record.id}
                  record={record}
                  onEdit={() => onEditTransaction && onEditTransaction(record.rawRecord)}
                  onApprove={(rec) => setApprovingRecord(rec)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Informativo */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Auditoria financeira inteligente • v2.0
          </p>
        </div>
      </div>

      {/* Modal de Aprovação Individual */}
      <AuditApprovalModal 
        isOpen={!!approvingRecord}
        onClose={() => setApprovingRecord(null)}
        record={approvingRecord}
        userId={userId}
        onSuccess={() => onRefresh()}
      />
    </div>
  );
}
