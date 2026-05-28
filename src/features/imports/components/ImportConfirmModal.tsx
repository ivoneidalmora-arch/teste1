import { ImportSummary } from '../types/import.types';
import { Database, X, AlertTriangle } from 'lucide-react';

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: ImportSummary;
  isSaving: boolean;
}

export function ImportConfirmModal({ isOpen, onClose, onConfirm, summary, isSaving }: ImportConfirmModalProps) {
  if (!isOpen) return null;

  const willNotSave = summary.invalidItems + summary.duplicateItems + summary.ignoredItems;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!isSaving ? onClose : undefined} />
      
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-8 text-center relative">
          <button 
            onClick={!isSaving ? onClose : undefined}
            disabled={isSaving}
            className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-emerald-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Confirmar Importação</h2>
          
          <div className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
            <p>Você está prestes a importar <strong className="text-emerald-600">{summary.readyToSave} lançamentos válidos</strong>.</p>
            
            {willNotSave > 0 && (
              <div className="mt-4 p-4 bg-rose-50 rounded-2xl flex gap-3 text-left items-start">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-[12px]">
                  <strong>{willNotSave} lançamentos</strong> (inconsistentes, duplicados não aprovados ou ignorados) <strong className="underline">não serão salvos</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-4 text-[11px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              disabled={isSaving}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
