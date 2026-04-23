"use client";

import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { storageService } from '@/services/storage';
import { Transaction, IncomeTransaction } from '@/types/transaction';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

import { isHoliday, adjustToNextBusinessDay } from '@/utils/holidays';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (date?: Date) => void;
  existingTransactions: Transaction[];
  defaultDate?: Date;
}

const CONVERSAO_2025: Record<number, number> = {
  198.13: 147.41,
  169.83: 127.08,
  141.52: 105.86,
  108.50: 75.96,
  94.35: 63.49
};

export function NovaVistoriaModal({ isOpen, onClose, onSuccess, existingTransactions, defaultDate }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'Transferência',
    placa: '',
    cliente: '',
    data: storageService.getLastUsedDate() || format(defaultDate || new Date(), 'yyyy-MM-dd'),
    valorBruto: 198.13,
    valorLiquido: 147.41,
    pagamento: 'Pix',
    nf: '',
    observacao: ''
  });

  // Removido useEffect que forçava a data do filtro, 
  // para respeitar a regra de "sempre salvar a última data" selecionada pelo usuário.


  // VRTE Auto-Calculus Engine
  useEffect(() => {
    if (formData.categoria === 'Vistoria de Retorno') {
      setFormData(prev => ({ ...prev, valorBruto: 0, valorLiquido: 0 }));
      return;
    }
    
    // Se for Cautelar, não segue a tabela automática (usuário define)
    if (formData.categoria === 'Vistoria Cautelar') {
       return;
    }

    // Acha o valor mais próximo ou exato na tabela para Transferência/Entrada
    const match = Object.keys(CONVERSAO_2025).find(k => Math.abs(parseFloat(k) - formData.valorBruto) < 0.001);
    if (match) {
      setFormData(prev => ({ ...prev, valorLiquido: CONVERSAO_2025[parseFloat(match)] }));
    }
  }, [formData.valorBruto, formData.categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Always uppercase for input text 
    let v = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.type !== 'date' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valor') ? parseFloat(v) || 0 : v
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações de Segurança
    if (!formData.placa || formData.placa.length < 7) {
      return alert('Placa inválida. Certifique-se de digitar os 7 caracteres.');
    }
    
    if (!formData.cliente || formData.cliente.trim().length < 3) {
      return alert('O nome do cliente deve ter pelo menos 3 caracteres.');
    }

    const selectedDate = new Date(formData.data + 'T12:00:00');
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      return alert('Não é possível registrar vistorias com data futura.');
    }

    // Verificação de Duplicidade mais robusta
    const dataCompMonth = formData.data.substring(0, 7);
    const hasDuplicate = existingTransactions.some((t: any) => {
      if (t.type !== 'income' || !t.placa || !formData.placa) return false;
      
      const tMonth = t.date.substring(0, 7);
      const isSamePlaca = t.placa.trim().toUpperCase() === formData.placa.trim().toUpperCase();
      const isSameCategory = t.category === formData.categoria;
      const isSameMonth = tMonth === dataCompMonth;

      return isSamePlaca && isSameCategory && isSameMonth;
    });

    if (hasDuplicate) {
      const proceed = window.confirm(`⚠️ ALERTA DE DUPLICIDADE\n\nJá existe um lançamento de "${formData.categoria}" para a placa "${formData.placa}" neste mesmo mês!\n\nDeseja salvar este lançamento mesmo assim?`);
      if (!proceed) return;
    }

    setLoading(true);
    const result = await storageService.saveTransaction({
      id: `inc_${Date.now()}`, // Consistent with storageService check
      type: 'income',
      category: formData.categoria,
      placa: formData.placa,
      cliente: formData.cliente,
      nf: formData.nf,
      pagamento: formData.pagamento,
      amountBruto: formData.valorBruto,
      amountLiquido: formData.valorLiquido,
      amount: formData.valorBruto,
      date: formData.data,
      observacao: formData.observacao
    });

    setLoading(false);

    if (result) {
      storageService.setLastUsedDate(formData.data);
      onSuccess(new Date(formData.data + 'T12:00:00'));
      onClose();
    } else {
      alert('Erro ao salvar o lançamento no banco de dados. Verifique sua conexão.');
    }
  };

  const isManualValue = formData.categoria === 'Vistoria Cautelar';

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Novo Laudo de Vistoria" headerColorContext="success">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Vistoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Transferência">Transferência</option>
              <option value="Vistoria Cautelar">Vistoria Cautelar</option>
              <option value="Vistoria de Entrada">Vistoria de Entrada</option>
              <option value="Vistoria de Retorno">Vistoria de Retorno</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Placa</label>
            <input type="text" name="placa" maxLength={7} required value={formData.placa} onChange={handleChange} placeholder="ABC1D23" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente / Solicitante</label>
          <input type="text" name="cliente" required value={formData.cliente} onChange={handleChange} placeholder="NOME DO CLIENTE" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* Row 3 Dinheiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Valor Bruto (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              name="valorBruto" 
              required 
              value={formData.valorBruto} 
              onChange={handleChange} 
              disabled={formData.categoria === 'Vistoria de Retorno'}
              className={cn(
                "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500",
                formData.categoria === 'Vistoria de Retorno' && "bg-slate-100 cursor-not-allowed opacity-60"
              )} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-1">Dedução Líquida (Automática)</label>
            <input 
              type="number" 
              step="0.01" 
              name="valorLiquido" 
              required 
              value={formData.valorLiquido} 
              onChange={handleChange} 
              disabled={formData.categoria === 'Vistoria de Retorno' || (!isManualValue && !!CONVERSAO_2025[formData.valorBruto])}
              className={cn(
                "w-full bg-emerald-100/50 border border-emerald-200 rounded-lg px-4 py-2.5 font-bold text-emerald-800 outline-none",
                (formData.categoria === 'Vistoria de Retorno' || (!isManualValue && !!CONVERSAO_2025[formData.valorBruto])) && "bg-slate-100 cursor-not-allowed opacity-60"
              )} 
            />
          </div>
        </div>

        {/* Row 4 Extras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select name="pagamento" value={formData.pagamento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Pix">Pix</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input type="date" name="data" required max={format(new Date(), 'yyyy-MM-dd')} value={formData.data} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">NF-e (Opcional)</label>
            <input type="text" name="nf" value={formData.nf} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observações Privadas</label>
          <textarea name="observacao" rows={2} value={formData.observacao} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center">
          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Registrar Receita Local'}
        </button>
      </form>
    </BaseModal>
  );
}
