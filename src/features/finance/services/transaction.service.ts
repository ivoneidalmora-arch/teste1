import { supabase } from '@/lib/supabase/client';
import { Transaction, NewTransaction } from '@/core/types/finance';
import { TransactionMapper } from '../mappers/transaction.mapper';
import { normalizePlaca } from '@/features/ai-ocr/utils/normalization';
import { normalizeRevenueName } from '../utils/normalization';

export const transactionService = {
  async getAll(app_user_id: string): Promise<Transaction[]> {
    const [resRec, resDes] = await Promise.all([
      supabase.from('Receitas').select('*').eq('app_user_id', app_user_id),
      supabase.from('Despesas').select('*').eq('app_user_id', app_user_id)
    ]);

    if (resRec.error) throw resRec.error;
    if (resDes.error) throw resDes.error;

    const income = (resRec.data || []).map(raw => TransactionMapper.toIncome(raw));
    const expense = (resDes.data || []).map(raw => TransactionMapper.toExpense(raw));

    const combined: Transaction[] = [...income, ...expense];

    return combined.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return String(b.id).localeCompare(String(a.id));
    });
  },

  async save(transaction: NewTransaction, app_user_id: string): Promise<Transaction | null> {
    const table = transaction.type === 'income' ? 'Receitas' : 'Despesas';
    
    const payload: Record<string, any> = {
      app_user_id,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.type === 'income' ? normalizeRevenueName(transaction.category || '') : (transaction.category || ''),
    };

    if (transaction.type === 'income') {
      payload.amountBruto = transaction.grossAmount || transaction.amount;
      payload.amountLiquido = transaction.netAmount || transaction.amount;
      payload.cliente = transaction.customer;
      payload.placa = normalizePlaca((transaction as any).placa ?? transaction.metadata?.placa) || '';
      payload.nf = transaction.metadata?.nf;
      payload.pagamento = transaction.metadata?.pagamento;
      payload.observacao = transaction.metadata?.observacao;
    } else {
      payload.description = transaction.description;
      payload.vencimento = transaction.dueDate || transaction.date;
      payload.status = transaction.status === 'paid' ? 'Pago' : 'Pendente';
      payload.observacao = transaction.metadata?.observacao;
    }
    
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    if (error) {
      if (error.message.includes('placa') && error.message.includes('not-null')) {
        throw new Error(
          "Não foi possível salvar: a placa do veículo é obrigatória para receitas."
        );
      }
      throw error;
    }
    
    return transaction.type === 'income' 
      ? TransactionMapper.toIncome(data) 
      : TransactionMapper.toExpense(data);
  },

  async update(id: string | number, type: 'income' | 'expense', transaction: Partial<Transaction>, app_user_id: string): Promise<boolean> {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    
    const payload: Record<string, any> = {};
    if (transaction.amount !== undefined) payload.amount = transaction.amount;
    if (transaction.date !== undefined) payload.date = transaction.date;
    if (transaction.category !== undefined) {
      payload.category = type === 'income' ? normalizeRevenueName(transaction.category) : transaction.category;
    }
    
    if (type === 'income') {
      if (transaction.grossAmount !== undefined) payload.amountBruto = transaction.grossAmount;
      if (transaction.netAmount !== undefined) payload.amountLiquido = transaction.netAmount;
      if (transaction.customer !== undefined) payload.cliente = transaction.customer;
      if (transaction.metadata?.placa !== undefined) payload.placa = transaction.metadata.placa;
    } else {
      if (transaction.description !== undefined) payload.description = transaction.description;
      if (transaction.status !== undefined) payload.status = transaction.status === 'paid' ? 'Pago' : 'Pendente';
      if (transaction.dueDate !== undefined) payload.vencimento = transaction.dueDate;
    }
    
    const { error } = await supabase.from(table).update(payload).eq('id', id).eq('app_user_id', app_user_id);
    if (error) throw error;
    return true;
  },

  async delete(id: string | number, type: 'income' | 'expense', app_user_id: string): Promise<boolean> {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    const { error } = await supabase.from(table).delete().eq('id', id).eq('app_user_id', app_user_id);
    if (error) throw error;
    return true;
  },

  async deleteAll(app_user_id: string): Promise<boolean> {
    const { error: err1 } = await supabase.from('Receitas').delete().eq('app_user_id', app_user_id);
    const { error: err2 } = await supabase.from('Despesas').delete().eq('app_user_id', app_user_id);
    if (err1) throw err1;
    if (err2) throw err2;
    return true;
  },

  async bulkInsert(transactions: NewTransaction[], app_user_id: string): Promise<boolean> {
    const incomes = transactions.filter(t => t.type === 'income').map(t => ({
      app_user_id,
      amount: t.amount,
      amountBruto: t.grossAmount || t.amount,
      amountLiquido: t.netAmount || t.amount,
      date: t.date,
      category: normalizeRevenueName(t.category || ''),
      cliente: t.customer,
      placa: normalizePlaca((t as any).placa ?? t.metadata?.placa) || '', 
      nf: t.metadata?.nf,
      pagamento: t.metadata?.pagamento,
      observacao: t.metadata?.observacao,
    }));

    const expenses = transactions.filter(t => t.type === 'expense').map(t => ({
      app_user_id,
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
      vencimento: t.dueDate || t.date,
      status: t.status === 'paid' ? 'Pago' : 'Pendente',
      observacao: t.metadata?.observacao,
    }));

    if (incomes.length > 0) {
      const { error } = await supabase.from('Receitas').insert(incomes);
      if (error) {
        if (error.message.includes('placa') && error.message.includes('not-null')) {
          throw new Error("Erro de integridade: Alguns registros de receita no backup estão sem a placa obrigatória.");
        }
        throw error;
      }
    }

    if (expenses.length > 0) {
      const { error } = await supabase.from('Despesas').insert(expenses);
      if (error) throw error;
    }

    return true;
  }
};
