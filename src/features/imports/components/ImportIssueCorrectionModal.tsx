"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ImportedTransaction, ImportAuditLog, ValidationStatus } from '../types/import.types';
import { getImportIssueSuggestions, validateImportedTransaction } from '../utils/import-validation.utils';
import { VISTORIA_CATEGORIES, VistoriaCategory } from '@/core/utils/finance';
import { 
  X, Save, Sparkles, Check, AlertTriangle, Play, ThumbsUp, 
  Trash2, XCircle, FileSpreadsheet, Eye, ChevronDown, ChevronUp, History, Info, CheckCircle2, User, Clock
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { formatBRL } from '@/core/utils/formatters';
import { toast } from 'sonner';

interface ImportIssueCorrectionModalProps {
  item: ImportedTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<ImportedTransaction>, reason?: string, previousStatus?: string) => void;
  onIgnore: (id: string) => void;
  onApproveManually: (id: string, reason: string) => void;
}

export function ImportIssueCorrectionModal({ 
  item, isOpen, onClose, onSave, onIgnore, onApproveManually 
}: ImportIssueCorrectionModalProps) {
  // Form States
  const [date, setDate] = useState('');
  const [placa, setPlaca] = useState('');
  const [cliente, setCliente] = useState('');
  const [service, setService] = useState('');
  const [category, setCategory] = useState('');
  const [grossValue, setGrossValue] = useState(0);
  const [netValue, setNetValue] = useState(0);
  const [description, setDescription] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [motivoCorrecao, setMotivoCorrecao] = useState('');
  
  // UI States
  const [showRawData, setShowRawData] = useState(false);
  const [showApproveReasonInput, setShowApproveReasonInput] = useState(false);

  // Load state from item
  useEffect(() => {
    if (item && isOpen) {
      setDate(item.date || '');
      setPlaca(item.placa || '');
      setCliente(item.cliente || '');
      setService(item.service || '');
      setCategory(item.category || item.service || '');
      setGrossValue(item.grossValue || 0);
      setNetValue(item.netValue || 0);
      setDescription(item.description || '');
      setFormaPagamento(item.formaPagamento || 'Pix');
      setMotivoCorrecao(item.motivoCorrecao || '');
      setShowApproveReasonInput(false);
    }
  }, [item, isOpen]);

  // Clean values check
  const suggestions = useMemo(() => {
    if (!item) return [];
    return getImportIssueSuggestions(item);
  }, [item]);

  if (!isOpen || !item) return null;

  // Real-time validation based on local states
  const localValidation = useMemo(() => {
    const tempItem: Partial<ImportedTransaction> = {
      ...item,
      date,
      placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      cliente,
      service,
      category: service,
      grossValue: Number(grossValue) || 0,
      netValue: Number(netValue) || 0,
      status: 'pending' // Force calculation without preservation
    };
    return validateImportedTransaction(tempItem);
  }, [item, date, placa, cliente, service, grossValue, netValue]);

  const hasErrors = localValidation.errors.length > 0;

  const getErrorTranslation = (error: string) => {
    const map: Record<string, string> = {
      'DATA_INVALIDA': 'Data inválida ou ausente (deve ser YYYY-MM-DD)',
      'PLACA_AUSENTE': 'Placa não informada',
      'PLACA_INVALIDA': 'Placa com formato incorreto (deve ter 7 dígitos)',
      'CLIENTE_AUSENTE': 'Cliente não informado',
      'SERVICO_AUSENTE': 'Serviço ausente',
      'VALOR_BRUTO_AUSENTE': 'Valor bruto ausente',
      'VALOR_BRUTO_INVALIDO': 'Valor bruto inválido (deve ser maior que zero)',
      'VALOR_LIQUIDO_AUSENTE': 'Valor líquido ausente',
      'VALOR_LIQUIDO_INVALIDO': 'Valor líquido inválido (não pode ser negativo)',
      'DUPLICADO': 'Lançamento duplicado no período',
      'INCONSISTENTE': 'Dados inconsistentes'
    };
    return map[error] || error;
  };

  const handleApplySuggestion = (field: string, value: string | number) => {
    if (field === 'cliente') setCliente(String(value));
    if (field === 'placa') setPlaca(String(value));
    if (field === 'service') {
      setService(String(value));
      setCategory(String(value));
    }
    toast.success(`Sugestão aplicada para o campo ${field}!`);
  };

  const handleApplyAllSuggestions = () => {
    suggestions.forEach(sug => {
      handleApplySuggestion(sug.field, sug.suggested);
    });
  };

  const handleSave = () => {
    if (hasErrors) {
      toast.error('Não é possível salvar com erros críticos pendentes. Corrija-os ou use "Aprovar Mesmo Assim".');
      return;
    }

    onSave(item.id, {
      date,
      placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      cliente,
      service,
      category: service,
      grossValue: Number(grossValue) || 0,
      netValue: Number(netValue) || 0,
      description,
      formaPagamento
    }, motivoCorrecao || 'Correção manual de inconsistência', item.status);
    
    toast.success('Correção salva com sucesso!');
    onClose();
  };

  const handleForceApprove = () => {
    if (!motivoCorrecao.trim()) {
      setShowApproveReasonInput(true);
      toast.warning('Para aprovar com ressalvas, preencha o Motivo da Correção.');
      return;
    }

    onApproveManually(item.id, motivoCorrecao);
    toast.success('Lançamento aprovado com ressalva.');
    onClose();
  };

  const handleIgnoreAction = () => {
    if (window.confirm('Tem certeza que deseja ignorar este lançamento? Ele não será importado.')) {
      onIgnore(item.id);
      toast.info('Lançamento marcado para ser ignorado.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Fixo */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <IconBadge icon={Sparkles} variant="purple" size="sm" gradient />
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Corrigir Inconsistência</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Revise os dados importados da planilha antes de aprovar este lançamento.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/30">
          
          {/* Metadata da Linha */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-[11px]">
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider">Arquivo</span>
              <span className="font-black text-slate-700 truncate block" title={item.sourceFileName}>{item.sourceFileName || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider">Aba / Linha original</span>
              <span className="font-black text-slate-700 block">{item.sourceSheetName || 'Planilha'} • Linha {item.sourceRowNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider">Importado em</span>
              <span className="font-black text-slate-700 block">01/06/2026 às 07:44</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider">Status Atual</span>
              <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest mt-1
                ${item.status === 'invalid' || item.status === 'erro' ? 'bg-rose-50 text-rose-600' : ''}
                ${item.status === 'duplicate' || item.status === 'duplicado' ? 'bg-orange-50 text-orange-600' : ''}
                ${item.status === 'corrected' || item.status === 'corrigido' ? 'bg-blue-50 text-blue-600' : ''}
                ${item.status === 'manual_approved' ? 'bg-purple-50 text-purple-600' : ''}
              `}>
                {item.status === 'invalid' || item.status === 'erro' ? 'Erro' : 
                 item.status === 'duplicate' || item.status === 'duplicado' ? 'Duplicado' : 
                 item.status === 'corrected' || item.status === 'corrigido' ? 'Corrigido' : 
                 item.status === 'manual_approved' ? 'Aprovado' : 'Pendente'}
              </span>
            </div>
          </div>

          {/* Problemas Encontrados */}
          <div className="bg-rose-50/50 rounded-3xl border border-rose-100/70 p-5 space-y-3">
            <h3 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Problemas Encontrados ({localValidation.errors.length})
            </h3>
            {localValidation.errors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {localValidation.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-rose-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-[12px] font-bold text-slate-700 leading-tight">{getErrorTranslation(err)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-[12px] font-bold">Excelente! Todos os erros de validação foram solucionados. O lançamento está pronto para ser marcado como Corrigido.</span>
              </div>
            )}
          </div>

          {/* Comparativo Lado a Lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Coluna Dados Originais */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Valor original da planilha
              </h3>
              <div className="bg-slate-100/50 rounded-[2rem] border border-slate-200/50 p-6 space-y-4 text-[12px] h-[480px] overflow-y-auto custom-scrollbar">
                
                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Data</span>
                  <span className="font-mono text-slate-700 block">{item.rawDate || '---'}</span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Placa</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-mono font-bold text-[10px] uppercase inline-block">
                    {item.rawData?.placa || item.rawData?.Veículo || item.rawData?.Veiculo || 'SEM PLACA'}
                  </span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Cliente</span>
                  <span className="font-bold text-slate-700 block uppercase">{item.rawClient || '---'}</span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Serviço</span>
                  <span className="font-mono text-slate-700 block">{String(item.rawData?.servico || item.rawData?.Serviço || item.rawData?.categoria || '---')}</span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Forma de pagamento</span>
                  <span className="font-mono text-slate-700 block">{String(item.rawData?.forma_pagamento || item.rawData?.pagamento || 'N/A')}</span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Valor bruto</span>
                  <span className="font-bold text-slate-700 block">{item.rawValorBruto || '---'}</span>
                </div>

                <div className="pb-3 border-b border-slate-200/60">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Valor líquido</span>
                  <span className="font-bold text-slate-700 block">{item.rawValorLiquido || '---'}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px] mb-1">Observações</span>
                  <span className="text-slate-500 block italic">{String(item.rawData?.observacao || item.rawData?.observações || item.rawData?.obs || '---')}</span>
                </div>

              </div>
            </div>

            {/* Coluna Campos de Edição */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider pl-2 flex items-center justify-between">
                <span>Corrigir para</span>
                {suggestions.length > 0 && (
                  <button 
                    onClick={handleApplyAllSuggestions}
                    className="text-[10px] font-black text-purple-600 hover:text-purple-800 uppercase flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Aplicar Sugestões
                  </button>
                )}
              </h3>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4 h-[480px] overflow-y-auto custom-scrollbar">
                
                {/* Data Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Data</label>
                    {localValidation.errors.includes('DATA_INVALIDA') && (
                      <span className="text-[9px] font-bold text-rose-500">Obrigatório / Inválido</span>
                    )}
                  </div>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none
                      ${localValidation.errors.includes('DATA_INVALIDA') 
                        ? 'border-rose-100 focus:border-rose-500 bg-rose-50/10' 
                        : 'border-transparent focus:bg-white focus:border-blue-500'
                      }
                    `}
                  />
                </div>

                {/* Placa Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Placa</label>
                    {localValidation.errors.includes('PLACA_INVALIDA') || localValidation.errors.includes('PLACA_AUSENTE') ? (
                      <span className="text-[9px] font-bold text-rose-500">Mínimo 7 caracteres</span>
                    ) : (
                      placa !== item.placa && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Alterado</span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={8}
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none uppercase
                        ${localValidation.errors.includes('PLACA_INVALIDA') || localValidation.errors.includes('PLACA_AUSENTE')
                          ? 'border-rose-100 focus:border-rose-500 bg-rose-50/10' 
                          : 'border-transparent focus:bg-white focus:border-blue-500'
                        }
                      `}
                    />
                    {suggestions.find(s => s.field === 'placa') && (
                      <button 
                        onClick={() => handleApplySuggestion('placa', suggestions.find(s => s.field === 'placa')!.suggested)}
                        className="absolute right-3 top-2.5 text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3 h-3" /> Aplicar
                      </button>
                    )}
                  </div>
                </div>

                {/* Cliente Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Cliente</label>
                    {localValidation.errors.includes('CLIENTE_AUSENTE') ? (
                      <span className="text-[9px] font-bold text-rose-500">Obrigatório</span>
                    ) : (
                      cliente !== item.cliente && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">Alterado</span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={cliente}
                      onChange={(e) => setCliente(e.target.value)}
                      placeholder="Nome do cliente"
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none
                        ${localValidation.errors.includes('CLIENTE_AUSENTE')
                          ? 'border-rose-100 focus:border-rose-500 bg-rose-50/10' 
                          : 'border-transparent focus:bg-white focus:border-blue-500'
                        }
                      `}
                    />
                    {suggestions.find(s => s.field === 'cliente') && (
                      <button 
                        onClick={() => handleApplySuggestion('cliente', suggestions.find(s => s.field === 'cliente')!.suggested)}
                        className="absolute right-3 top-2.5 text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3 h-3" /> Sugestão: PARTICULAR SÃO MATEUS
                      </button>
                    )}
                  </div>
                </div>

                {/* Serviço / Categoria */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Serviço / Categoria</label>
                    <select 
                      value={service}
                      onChange={(e) => {
                        setService(e.target.value);
                        setCategory(e.target.value);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none"
                    >
                      <option value="">Selecione o Serviço</option>
                      {VISTORIA_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Forma de Pagamento</label>
                    <select 
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Crédito">Crédito</option>
                      <option value="Débito">Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </div>

                {/* Valores Bruto e Líquido */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Valor Bruto</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={grossValue || ''}
                      onChange={(e) => setGrossValue(parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none
                        ${localValidation.errors.includes('VALOR_BRUTO_INVALIDO') 
                          ? 'border-rose-100 focus:border-rose-500 bg-rose-50/10' 
                          : 'border-slate-200 focus:border-blue-500'
                        }
                      `}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Valor Líquido</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={netValue || ''}
                      onChange={(e) => setNetValue(parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none
                        ${localValidation.errors.includes('VALOR_LIQUIDO_INVALIDO') 
                          ? 'border-rose-100 focus:border-rose-500 bg-rose-50/10' 
                          : 'border-slate-200 focus:border-blue-500'
                        }
                      `}
                    />
                  </div>
                </div>
                
                {/* Observações */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Observação</label>
                  <input 
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: IMPORTADO VIA EXCEL"
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none"
                  />
                </div>

                {/* Motivo da Correção (Histórico de Auditoria) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 flex items-center justify-between">
                    <span>Motivo da Correção</span>
                    <span className="text-[9px] text-slate-400 font-bold italic">Opcional para salvar, obrigatório para aprovação forçada</span>
                  </label>
                  <textarea 
                    value={motivoCorrecao}
                    onChange={(e) => setMotivoCorrecao(e.target.value)}
                    placeholder="Descreva o motivo desta correção para o log de auditoria..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-[12px] font-bold text-slate-900 transition-all outline-none resize-none"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Seção Expansível: Dados Brutos da Planilha */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowRawData(!showRawData)}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 text-[12px] font-black uppercase text-slate-700 tracking-wider outline-none"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Ver linha original da planilha (Dados Crus)
              </span>
              {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showRawData && (
              <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Colunas Interpretadas pelo Sistema</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                    <div><strong className="text-slate-500">Valor extraído de Cliente:</strong> {item.rawClient || '-'}</div>
                    <div><strong className="text-slate-500">Valor extraído de Data:</strong> {item.rawDate || '-'}</div>
                    <div><strong className="text-slate-500">Valor extraído de Bruto:</strong> {item.rawValorBruto || '-'}</div>
                    <div><strong className="text-slate-500">Valor extraído de Líquido:</strong> {item.rawValorLiquido || '-'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Objeto Cru Lido do Arquivo</h4>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-40 custom-scrollbar">
                    {JSON.stringify(item.rawData || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Histórico e Auditoria */}
          {item.auditLog && item.auditLog.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                <History className="w-4 h-4 text-purple-600" /> Histórico de Auditoria da Linha ({item.auditLog.length})
              </h3>
              
              <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                {item.auditLog.map((log: ImportAuditLog) => (
                  <div key={log.id} className="text-[12px] bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4 items-start">
                    <div className="p-2 bg-purple-50 rounded-full text-purple-700 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-800">{log.user}</strong>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Alterou o campo <strong className="text-blue-600 uppercase tracking-wider text-[10px]">{log.field}</strong> de{' '}
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{log.previousValue || 'vazio'}</span> para{' '}
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">{log.newValue}</span>.
                      </p>
                      {log.reason && (
                        <p className="text-[11px] text-amber-700 font-medium italic mt-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                          <strong>Motivo:</strong> {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Rodapé Fixo */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleIgnoreAction}
              className="px-6 py-3 border-2 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Ignorar Lançamento
            </button>
            <button 
              onClick={() => setShowApproveReasonInput(!showApproveReasonInput)}
              className="px-6 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Aprovar Mesmo Assim
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-[11px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={hasErrors}
              className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer
                ${hasErrors 
                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                }
              `}
            >
              Salvar Correção
            </button>
          </div>
        </div>

        {/* Backdrop / Form de Motivo para Aprovação com Ressalva */}
        {showApproveReasonInput && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-purple-600" /> Aprovar com Ressalva
                </h4>
                <button onClick={() => setShowApproveReasonInput(false)} className="text-slate-400 hover:text-rose-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Este lançamento contém inconsistências críticas. Você pode aprovar a importação caso justifique o motivo abaixo. O motivo será gravado em auditoria.
              </p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Motivo / Justificativa</label>
                <textarea 
                  value={motivoCorrecao}
                  onChange={(e) => setMotivoCorrecao(e.target.value)}
                  placeholder="Ex: Valor bruto de retorno zerado está correto pois trata-se de vistoria de garantia."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold text-slate-900 outline-none focus:bg-white focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowApproveReasonInput(false)}
                  className="px-4 py-2 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleForceApprove}
                  disabled={!motivoCorrecao.trim()}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                >
                  Confirmar Aprovação
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
