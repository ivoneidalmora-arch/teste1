import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Trash2, Info } from 'lucide-react';
import { normalizeCurrencyValue, getNetValueFor2025, shouldApplyAutoNetValue, getNetValueAutomationStatus } from '@/lib/financial-rules';
import { cn } from '@/core/utils/formatters';

interface ExtractedData {
  data: string;
  placa: string;
  cliente: string;
  categoria: string;
  valorBruto: number;
  valorLiquido: number;
  automationLabel?: string;
  isAutoApplied?: boolean;
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExtractedData[];
  onConfirm: (finalData: ExtractedData[]) => void;
  rawResponse?: string;
  logs?: string[];
}

export function ImportPreviewModal({ 
  isOpen, 
  onClose, 
  data: initialData, 
  onConfirm, 
  rawResponse, 
  logs 
}: ImportPreviewModalProps) {
  // Inicializar itens com valores líquidos calculados se necessário
  const [items, setItems] = useState<ExtractedData[]>(() => {
    return initialData.map(item => {
      const gross = normalizeCurrencyValue(item.valorBruto);
      const status = getNetValueAutomationStatus({
        amountBruto: gross,
        valor_liquido: item.valorLiquido || 0,
        date: item.data
      });
      
      return {
        ...item,
        valorBruto: gross,
        valorLiquido: status.status === 'applied' ? status.autoNetValue! : (item.valorLiquido || gross),
        automationLabel: status.label,
        isAutoApplied: status.status === 'applied'
      };
    });
  });

  const [showDebug, setShowDebug] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar dados iniciais quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setItems(initialData.map(item => {
        const gross = normalizeCurrencyValue(item.valorBruto);
        const status = getNetValueAutomationStatus({
          amountBruto: gross,
          valor_liquido: item.valorLiquido || 0,
          date: item.data
        });
        
        return {
          ...item,
          valorBruto: gross,
          valorLiquido: status.status === 'applied' ? status.autoNetValue! : (item.valorLiquido || gross),
          automationLabel: status.label,
          isAutoApplied: status.status === 'applied'
        };
      }));
    }
  }, [initialData, isOpen]);

  // Bloquear scroll do body e fechar no Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ExtractedData, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      const updatedItem = { ...newItems[index], [field]: value };
      
      // Recalcular automação se data ou valor bruto mudar
      if (field === 'data' || field === 'valorBruto') {
        const gross = normalizeCurrencyValue(updatedItem.valorBruto);
        const status = getNetValueAutomationStatus({
          amountBruto: gross,
          valor_liquido: updatedItem.valorLiquido,
          date: updatedItem.data
        });

        if (status.status === 'applied') {
          updatedItem.valorLiquido = status.autoNetValue!;
          updatedItem.isAutoApplied = true;
        } else {
          updatedItem.isAutoApplied = false;
        }
        updatedItem.automationLabel = status.label;
      }

      newItems[index] = updatedItem;
      return newItems;
    });
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      {/* Overlay Background */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[1100px] max-h-[90vh] max-sm:max-w-[95vw] max-sm:max-h-[92vh] overflow-hidden rounded-2xl bg-slate-950 shadow-2xl flex flex-col border border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header - Fixo */}
        <header className="shrink-0 p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 id="import-modal-title" className="text-xl font-bold text-white">Conferir Importação</h2>
            <p className="text-sm text-slate-400">Verifique os dados extraídos pela IA antes de salvar no sistema.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              className="text-xs font-bold px-3 py-1.5 bg-emerald-900/30 text-emerald-400 rounded-lg hover:bg-emerald-900/50 border border-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {showDebug ? 'Ocultar Diagnóstico' : 'Ver Dados Brutos (Debug)'}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              aria-label="Fechar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Conteúdo Central com Scroll */}
        <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950">
          
          {/* Diagnóstico (Debug) se visível */}
          {showDebug && (
            <div className="mb-6 bg-slate-900 p-4 text-xs font-mono text-emerald-400 rounded-xl border border-slate-800">
              <h2 className="text-pink-500 font-bold mb-2 border-b border-pink-900/50 pb-1 flex justify-between">
                <span>PAINEL DE DIAGNÓSTICO</span>
                <span className="text-[10px] text-slate-500">V3 - Estabilizado</span>
              </h2>
              <h3 className="text-slate-400 mb-1 uppercase">Dados Brutos:</h3>
              <pre className="whitespace-pre-wrap mb-4 bg-black/40 p-2 rounded border border-slate-800">{rawResponse || 'Nenhum dado bruto capturado.'}</pre>
              <h3 className="text-slate-400 mb-1 uppercase">Logs:</h3>
              <ul className="space-y-1 bg-black/20 p-2 rounded border border-slate-800">
                {logs?.length ? logs.map((log, i) => (
                  <li key={i} className={log.includes('Inversão') || log.includes('ERRO') ? 'text-amber-400 font-bold' : ''}>
                    {log}
                  </li>
                )) : <li className="text-slate-600 italic">Nenhum log disponível.</li>}
              </ul>
            </div>
          )}

          {/* Tabela Responsiva */}
          <div className="w-full overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 bg-slate-900/30">
                  <th className="py-4 px-4 font-semibold">Data</th>
                  <th className="py-4 px-4 font-semibold">Placa</th>
                  <th className="py-4 px-4 font-semibold">Cliente</th>
                  <th className="py-4 px-4 font-semibold">Serviço</th>
                  <th className="py-4 px-4 font-semibold">Valor Bruto</th>
                  <th className="py-4 px-4 font-semibold">Valor Líquido</th>
                  <th className="py-4 px-4 font-semibold">Status Regra</th>
                  <th className="py-4 px-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item, index) => (
                  <tr key={index} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <input 
                        type="date" 
                        value={item.data}
                        onChange={(e) => handleUpdate(index, 'data', e.target.value)}
                        className="bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm text-slate-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="text" 
                        value={item.placa}
                        onChange={(e) => handleUpdate(index, 'placa', e.target.value.toUpperCase())}
                        className="bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm font-mono text-slate-300 w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="text" 
                        value={item.cliente}
                        onChange={(e) => handleUpdate(index, 'cliente', e.target.value.toUpperCase())}
                        className="bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm text-slate-300 w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        value={item.categoria}
                        onChange={(e) => handleUpdate(index, 'categoria', e.target.value)}
                        className="bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm text-slate-300 w-full"
                      >
                        <option value="Transferência">Transferência</option>
                        <option value="Vistoria de Entrada">Vistoria de Entrada</option>
                        <option value="Vistoria de Saída">Vistoria de Saída</option>
                        <option value="Vistoria Cautelar">Vistoria Cautelar</option>
                        <option value="Vistoria de Retorno">Vistoria de Retorno</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        value={item.valorBruto}
                        onChange={(e) => handleUpdate(index, 'valorBruto', parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm font-semibold text-white w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        value={item.valorLiquido}
                        disabled={item.isAutoApplied}
                        onChange={(e) => handleUpdate(index, 'valorLiquido', parseFloat(e.target.value) || 0)}
                        className={cn(
                          "bg-transparent border-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-sm font-bold w-24",
                          item.isAutoApplied ? "text-emerald-400" : "text-slate-400"
                        )}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                          item.isAutoApplied ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                        )}>
                          {item.automationLabel || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => handleRemove(index)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remover linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-500">Nenhum dado para importar.</p>
            </div>
          )}
        </main>

        {/* Footer - Fixo */}
        <footer className="shrink-0 p-6 border-t border-slate-800 bg-slate-950 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-left">
            Total de itens: <span className="text-white font-bold">{items.length}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm(items)}
              disabled={items.length === 0}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-5 h-5" />
              Confirmar Importação
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
