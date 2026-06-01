"use client";

import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InconsistencyRecord } from '../../types/diagnostics.types';
import { updateAuditIssueAction } from '../../actions/audit.actions';
import { toast } from 'sonner';

interface AuditApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: InconsistencyRecord | null;
  userId: string;
  onSuccess: () => void;
}

export function AuditApprovalModal({ isOpen, onClose, record, userId, onSuccess }: AuditApprovalModalProps) {
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double clicks
    if (!justification.trim()) {
      return toast.error('A justificativa é obrigatória para aprovar uma inconsistência.');
    }

    setLoading(true);
    try {
      const res = await updateAuditIssueAction(
        userId,
        record.transactionId,
        record.type,
        'approved',
        {
          issue_title: record.description,
          issue_description: record.details,
          affected_field: record.affectedField,
          current_value: String(record.currentValue),
          expected_rule: record.expectedRule,
          severity: record.severity,
          approval_reason: justification.toUpperCase(),
          approved_at: new Date().toISOString(),
          approved_by: userId
        },
        record.transactionType
      );

      if (res.error) throw new Error(res.error);

      toast.success('Inconsistência aprovada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("[AuditApprovalModal] Erro ao aprovar inconsistência:", err);
      const msg = err.message || '';
      if (msg.includes('invalid input syntax for type uuid') || msg.includes('UUID') || msg.includes('uuid')) {
        toast.error('Não foi possível aprovar esta inconsistência porque o identificador interno está inválido. Verifique a importação ou tente atualizar a página.');
      } else {
        toast.error(msg || 'Erro ao aprovar inconsistência');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Aprovar com Justificativa</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Problema Detectado</p>
            <h4 className="text-sm font-bold text-slate-900">{record.description}</h4>
            <p className="text-xs text-slate-500 mt-1">{record.details}</p>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Justificativa do Especialista</label>
              <textarea 
                required
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                disabled={loading}
                placeholder="Explique por que este lançamento está correto mesmo com este alerta..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none disabled:opacity-50"
              />
            </div>
 
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmar Aprovação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
