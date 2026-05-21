import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Trash2, Edit2, ShieldAlert, CheckCircle, Save, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { DuplicateGroup, DuplicateRecord } from '../../types/insights.types';
import { deleteTransactionAction, updateTransactionAction } from '@/features/finance/actions/transaction.actions';
import { updateDuplicateStatusAction } from '../../actions/duplicate.actions';
import { auditService } from '../../services/audit.service';
import { activitiesService } from '../../services/activities.service';
import { formatBRL } from '@/core/utils/formatters';

interface DuplicateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: DuplicateGroup | null;
  userId: string;
  onActionCompleted: () => void;
}

export default function DuplicateReviewModal({
  isOpen,
  onClose,
  group,
  userId,
  onActionCompleted
}: DuplicateReviewModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DuplicateRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEditingId(null);
    setEditForm({});
  }, [group]);

  if (!isOpen || !group) return null;

  const handleEditClick = (record: DuplicateRecord) => {
    setEditingId(record.id);
    setEditForm({
      id: record.id,
      cliente: record.cliente,
      placa: record.placa,
      servico: record.servico,
      date: record.date,
      amount: record.amountBruto || record.amountLiquido || record.amount || 0
    });
  };

  const handleSaveEdit = async (recordType: 'income' | 'expense') => {
    if (!editingId) return;
    setIsSubmitting(true);
    const saveToast = toast.loading('Salvando alterações...');

    try {
      const payload: any = {
        date: editForm.date,
        amount: Number(editForm.amount),
        category: group.servico // Mantém a mesma categoria como padrão
      };

      if (recordType === 'income') {
        payload.grossAmount = Number(editForm.amount);
        payload.netAmount = Number(editForm.amount); // simplificado
        payload.customer = editForm.cliente;
        payload.metadata = { placa: editForm.placa };
      } else {
        payload.description = editForm.servico;
      }

      await updateTransactionAction(editingId, recordType, payload);
      
      // Registrar log de auditoria
      await auditService.log(userId, {
        action: 'EDIT_DUPLICATE_RECORD',
        entityType: recordType === 'income' ? 'RECEITA' : 'DESPESA',
        entityId: editingId,
        newData: payload
      });

      // Registrar atividade do sistema
      await activitiesService.register(userId, {
        type: 'info',
        title: 'Lançamento Editado na Revisão',
        description: `O lançamento ID ${editingId} foi ajustado durante revisão de duplicidades.`,
        category: 'audit'
      });

      toast.success('Lançamento atualizado com sucesso!', { id: saveToast });
      setEditingId(null);
      onActionCompleted();
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao salvar: ${error.message || 'Erro desconhecido'}`, { id: saveToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (record: DuplicateRecord) => {
    const isConfirmed = window.confirm(
      `Tem certeza que deseja excluir esta ${record.type === 'income' ? 'receita' : 'despesa'} de ${formatBRL(record.amountBruto || record.amountLiquido || record.amount || 0)}? Esta ação não pode ser desfeita.`
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    const deleteToast = toast.loading('Excluindo lançamento...');

    try {
      // 1. Chamar action de exclusão física/lógica (soft-delete)
      await deleteTransactionAction(record.id, record.type);

      // 2. Atualizar status do grupo de duplicidades no banco para 'resolved'
      await updateDuplicateStatusAction(userId, group.groupKey, 'resolved', {
        notes: `Resolvido via exclusão do lançamento ID ${record.id}`
      });

      // 3. Gravar na auditoria
      await auditService.log(userId, {
        action: 'RESOLVE_DUPLICATE_DELETE',
        entityType: 'duplicate_review',
        entityId: group.groupKey,
        oldData: record,
        newData: { status: 'resolved', deletedRecordId: record.id }
      });

      // 4. Registrar atividade do sistema
      await activitiesService.register(userId, {
        type: 'success',
        title: 'Duplicidade Resolvida',
        description: `Lançamento duplicado de ${formatBRL(record.amountBruto || record.amount || 0)} foi excluído com sucesso.`,
        category: 'financial'
      });

      toast.success('Lançamento excluído e duplicidade resolvida!', { id: deleteToast });
      onActionCompleted();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao excluir: ${error.message || 'Erro desconhecido'}`, { id: deleteToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsNotDuplicate = async () => {
    setIsSubmitting(true);
    const actionToast = toast.loading('Registrando integridade dos lançamentos...');

    try {
      await updateDuplicateStatusAction(userId, group.groupKey, 'not_duplicate', {
        notes: 'Lançamentos revisados e validados como registros legítimos e independentes.'
      });

      await auditService.log(userId, {
        action: 'MARK_NOT_DUPLICATE',
        entityType: 'duplicate_review',
        entityId: group.groupKey,
        newData: { status: 'not_duplicate' }
      });

      await activitiesService.register(userId, {
        type: 'success',
        title: 'Grupo de Lançamentos Validado',
        description: `Grupo com placa ${group.placa || 'N/A'} e serviço ${group.servico} foi marcado como legítimo.`,
        category: 'financial'
      });

      toast.success('Lançamentos marcados como legítimos!', { id: actionToast });
      onActionCompleted();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao atualizar: ${error.message || 'Erro desconhecido'}`, { id: actionToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="h-full w-full max-w-3xl bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Revisar Suspeita de Duplicidade</h2>
              <p className="text-xs text-slate-400">Grupo: {group.placa} • {group.servico}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informações Gerais do Grupo */}
        <div className="px-6 py-4 bg-amber-500/5 border-b border-slate-800/60 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Nível de Confiança da IA: <strong>{group.confidence === 'high' ? 'Alta' : group.confidence === 'medium' ? 'Média' : 'Baixa'}</strong></span>
          </div>
          <div className="text-slate-400">
            Diferença: <strong>{group.daysBetween === 0 ? 'Mesmo dia' : `${group.daysBetween} dia(s)`}</strong>
          </div>
        </div>

        {/* Conteúdo Principal (Lado a Lado) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {group.records.map((record, index) => {
              const isEditingThis = editingId === record.id;
              const val = record.amountBruto || record.amountLiquido || record.amount || 0;

              return (
                <div key={record.id} className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden flex flex-col justify-between">
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/40">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Lançamento {index + 1}
                    </span>
                    <span className="text-xs text-slate-500">ID: {record.id.slice(0, 8)}...</span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 space-y-4 text-sm text-slate-300">
                    {isEditingThis ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Cliente / Descrição</label>
                          <input 
                            type="text" 
                            value={editForm.cliente || ''} 
                            onChange={e => setEditForm({ ...editForm, cliente: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Placa</label>
                          <input 
                            type="text" 
                            value={editForm.placa || ''} 
                            onChange={e => setEditForm({ ...editForm, placa: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Serviço</label>
                          <input 
                            type="text" 
                            value={editForm.servico || ''} 
                            onChange={e => setEditForm({ ...editForm, servico: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Data</label>
                          <input 
                            type="date" 
                            value={editForm.date ? editForm.date.slice(0, 10) : ''} 
                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
                          <input 
                            type="number" 
                            value={editForm.amount || 0} 
                            onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <span className="block text-xs text-slate-500 uppercase font-semibold">Cliente</span>
                          <span className="text-white font-medium">{record.cliente || 'Sem cliente'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs text-slate-500 uppercase font-semibold">Placa</span>
                            <span className="text-white font-mono">{record.placa || 'Sem placa'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 uppercase font-semibold">Serviço</span>
                            <span className="text-white">{record.servico || 'Sem serviço'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs text-slate-500 uppercase font-semibold">Data</span>
                            <span className="text-white">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 uppercase font-semibold">Valor Bruto</span>
                            <span className="text-emerald-400 font-bold">{formatBRL(val)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-500 uppercase font-semibold">Tipo</span>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            record.type === 'income' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {record.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 border-t border-slate-850 flex justify-end gap-2 bg-slate-900/20">
                    {isEditingThis ? (
                      <>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(record.type)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                          disabled={isSubmitting}
                        >
                          <Save className="h-3.5 w-3.5" /> Salvar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(record)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                          disabled={isSubmitting}
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-650 hover:bg-red-500 text-white rounded-md transition-colors"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dicas e Recomendações */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aviso de Regras de Negócio</h4>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>A exclusão aplica o mecanismo de soft-delete, podendo ser restaurado pela auditoria se necessário.</li>
              <li>Marcar como &quot;Não duplicado&quot; arquivará permanentemente este alerta e não sugerirá mais este par como duplicidade.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-between bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-sm"
            disabled={isSubmitting}
          >
            Fechar
          </button>
          
          <button
            onClick={handleMarkAsNotDuplicate}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg transition-all font-semibold shadow-lg shadow-indigo-600/10 text-sm"
            disabled={isSubmitting}
          >
            <CheckCircle className="h-4 w-4" /> Validar: Não são duplicados
          </button>
        </div>
      </div>
    </div>
  );
}
