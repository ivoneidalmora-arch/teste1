"use client";

import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { storageService } from '@/services/storage';
import { format } from 'date-fns';
import { MoneyInput } from '@/components/ui/MoneyInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (date?: Date) => void;
  defaultDate?: Date;
}

export function NovaDespesaModal({ isOpen, onClose, onSuccess, defaultDate }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'Operacional',
    descricao: '',
    valor: 0,
    data: format(defaultDate || new Date(), 'yyyy-MM-dd'),
    status: 'Pago',
    observacao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.valor <= 0) return alert('O valor deve ser maior que zero.');
    if (!formData.descricao) return alert('Informe uma descrição.');

    setLoading(true);
    const result = await storageService.saveTransaction({
      id: `exp_${Date.now()}`,
      type: 'expense',
      category: formData.categoria,
      description: formData.descricao.toUpperCase(),
      amount: formData.valor,
      date: formData.data,
      vencimento: formData.data,
      status: formData.status,
      observacao: formData.observacao.toUpperCase()
    });

    setLoading(false);

    if (result) {
      onSuccess(new Date(formData.data + 'T12:00:00'));
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Novo Lançamento de Despesa" headerColorContext="danger">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500">
              <option value="Operacional">Custo Operacional</option>
              <option value="Impostos">Impostos</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Suprimentos">Suprimentos</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Folha">Folha de Pagamento</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data do Gasto</label>
            <input type="date" name="data" required value={formData.data} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição / Destinatário</label>
          <input type="text" name="descricao" required value={formData.descricao} onChange={e => setFormData(p => ({...p, descricao: e.target.value.toUpperCase()}))} placeholder="EX: COMPRA DE MATERIAIS" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MoneyInput label="Valor do Gasto" name="valor" required value={formData.valor} onChange={handleChange} prefix="R$" className="bg-rose-50/50 border-rose-100" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status de Pagamento</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500">
              <option value="Pago">Liquidado (Pago)</option>
              <option value="Pendente">Em Aberto (Pendente)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observações</label>
          <textarea name="observacao" rows={2} value={formData.observacao} onChange={e => setFormData(p => ({...p, observacao: e.target.value.toUpperCase()}))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center">
          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Registrar Despesa Local'}
        </button>
      </form>
    </BaseModal>
  );
}
