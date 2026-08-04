import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { InvoiceImportData } from '../schemas/invoice.schema';
import { cn } from '@/core/utils/formatters';

interface Props {
  isOpen: boolean;
  item: InvoiceImportData | null;
  onClose: () => void;
  onSave: (item: InvoiceImportData) => void;
}

export function InvoiceCorrectionModal({ isOpen, item, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<InvoiceImportData>>({});
  
  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || formData.placa === 'PLACA NÃO IDENTIFICADA') {
      // Allow user to try saving, the hook will re-validate and mark as error if invalid
    }
    
    // Auto convert to upper and remove spaces for plate
    const cleanPlate = formData.placa 
      ? formData.placa.toUpperCase().replace(/\s/g, '') 
      : '';

    onSave({
      ...item,
      ...formData,
      placa: cleanPlate
    } as InvoiceImportData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Editar Nota Fiscal</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {item.errors && item.errors.length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Problemas encontrados</h4>
                <ul className="mt-1 text-[11px] font-medium text-rose-700 list-disc list-inside">
                  {item.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form id="invoice-edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</label>
                <input 
                  type="date" 
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Placa</label>
                <input 
                  type="text" 
                  value={formData.placa === 'PLACA NÃO IDENTIFICADA' ? '' : formData.placa || ''}
                  onChange={e => setFormData({ ...formData, placa: e.target.value })}
                  placeholder="ABC1234"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente</label>
              <input 
                type="text" 
                value={formData.cliente || ''}
                onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Situação</label>
                <input 
                  type="text" 
                  value={formData.statusNota || ''}
                  onChange={e => setFormData({ ...formData, statusNota: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor Bruto (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.grossValue || ''}
                  onChange={e => setFormData({ ...formData, grossValue: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discriminação Original</label>
              <textarea 
                readOnly
                value={formData.description || ''}
                className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 outline-none resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="invoice-edit-form"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
