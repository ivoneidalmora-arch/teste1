"use client";

import { useState, useMemo } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { DuplicateGroup, DuplicateRecord, DuplicateStatus } from '../types/insights.types';
import { formatBRL, cn } from '@/core/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  EyeOff, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  Tag,
  DollarSign
} from 'lucide-react';
import { duplicateReviewService } from '../services/duplicate-review.service';
import { transactionService } from '@/features/finance/services/transaction.service';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';
import { ConfirmationModal } from '@/core/components/ConfirmationModal';
import { toast } from 'sonner';

interface DuplicateAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: DuplicateGroup[];
  userId: string;
  onRefresh: () => void;
}

import { updateDuplicateStatusAction } from '../actions/duplicate.actions';

export function DuplicateAlertsModal({ isOpen, onClose, groups, userId, onRefresh }: DuplicateAlertsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DuplicateStatus | 'all'>('pending_review');
  const [loading, setLoading] = useState<string | null>(null);
  
  const [editingRecord, setEditingRecord] = useState<DuplicateRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DuplicateRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ groupKey: string, status: DuplicateStatus, title: string, desc: string } | null>(null);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = group.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           group.cliente?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : group.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [groups, searchTerm, statusFilter]);

  const handleUpdateStatus = async (groupKey: string, status: DuplicateStatus) => {
    setLoading(groupKey);
    try {
      const result = await updateDuplicateStatusAction(userId, groupKey, status);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Status atualizado para: ${status.replace('_', ' ')}`);
      onRefresh();
      setConfirmAction(null);
    } catch (err: any) {
      toast.error(`Erro ao atualizar status: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteRecord = async (record: DuplicateRecord) => {
    setLoading(record.id);
    try {
      // Nota: Precisamos do tipo da transação. Como são duplicidades de placa, geralmente são 'income'
      await transactionService.delete(record.id, 'income', userId);
      toast.success("Lançamento excluído com sucesso.");
      onRefresh();
      setConfirmDelete(null);
    } catch (err) {
      toast.error("Erro ao excluir lançamento.");
    } finally {
      setLoading(null);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[8px] font-black uppercase">Confiança Alta</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] font-black uppercase">Confiança Média</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase">Confiança Baixa</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review': return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[8px] font-black uppercase">Pendente</span>;
      case 'confirmed_duplicate': return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[8px] font-black uppercase">Confirmada</span>;
      case 'not_duplicate': return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase">Válida (Não Duplicada)</span>;
      case 'ignored': return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase">Ignorada</span>;
      case 'resolved': return <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase">Resolvida</span>;
      default: return null;
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Central de Auditoria de Duplicidades"
      headerColorContext="warning"
    >
      <div className="space-y-6 min-h-[500px]">
        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por placa ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="pending_review">Pendentes</option>
              <option value="confirmed_duplicate">Confirmadas</option>
              <option value="not_duplicate">Não é duplicidade</option>
              <option value="ignored">Ignoradas</option>
              <option value="resolved">Resolvidas</option>
            </select>
          </div>
        </div>

        {/* Lista de Grupos */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.groupKey} className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden group">
                {/* Header do Grupo */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                       <span className="text-xs font-black text-slate-900 tracking-wider uppercase">{group.placa}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.servico}</span>
                      <span className="text-[10px] font-bold text-slate-500">Intervalo de {group.daysBetween} dias entre lançamentos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getConfidenceBadge(group.confidence)}
                    {getStatusBadge(group.status)}
                  </div>
                </div>

                {/* Registros Lado a Lado */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-8 h-8 bg-slate-50 border border-slate-100 rounded-full items-center justify-center text-slate-300 z-10">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {group.records.map((record, idx) => (
                    <div key={record.id} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all group/record">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registro {idx + 1}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover/record:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingRecord(record)}
                            className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(record)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">
                            {format(new Date(record.date + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 truncate">{record.cliente || 'Particular'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-slate-900">{formatBRL(record.amountLiquido || record.amount || 0)}</span>
                            <span className="text-[10px] font-bold text-slate-400">(Bruto: {formatBRL(record.amountBruto || 0)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ações do Grupo */}
                <div className="px-6 py-4 bg-white border-t border-slate-50 flex flex-wrap items-center justify-end gap-3">
                  {group.status === 'pending_review' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(group.groupKey, 'ignored')}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Ignorar
                      </button>
                      <button 
                        onClick={() => setConfirmAction({ 
                          groupKey: group.groupKey, 
                          status: 'not_duplicate',
                          title: 'Confirmar como Válido?',
                          desc: 'Você confirma que estes lançamentos NÃO são duplicados e ambos são legítimos?'
                        })}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Não é duplicidade
                      </button>
                      <button 
                        onClick={() => setConfirmAction({ 
                          groupKey: group.groupKey, 
                          status: 'confirmed_duplicate',
                          title: 'Confirmar Duplicidade?',
                          desc: 'Isso marcará este grupo como duplicidade real. Recomendamos excluir um dos registros para manter o financeiro correto.'
                        })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Validar Duplicidade
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(group.groupKey, 'pending_review')}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline"
                    >
                      Mover para Pendentes
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Tudo em ordem!</p>
              <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">Nenhuma duplicidade pendente foi encontrada para os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modais de Suporte */}
      {editingRecord && (
        <EditTransactionModal 
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            onRefresh();
          }}
          transaction={editingRecord as any}
          existingTransactions={[]} // Opcional: passar lista para checagem em tempo real
        />
      )}

      {confirmDelete && (
        <ConfirmationModal 
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteRecord(confirmDelete)}
          title="Excluir Lançamento?"
          description={`Tem certeza que deseja excluir o lançamento de ${formatBRL(confirmDelete.amountLiquido || 0)} do dia ${format(new Date(confirmDelete.date + 'T12:00:00'), 'dd/MM')}? Esta ação não pode ser desfeita.`}
          variant="danger"
          confirmText="Sim, Excluir"
          loading={loading === confirmDelete.id}
        />
      )}

      {confirmAction && (
        <ConfirmationModal 
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => handleUpdateStatus(confirmAction.groupKey, confirmAction.status)}
          title={confirmAction.title}
          description={confirmAction.desc}
          variant={confirmAction.status === 'confirmed_duplicate' ? 'warning' : 'success'}
          confirmText="Confirmar"
          loading={loading === confirmAction.groupKey}
        />
      )}
    </BaseModal>
  );
}
