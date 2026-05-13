"use client";

import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  FileEdit, 
  ShieldCheck, 
  Trash2, 
  ChevronRight,
  Target,
  ShieldAlert
} from 'lucide-react';
import { InconsistencyRecord, AuditSeverity } from '../../types/diagnostics.types';
import { formatBRL, cn } from '@/core/utils/formatters';

interface AuditIssueCardProps {
  record: InconsistencyRecord;
  onEdit: (record: InconsistencyRecord) => void;
  onApprove: (record: InconsistencyRecord) => void;
  onDelete?: (record: InconsistencyRecord) => void;
  onViewDetails?: (record: InconsistencyRecord) => void;
}

export function AuditIssueCard({ record, onEdit, onApprove, onDelete, onViewDetails }: AuditIssueCardProps) {
  
  const getSeverityConfig = (severity: AuditSeverity) => {
    switch(severity) {
      case 'critical': return { 
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />, 
        bg: 'bg-rose-50', 
        border: 'border-rose-200',
        text: 'text-rose-700',
        label: 'Crítico',
        badge: 'bg-rose-600 text-white'
      };
      case 'alert': return { 
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, 
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        text: 'text-amber-700',
        label: 'Alerta',
        badge: 'bg-amber-500 text-white'
      };
      default: return { 
        icon: <Info className="w-5 h-5 text-blue-600" />, 
        bg: 'bg-blue-50', 
        border: 'border-blue-200',
        text: 'text-blue-700',
        label: 'Informativo',
        badge: 'bg-blue-500 text-white'
      };
    }
  };

  const config = getSeverityConfig(record.severity);

  return (
    <div className={cn(
      "group bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
      config.border
    )}>
      {/* Header do Card */}
      <div className={cn("px-6 py-4 flex items-center justify-between", config.bg)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            {config.icon}
          </div>
          <div>
            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full mb-1 inline-block", config.badge)}>
              {config.label}
            </span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">{record.description}</h4>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor do Registro</p>
          <p className="text-sm font-black text-slate-900">{formatBRL(record.value)}</p>
        </div>
      </div>

      {/* Detalhes Técnicos */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1"><Target className="w-3.5 h-3.5 text-slate-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campo Afetado</p>
              <p className="text-xs font-bold text-slate-700">{record.affectedField || 'Múltiplos'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1"><AlertTriangle className="w-3.5 h-3.5 text-slate-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problema Real</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{record.details}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1"><ShieldAlert className="w-3.5 h-3.5 text-slate-400" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto no Sistema</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{record.impact || 'Pode afetar a precisão dos seus relatórios financeiros.'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ação Recomendada</p>
            <p className="text-xs font-bold text-blue-600 italic">{`"${record.recommendation || 'Revise o lançamento e corrija os dados ausentes.'}"`}</p>
          </div>
        </div>
      </div>

      {/* Rodapé de Ações */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro de {record.transactionType === 'income' ? 'Receita' : 'Despesa'}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-bold text-slate-500">{record.date.split('-').reverse().join('/')}</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => onApprove(record)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-10 bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Aprovar
          </button>
          
          <button 
            onClick={() => onEdit(record)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-10 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-200"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Editar {record.transactionType === 'income' ? 'Receita' : 'Despesa'}
          </button>

          <button 
            onClick={() => onDelete && onDelete(record)}
            className="w-10 h-10 flex items-center justify-center bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 rounded-xl transition-all"
            title="Excluir Lançamento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
