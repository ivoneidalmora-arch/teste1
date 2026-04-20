"use client";

import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { storageService } from '@/services/storage';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingTransactions: Transaction[];
}

const CONVERSAO_2025: Record<number, number> = {
  198.13: 147.41,
  169.83: 127.08,
  141.52: 105.86,
  108.50: 75.96,
  94.35: 63.49
};

export function NovaVistoriaModal({ isOpen, onClose, onSuccess, existingTransactions }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'Transferência',
    placa: '',
    cliente: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    valorBruto: 198.13,
    valorLiquido: 147.41,
    pagamento: 'Dinheiro',
    nf: '',
    observacao: ''
  });

  // VRTE Auto-Calculus Engine
  useEffect(() => {
    if (formData.categoria === 'Vistoria de Retorno') {
      setFormData(prev => ({ ...prev, valorBruto: 0, valorLiquido: 0 }));
      return;
    }

    // Acha o valor mais próximo ou exato
    const match = Object.keys(CONVERSAO_2025).find(k => Math.abs(parseFloat(k) - formData.valorBruto) < 0.001);
    if (match) {
      setFormData(prev => ({ ...prev, valorLiquido: CONVERSAO_2025[parseFloat(match)] }));
    }
  }, [formData.valorBruto, formData.categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Always uppercase for input text 
    const v = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.type !== 'date' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valor') ? parseFloat(v) || 0 : v
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placa) return alert('Placa é obrigatória');

    // Duplicity Check
    const dataCompMonth = formData.data.substring(0, 7);
    const hasDuplicate = existingTransactions.some((t: any) => {
      if (t.type !== 'income') return false;
      const tMonth = t.date.substring(0, 7);
      return t.placa === formData.placa && t.category === formData.categoria && tMonth === dataCompMonth;
    });

    if (hasDuplicate) {
      const proceed = window.confirm(`⚠️ ALERTA DE DUPLICIDADE\n\nJá existe um lançamento de "${formData.categoria}" para a placa "${formData.placa}" neste mesmo mês!\n\nDeseja salvar este lançamento mesmo assim?`);
      if (!proceed) return;
    }

    setLoading(true);
    await storageService.saveTransaction({
      id: `loc_${Date.now()}`, // fallback only
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
    onSuccess();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Novo Laudo de Vistoria" headerColorContext="success">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Vistoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Transferência">Transferência</option>
              <option value="2ª Via Recibo">2ª Via Recibo</option>
              <option value="Motor">Motor</option>
              <option value="Especial">Especial</option>
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
              disabled={formData.categoria === 'Vistoria de Retorno'}
              className={cn(
                "w-full bg-emerald-100/50 border border-emerald-200 rounded-lg px-4 py-2.5 font-bold text-emerald-800 outline-none",
                formData.categoria === 'Vistoria de Retorno' && "bg-slate-100 cursor-not-allowed opacity-60"
              )} 
            />
          </div>
        </div>

        {/* Row 4 Extras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Forma de Pag.</label>
            <select name="pagamento" value={formData.pagamento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão Débito">Cartão Débito</option>
              <option value="Cartão Crédito">Cartão Crédito</option>
              <option value="Boleto">Boleto/Pix</option>
              <option value="Cortesia">Cortesia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input type="date" name="data" required value={formData.data} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
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
