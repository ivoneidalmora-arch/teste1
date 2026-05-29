import { ImportedTransaction } from '../types/import.types';
import { cn, formatBRL } from '@/core/utils/formatters';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Edit2, Trash2, 
  ThumbsUp, XCircle, RefreshCw, MoreVertical, ChevronDown, ChevronUp, FileCode2
} from 'lucide-react';
import React, { useState } from 'react';

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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusConfig = (status: ImportedTransaction['status']) => {
    switch(status) {
      case 'valido': 
      case 'valid' as any: 
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Válido' };
      case 'erro': 
      case 'invalid' as any: 
        return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Erro' };
      case 'duplicado': 
      case 'duplicate' as any: 
        return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Duplicado' };
      case 'corrigido': 
      case 'corrected' as any: 
        return { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Corrigido' };
      case 'manual_approved': 
        return { icon: ThumbsUp, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Aprovado' };
      case 'ignorado': 
      case 'ignored' as any: 
        return { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Ignorado' };
      case 'deleted': 
        return { icon: Trash2, color: 'text-slate-800', bg: 'bg-slate-200', label: 'Excluído' };
      default: 
        return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Pendente' };
    }
  };

  const getErrorTranslation = (error: string) => {
    const map: Record<string, string> = {
      'DATA_INVALIDA': 'Data inválida ou ausente',
      'PLACA_AUSENTE': 'Placa não encontrada',
      'PLACA_INVALIDA': 'Placa com formato incorreto',
      'CLIENTE_AUSENTE': 'Cliente não encontrado',
      'SERVICO_AUSENTE': 'Serviço ausente',
      'VALOR_BRUTO_AUSENTE': 'Valor bruto ausente',
      'VALOR_BRUTO_INVALIDO': 'Valor bruto inválido (ex: letras, ou negativo)',
      'VALOR_LIQUIDO_AUSENTE': 'Valor líquido ausente',
      'VALOR_LIQUIDO_INVALIDO': 'Valor líquido inválido',
      'DUPLICADO': 'Lançamento duplicado no período',
      'INCONSISTENTE': 'Inconsistência geral nos dados'
    };
    return map[error] || error;
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
            <th className="px-4 py-4 w-10"></th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Data</th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Placa</th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente / Serviço</th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Valores</th>
            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map(item => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;
            const isInvalid = item.status === 'erro' || item.status === 'invalid' as any || item.status === 'duplicado' || item.status === 'duplicate' as any;
            const isExpanded = expandedRows[item.id];
            
            const hasRawDifferences = 
              (item.rawClient && item.rawClient !== item.cliente) ||
              (item.rawDate && item.rawDate !== item.date) ||
              (item.rawValorBruto && item.rawValorBruto !== String(item.grossValue));

            return (
              <React.Fragment key={item.id}>
                <tr className={cn(
                  "group transition-all hover:bg-slate-50/50",
                  isInvalid && "bg-rose-50/20",
                  (item.status === 'ignorado' || item.status === 'deleted') && "opacity-50 grayscale hover:grayscale-0",
                  isExpanded && "bg-slate-50"
                )}>
                  <td className="px-4 py-4 align-top text-center w-10">
                    <button 
                      onClick={() => toggleExpand(item.id)}
                      className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Ver detalhes de auditoria"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>

                  <td className="px-4 py-4 align-top w-[140px]">
                    <div className="flex flex-col gap-1">
                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start", statusConfig.bg, statusConfig.color)}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="font-bold text-[10px] uppercase tracking-widest">{statusConfig.label}</span>
                      </div>
                      {isInvalid && item.errors && item.errors.length > 0 && (
                        <div className="text-[9px] font-bold text-rose-500 uppercase mt-1 leading-tight">
                          {getErrorTranslation(item.errors[0])}
                          {item.errors.length > 1 && ` (+${item.errors.length - 1})`}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap align-top pt-5">
                    {item.date ? item.date.split('-').reverse().join('/') : '---'}
                  </td>
                  
                  <td className="px-4 py-4 align-top pt-5">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap",
                      !item.placa ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                    )}>
                      {item.placa || 'SEM PLACA'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col min-w-[150px] pt-1">
                      <span className="text-[11px] font-black text-slate-900 uppercase truncate" title={item.cliente}>
                        {item.cliente || <span className="text-rose-500">CLIENTE NÃO INFORMADO</span>}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase truncate" title={item.service}>
                        {item.service || <span className="text-rose-500">SERVIÇO NÃO INFORMADO</span>}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-right align-top whitespace-nowrap">
                    <div className="flex flex-col items-end pt-1">
                      <span className={cn(
                        "text-[12px] font-black",
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
                  
                  <td className="px-4 py-4 text-center align-top relative pt-3">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all outline-none"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

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
                          
                          {isInvalid && (
                            <button 
                              onClick={() => { onApproveManually(item.id); setOpenDropdown(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-purple-600 hover:bg-purple-50 transition-colors text-left"
                            >
                              <ThumbsUp className="w-4 h-4" /> Aprovar Manualmente
                            </button>
                          )}
                          
                          {item.status !== 'ignorado' && item.status !== 'deleted' && (
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
                
                {/* Expandable Details Row */}
                {isExpanded && (
                  <tr className={cn(
                    "bg-slate-50/80 border-b border-slate-100",
                    isInvalid && "bg-rose-50/30"
                  )}>
                    <td colSpan={7} className="px-14 py-6">
                      <div className="grid grid-cols-2 gap-8">
                        {/* Errors & Validation */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Diagnóstico da Linha
                          </h4>
                          
                          {item.errors && item.errors.length > 0 ? (
                            <ul className="space-y-2">
                              {item.errors.map((err, i) => (
                                <li key={i} className="flex gap-2 text-[12px] font-medium text-rose-700">
                                  <span className="text-rose-500 font-bold">•</span>
                                  {getErrorTranslation(err)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[12px] text-emerald-600 font-medium">Nenhum erro estrutural detectado.</p>
                          )}

                          {item.warnings && item.warnings.length > 0 && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                              <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Avisos de Correção</h5>
                              <ul className="space-y-1">
                                {item.warnings.map((warn, i) => (
                                  <li key={i} className="flex gap-2 text-[11px] text-amber-800">
                                    <span className="text-amber-500">•</span> {warn}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Raw Data Audit */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileCode2 className="w-3 h-3" /> Dados Originais (Planilha)
                          </h4>
                          
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-[11px]">
                            <div className="grid grid-cols-3 bg-slate-100 p-2 border-b border-slate-200">
                              <div className="font-bold text-slate-500">Campo</div>
                              <div className="font-bold text-slate-500">Extraído da Planilha</div>
                              <div className="font-bold text-slate-500">Convertido p/ Banco</div>
                            </div>
                            
                            <div className="grid grid-cols-3 p-2 border-b border-slate-100">
                              <div className="font-medium text-slate-400">Cliente</div>
                              <div className="font-mono text-slate-800">{item.rawClient || '-'}</div>
                              <div className={cn("font-bold", item.rawClient !== item.cliente ? "text-blue-600" : "text-emerald-600")}>
                                {item.cliente}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 p-2 border-b border-slate-100">
                              <div className="font-medium text-slate-400">Data</div>
                              <div className="font-mono text-slate-800">{item.rawDate || '-'}</div>
                              <div className="font-bold text-emerald-600">{item.date ? item.date.split('-').reverse().join('/') : '-'}</div>
                            </div>
                            
                            <div className="grid grid-cols-3 p-2 border-b border-slate-100">
                              <div className="font-medium text-slate-400">Valor Bruto</div>
                              <div className="font-mono text-slate-800">{item.rawValorBruto || '-'}</div>
                              <div className={cn("font-bold", String(item.grossValue) !== item.rawValorBruto ? "text-blue-600" : "text-emerald-600")}>
                                {item.grossValue}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
