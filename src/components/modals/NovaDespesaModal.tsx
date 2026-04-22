"use client";

import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { storageService } from '@/services/storage';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { isHoliday, adjustToNextBusinessDay } from '@/utils/holidays';

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
    valor: '',
    data: storageService.getLastUsedDate() || format(defaultDate || new Date(), 'yyyy-MM-dd'),
    vencimento: storageService.getLastUsedDate() || format(defaultDate || new Date(), 'yyyy-MM-dd'),
    status: 'Pago' as 'Pago' | 'Pendente',
    observacao: ''
  });

  // Removido sincronização automática com o filtro para respeitar a "última data" do usuário


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let v = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.type !== 'date' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: v
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor) return alert('Descrição e Valor são obrigatórios');

    setLoading(true);
    const result = await storageService.saveTransaction({
      id: `exp_${Date.now()}`,
      type: 'expense',
      category: formData.categoria,
      amount: parseFloat(formData.valor),
      description: formData.descricao,
      date: formData.data,
      vencimento: formData.vencimento,
      status: formData.status,
      observacao: formData.observacao
    });

    setLoading(false);
    
    if (result) {
      storageService.setLastUsedDate(formData.data);
      onSuccess(new Date(formData.data + 'T12:00:00'));
      onClose();
    } else {
      alert('Erro ao salvar a despesa no banco de dados. Verifique sua conexão.');
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Nova Saída de Caixa" headerColorContext="danger">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria da Despesa</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500">
              <option value="Operacional">Custo Operacional</option>
              <option value="Impostos">Impostos (Geração Boleto)</option>
              <option value="Manutenção">Manutenção de TI/Equip.</option>
              <option value="Suprimentos">Suprimentos e Limpeza</option>
              <option value="Aluguel">Aluguel do Galpão</option>
              <option value="Folha">Folha de Pagamento</option>
              <option value="Outros">Outras Despesas</option>
            </select>
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Status da Conta</label>
             <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500">
               <option value="Pago">Liquidado (Pago)</option>
               <option value="Pendente">Em Aberto (Pendente)</option>
             </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição Exata</label>
          <input type="text" name="descricao" required value={formData.descricao} onChange={handleChange} placeholder="COMPRA DE MATERIAIS" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 col-span-1">
            <label className="block text-sm font-semibold text-rose-800 mb-1">Valor Total (R$)</label>
            <input type="number" step="0.01" name="valor" required value={formData.valor} onChange={handleChange} className="w-full bg-white border border-rose-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500 font-bold" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data Lançamento</label>
            <input type="date" name="data" required value={formData.data} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Vencimento Limite</label>
            <input type="date" name="vencimento" required value={formData.vencimento} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observações Privadas</label>
          <textarea name="observacao" rows={2} value={formData.observacao} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center">
          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Lançar Despesa / Tributo'}
        </button>
      </form>
    </BaseModal>
  );
}
