"use client";

import { useState, useEffect } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { transactionService } from '@/features/finance/services/transaction.service';
import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';
import { cn } from '@/core/utils/formatters';
import { Save } from 'lucide-react';
import { PlacaInput } from '@/core/components/ui/PlacaInput';
import { MoneyInput } from '@/core/components/ui/MoneyInput';
import { calculateLiquido, CONVERSAO_VRTE_2025 } from '@/core/utils/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (date?: Date) => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({ isOpen, onClose, onSuccess, transaction }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (transaction) {
      if (transaction.type === 'income') {
        const t = transaction as IncomeTransaction;
        setFormData({
          type: 'income',
          categoria: t.category,
          placa: t.placa || '',
          cliente: t.cliente || '',
          data: t.date || '',
          valorBruto: t.amountBruto || t.amount || 0,
          valorLiquido: t.amountLiquido || t.amount || 0,
          pagamento: t.pagamento || 'Pix',
          nf: t.nf || '',
          observacao: t.observacao || ''
        });
      } else {
        const t = transaction as ExpenseTransaction;
        setFormData({
          type: 'expense',
          categoria: t.category,
          descricao: t.description || '',
          valor: t.amount || 0,
          data: t.date || '',
          vencimento: t.vencimento || t.date || '',
          status: t.status || 'Pago',
          observacao: t.observacao || ''
        });
      }
    }
  }, [transaction]);

  useEffect(() => {
    if (formData?.type === 'income') {
      if (formData.categoria === 'Vistoria de Retorno') {
        setFormData((prev: any) => ({ ...prev, valorBruto: 0, valorLiquido: 0 }));
      } else if (formData.categoria !== 'Vistoria Cautelar') {
        const liq = calculateLiquido(formData.valorBruto);
        setFormData((prev: any) => ({ ...prev, valorLiquido: liq }));
      }
    }
  }, [formData?.valorBruto, formData?.categoria, formData?.type]);

  if (!transaction || !formData) return null;

  const isIncome = formData.type === 'income';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'valor' || name.startsWith('valor') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData: any = {
      category: formData.categoria,
      date: formData.data,
      observacao: formData.observacao.toUpperCase(),
    };

    if (isIncome) {
      Object.assign(updatedData, {
        placa: formData.placa,
        cliente: formData.cliente.toUpperCase(),
        amountBruto: formData.valorBruto,
        amountLiquido: formData.valorLiquido,
        amount: formData.valorBruto,
        pagamento: formData.pagamento,
        nf: formData.nf.toUpperCase(),
      });
    } else {
      Object.assign(updatedData, {
        description: formData.descricao.toUpperCase(),
        amount: formData.valor,
        vencimento: formData.vencimento,
        status: formData.status,
      });
    }

    const success = await transactionService.update(transaction.id, formData.type, updatedData);
    
    setLoading(false);
    if (success) {
      onSuccess(new Date(formData.data + 'T12:00:00'));
      onClose();
    } else {
      alert('Erro ao atualizar lançamento.');
    }
  };

  const isAutoLiquido = isIncome && formData.categoria !== 'Vistoria Cautelar' && !!CONVERSAO_VRTE_2025[formData.valorBruto];

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Editar ${isIncome ? 'Receita' : 'Despesa'}`}
      headerColorContext={isIncome ? 'success' : 'danger'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID do Registro</span>
            <span className="text-xs font-mono text-slate-600">#{transaction.id}</span>
          </div>
          <div className={cn(
             "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
             isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {isIncome ? 'Entrada / Receita' : 'Saída / Despesa'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
              {isIncome ? (
                <>
                  <option value="Transferência">Transferência</option>
                  <option value="Vistoria Cautelar">Vistoria Cautelar</option>
                  <option value="Motor">Motor</option>
                  <option value="Especial">Especial</option>
                  <option value="Vistoria de Entrada">Vistoria de Entrada</option>
                  <option value="Vistoria de Retorno">Vistoria de Retorno</option>
                </>
              ) : (
                <>
                  <option value="Operacional">Custo Operacional</option>
                  <option value="Impostos">Impostos</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Suprimentos">Suprimentos</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Folha">Folha de Pagamento</option>
                  <option value="Outros">Outros</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input type="date" name="data" required value={formData.data} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {isIncome ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlacaInput label="Placa" name="placa" required value={formData.placa} onChange={handleChange} />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente</label>
                <input type="text" name="cliente" required value={formData.cliente} onChange={e => setFormData((p: any) => ({...p, cliente: e.target.value.toUpperCase()}))} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
              <MoneyInput label="Valor Bruto" name="valorBruto" required value={formData.valorBruto} onChange={handleChange} disabled={formData.categoria === 'Vistoria de Retorno'} />
              <MoneyInput 
                label="Dedução Líquida" 
                name="valorLiquido" 
                required 
                value={formData.valorLiquido} 
                onChange={handleChange} 
                disabled={formData.categoria === 'Vistoria de Retorno' || isAutoLiquido}
                className={cn(isAutoLiquido && "bg-emerald-100/50 border-emerald-200 text-emerald-800")}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
              <input type="text" name="descricao" required value={formData.descricao} onChange={e => setFormData((p: any) => ({...p, descricao: e.target.value.toUpperCase()}))} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MoneyInput label="Valor Total" name="valor" required value={formData.valor} onChange={handleChange} prefix="R$" className="bg-rose-50/30 border-rose-100" />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Pago">Liquidado (Pago)</option>
                  <option value="Pendente">Em Aberto (Pendente)</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observações Privadas</label>
          <textarea name="observacao" rows={2} value={formData.observacao} onChange={e => setFormData((p: any) => ({...p, observacao: e.target.value.toUpperCase()}))} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancelar</button>
          <button 
            disabled={loading} 
            type="submit" 
            className={cn(
              "flex-[2] py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
              isIncome ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
            )}
          >
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Save className="w-5 h-5" />} Salvar
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
