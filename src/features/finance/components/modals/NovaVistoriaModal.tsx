"use client";

import { useState, useEffect } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { transactionService } from '@/features/finance/services/transaction.service';
import { Transaction } from '@/core/types/finance';
import { format } from 'date-fns';
import { PlacaInput } from '@/core/components/ui/PlacaInput';
import { MoneyInput } from '@/core/components/ui/MoneyInput';
import { calculateLiquido, CONVERSAO_VRTE_2025, VistoriaCategory, VISTORIA_CATEGORIES } from '@/core/utils/finance';
import { cn } from '@/core/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (date?: Date) => void;
  existingTransactions: Transaction[];
  defaultDate?: Date;
}

export function NovaVistoriaModal({ isOpen, onClose, onSuccess, existingTransactions, defaultDate }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'Transferência' as VistoriaCategory,
    placa: '',
    cliente: '',
    data: format(defaultDate || new Date(), 'yyyy-MM-dd'),
    valorBruto: 198.13,
    valorLiquido: 147.41,
    pagamento: 'Pix',
    nf: '',
    observacao: ''
  });

  useEffect(() => {
    if (formData.categoria === 'Vistoria de Retorno') {
      setFormData(prev => ({ ...prev, valorBruto: 0, valorLiquido: 0 }));
      return;
    }
    if (formData.categoria === 'Vistoria Cautelar') return;

    const liquido = calculateLiquido(formData.valorBruto);
    setFormData(prev => ({ ...prev, valorLiquido: liquido }));
  }, [formData.valorBruto, formData.categoria]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valor') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.placa.length < 7) return alert('Placa inválida.');
    if (formData.cliente.trim().length < 2) return alert('Nome do cliente muito curto.');

    const selectedDate = new Date(formData.data + 'T12:00:00');
    const dataCompMonth = formData.data.substring(0, 7);
    const hasDuplicate = existingTransactions.some((t: any) => 
      t.type === 'income' && 
      t.placa === formData.placa && 
      t.category === formData.categoria && 
      t.date.substring(0, 7) === dataCompMonth
    );

    if (hasDuplicate && !window.confirm('Já existe um lançamento similar este mês. Continuar?')) return;

    setLoading(true);
    const success = await transactionService.save({
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

    if (success) {
      onSuccess(selectedDate);
      onClose();
    } else {
      alert('Erro ao salvar o laudo.');
    }
  };

  const isAutoLiquido = formData.categoria !== 'Vistoria Cautelar' && !!CONVERSAO_VRTE_2025[formData.valorBruto];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Novo Laudo de Vistoria" headerColorContext="success">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Vistoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              {VISTORIA_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <PlacaInput label="Placa" name="placa" required value={formData.placa} onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente / Solicitante</label>
          <input type="text" name="cliente" required value={formData.cliente} onChange={e => setFormData(p => ({...p, cliente: e.target.value.toUpperCase()}))} placeholder="NOME DO CLIENTE" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <MoneyInput label="Valor Bruto" name="valorBruto" required value={formData.valorBruto} onChange={handleChange} disabled={formData.categoria === 'Vistoria de Retorno'} />
          <MoneyInput label="Dedução Líquida" name="valorLiquido" required value={formData.valorLiquido} onChange={handleChange} disabled={formData.categoria === 'Vistoria de Retorno' || isAutoLiquido} className={cn(isAutoLiquido && "bg-emerald-100/50 border-emerald-200 text-emerald-800")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pagamento</label>
            <select name="pagamento" value={formData.pagamento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Pix">Pix</option>
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input type="date" name="data" required max={format(new Date(), 'yyyy-MM-dd')} value={formData.data} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">NF-e (Opcional)</label>
            <input type="text" name="nf" value={formData.nf} onChange={e => setFormData(p => ({...p, nf: e.target.value.toUpperCase()}))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center">
          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Registrar Laudo'}
        </button>
      </form>
    </BaseModal>
  );
}
