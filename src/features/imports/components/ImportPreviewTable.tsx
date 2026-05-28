import { ImportedTransaction } from '../types/import.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Edit2, Trash2, 
  ThumbsUp, XCircle, RefreshCw, MoreVertical 
} from 'lucide-react';
import { useState } from 'react';

interface ImportPreviewTableProps {
  items: ImportedTransaction[];
  onEdit: (item: ImportedTransaction) => void;
  onDelete: (id: string) => void;
  onApproveManually: (id: string) => void;
  onIgnore: (id: string) => void;
  onRevalidate: (id: string) => void;
}

export function ImportPreviewTable({
  items, onEdit, onDelete, onApproveManually, onIgnore, onRevalidate
}: ImportPreviewTableProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getStatusConfig = (status: ImportedTransaction['status']) => {
    switch(status) {
      case 'valid': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Válido' };
      case 'invalid': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Erro' };
      case 'duplicate': return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Duplicado' };
      case 'corrected': return { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Corrigido' };
      case 'manual_approved': return { icon: ThumbsUp, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Aprovado' };
      case 'ignored': return { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Ignorado' };
      case 'deleted': return { icon: Trash2, color: 'text-slate-800', bg: 'bg-slate-200', label: 'Excluído' };
      default: return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Pendente' };
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold text-[12px] uppercase tracking-widest">
        Nenhum lançamento encontrado para estes filtros.
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto w-full custom-scrollbar relative pb-32">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <tr>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Data</th>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Placa</th>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente / Serviço</th>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Valores</th>
            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map(item => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;
            const isInvalid = item.status === 'invalid' || item.status === 'duplicate';

            return (
              <tr key={item.id} className={cn(
                "group transition-all hover:bg-slate-50/50",
                isInvalid && "bg-rose-50/10",
                (item.status === 'ignored' || item.status === 'deleted') && "opacity-50 grayscale hover:grayscale-0"
              )}>
                <td className="px-6 py-4 align-top w-[140px]">
                  <div className="group/error relative inline-flex items-center gap-2 cursor-help">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", statusConfig.bg, statusConfig.color)}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">{statusConfig.label}</span>
                    </div>
                    
                    {/* Tooltip with Validation Messages */}
                    {item.validationMessages.length > 0 && (
                      <div className="absolute left-0 top-full mt-2 hidden group-hover/error:block z-50 w-64 p-4 bg-slate-900 text-[10px] text-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <p className="font-black mb-2 opacity-60 uppercase tracking-widest">Observações:</p>
                        {item.validationMessages.map((msg, i) => (
                          <div key={i} className="flex gap-2 mb-1">
                            <span className={isInvalid ? "text-rose-500" : "text-emerald-500"}>•</span>
                            <span className="opacity-90">{msg}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap align-top">
                  {item.date ? item.date.split('-').reverse().join('/') : '---'}
                </td>
                
                <td className="px-6 py-4 align-top">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap",
                    !item.placa ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {item.placa || 'SEM PLACA'}
                  </span>
                </td>
                
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col min-w-[150px]">
                    <span className="text-[11px] font-black text-slate-900 uppercase truncate" title={item.cliente}>
                      {item.cliente || <span className="text-rose-500">CLIENTE NÃO INFORMADO</span>}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate" title={item.service}>
                      {item.service || <span className="text-rose-500">SERVIÇO NÃO INFORMADO</span>}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-right align-top whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[11px] font-black",
                      (item.grossValue <= 0 || !item.grossValue) ? "text-rose-600" : "text-slate-900"
                    )}>
                      {formatBRL(item.grossValue || 0)}
                    </span>
                    {item.netValue !== undefined && (
                      <span className="text-[9px] font-bold text-emerald-500">
                        Liq: {formatBRL(item.netValue)}
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center align-top relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all outline-none"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === item.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute right-8 top-10 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => { onEdit(item); setOpenDropdown(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                        >
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                        
                        {(item.status === 'invalid' || item.status === 'duplicate') && (
                          <button 
                            onClick={() => { onApproveManually(item.id); setOpenDropdown(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-purple-600 hover:bg-purple-50 transition-colors text-left"
                          >
                            <ThumbsUp className="w-4 h-4" /> Aprovar Manualmente
                          </button>
                        )}
                        
                        {item.status !== 'ignored' && item.status !== 'deleted' && (
                          <button 
                            onClick={() => { onIgnore(item.id); setOpenDropdown(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors text-left"
                          >
                            <XCircle className="w-4 h-4" /> Ignorar Linha
                          </button>
                        )}
                        
                        <button 
                          onClick={() => { onRevalidate(item.id); setOpenDropdown(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
                        >
                          <RefreshCw className="w-4 h-4" /> Revalidar
                        </button>
                        
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        
                        <button 
                          onClick={() => { onDelete(item.id); setOpenDropdown(null); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir Definitivo
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
