import { useState, useEffect } from 'react';
import { ImportedTransaction } from '../types/import.types';
import { X, Save } from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';

interface ImportEditModalProps {
  item: ImportedTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<ImportedTransaction>) => void;
}

export function ImportEditModal({ item, isOpen, onClose, onSave }: ImportEditModalProps) {
  const [formData, setFormData] = useState<Partial<ImportedTransaction>>({});

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        date: item.date || '',
        placa: item.placa || '',
        cliente: item.cliente || '',
        service: item.service || '',
        category: item.category || '',
        grossValue: item.grossValue || 0,
        netValue: item.netValue || 0,
        description: item.description || ''
      });
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleChange = (field: keyof ImportedTransaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(item.id, {
      ...formData,
      grossValue: Number(formData.grossValue) || 0,
      netValue: Number(formData.netValue) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <IconBadge icon={Save} variant="blue" size="sm" />
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Editar Lançamento</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refaça a validação automaticamente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Data</label>
              <input 
                type="date"
                value={formData.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Placa</label>
              <input 
                type="text"
                value={formData.placa || ''}
                onChange={(e) => handleChange('placa', e.target.value)}
                placeholder="ABC-1234"
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Cliente</label>
            <input 
              type="text"
              value={formData.cliente || ''}
              onChange={(e) => handleChange('cliente', e.target.value)}
              placeholder="Nome do cliente"
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Serviço</label>
              <input 
                type="text"
                value={formData.service || ''}
                onChange={(e) => handleChange('service', e.target.value)}
                placeholder="Serviço realizado"
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Categoria</label>
              <input 
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Categoria"
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Valor Bruto</label>
              <input 
                type="number"
                step="0.01"
                value={formData.grossValue || ''}
                onChange={(e) => handleChange('grossValue', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Valor Líquido</label>
              <input 
                type="number"
                step="0.01"
                value={formData.netValue || ''}
                onChange={(e) => handleChange('netValue', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Observação</label>
            <input 
              type="text"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            Salvar e Revalidar
          </button>
        </div>
      </div>
    </div>
  );
}
