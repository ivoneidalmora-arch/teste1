import { supabase } from '@/services/supabase';
import { Transaction, NewTransaction } from '@/core/types/finance';
import { TransactionMapper } from '../mappers/transaction.mapper';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const [resRec, resDes] = await Promise.all([
      supabase.from('Receitas').select('*'),
      supabase.from('Despesas').select('*')
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

  async save(transaction: NewTransaction): Promise<Transaction | null> {
    const table = transaction.type === 'income' ? 'Receitas' : 'Despesas';
    
    // Mapeamento inverso para o banco de dados (legado)
    const payload: Record<string, any> = {
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
    };

    if (transaction.type === 'income') {
      payload.amountBruto = transaction.grossAmount || transaction.amount;
      payload.amountLiquido = transaction.netAmount || transaction.amount;
      payload.cliente = transaction.customer;
      payload.placa = transaction.metadata?.placa;
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
    if (error) throw error;
    
    return transaction.type === 'income' 
      ? TransactionMapper.toIncome(data) 
      : TransactionMapper.toExpense(data);
  },

  async update(id: string | number, type: 'income' | 'expense', transaction: Partial<Transaction>): Promise<boolean> {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    
    const payload: Record<string, any> = {};
    if (transaction.amount !== undefined) payload.amount = transaction.amount;
    if (transaction.date !== undefined) payload.date = transaction.date;
    if (transaction.category !== undefined) payload.category = transaction.category;
    
    if (type === 'income') {
      if (transaction.grossAmount !== undefined) payload.amountBruto = transaction.grossAmount;
      if (transaction.netAmount !== undefined) payload.amountLiquido = transaction.netAmount;
      if (transaction.customer !== undefined) payload.cliente = transaction.customer;
      if (transaction.metadata?.placa !== undefined) payload.placa = transaction.metadata.placa;
    } else {
      if (transaction.description !== undefined) payload.description = transaction.description;
      if (transaction.status !== undefined) payload.status = transaction.status === 'paid' ? 'Pago' : 'Pendente';
    }
    
    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (error) throw error;
    return true;
  },

  async delete(id: string | number, type: 'income' | 'expense'): Promise<boolean> {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteAll(): Promise<boolean> {
    const { error: err1 } = await supabase.from('Receitas').delete().neq('id', '0');
    const { error: err2 } = await supabase.from('Despesas').delete().neq('id', '0');
    if (err1) throw err1;
    if (err2) throw err2;
    return true;
  },

  async bulkInsert(transactions: NewTransaction[]): Promise<boolean> {
    const incomes = transactions.filter(t => t.type === 'income').map(t => ({
      amount: t.amount,
      amountBruto: t.grossAmount || t.amount,
      amountLiquido: t.netAmount || t.amount,
      date: t.date,
      category: t.category,
      cliente: t.customer,
      placa: t.metadata?.placa,
      nf: t.metadata?.nf,
      pagamento: t.metadata?.pagamento,
      observacao: t.metadata?.observacao,
    }));

    const expenses = transactions.filter(t => t.type === 'expense').map(t => ({
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
      if (error) throw error;
    }

    if (expenses.length > 0) {
      const { error } = await supabase.from('Despesas').insert(expenses);
      if (error) throw error;
    }

    return true;
  }
};
