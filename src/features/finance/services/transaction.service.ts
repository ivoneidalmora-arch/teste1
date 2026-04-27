import { supabase } from '@/services/supabase';
import { Transaction, IncomeTransaction, ExpenseTransaction, NewTransaction } from '@/core/types/finance';
import { TransactionMapper } from '../mappers/transaction.mapper';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    try {
      const [resRec, resDes] = await Promise.all([
        supabase.from('Receitas').select('*'),
        supabase.from('Despesas').select('*')
      ]);

      const income = (resRec.data || []).map(TransactionMapper.toIncome);
      const expense = (resDes.data || []).map(TransactionMapper.toExpense);

      const combined: Transaction[] = [...income, ...expense];

      return combined.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
    } catch (error) {
      console.error('[TransactionService] Error fetching all:', error);
      return [];
    }
  },

  async save(transaction: NewTransaction): Promise<Transaction | null> {
    const { type, ...payload } = transaction as any;
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    if (error) return null;
    
    return type === 'income' ? TransactionMapper.toIncome(data) : TransactionMapper.toExpense(data);
  },

  async update(id: string | number, type: 'income' | 'expense', payload: Partial<Transaction>): Promise<boolean> {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    // Removemos campos que não devem ser enviados no update
    const { id: _id, type: _type, createdAt: _ca, ...cleanPayload } = payload as any;
    
    const { error } = await supabase.from(table).update(cleanPayload).eq('id', id);
    return !error;
  },

  async delete(id: string | number, type: 'income' | 'expense') {
    const table = type === 'income' ? 'Receitas' : 'Despesas';
    const { error } = await supabase.from(table).delete().eq('id', id);
    return !error;
  },

  async deleteAll() {
    const { error: err1 } = await supabase.from('Receitas').delete().neq('id', '0');
    const { error: err2 } = await supabase.from('Despesas').delete().neq('id', '0');
    return !err1 && !err2;
  }
};
