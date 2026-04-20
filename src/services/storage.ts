import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { supabase } from './supabase';

const SESSION_KEY = 'alfa_session';

export const storageService = {
  // === Sessão / Auth (Mantido Local por enquanto) ===
  getSession: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(SESSION_KEY);
  },
  
  setSession: (token: string = 'active'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, token);
  },
  
  clearSession: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
  },

  // === Transactions CRUD (Cloud Supabase) ===
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const { data: receitas, error: errRec } = await supabase.from('Receitas').select('*');
      const { data: despesas, error: errDes } = await supabase.from('Despesas').select('*');

      if (errRec) console.error('Erro ao buscar receitas:', errRec);
      if (errDes) console.error('Erro ao buscar despesas:', errDes);

      const combined: Transaction[] = [];

      if (receitas) {
        combined.push(...receitas.map((r: any) => ({
          id: r.id,
          type: 'income' as const,
          category: r.category || 'Vistoria',
          amount: parseFloat(r.amount) || parseFloat(r.amountBruto) || 0,
          date: r.date,
          observacao: r.observacao,
          placa: r.placa,
          cliente: r.cliente,
          nf: r.nf,
          pagamento: r.pagamento,
          amountBruto: parseFloat(r.amountBruto),
          amountLiquido: parseFloat(r.amountLiquido),
        })));
      }

      if (despesas) {
        combined.push(...despesas.map((d: any) => ({
          id: d.id,
          type: 'expense' as const,
          category: d.category || 'Geral',
          amount: parseFloat(d.amount) || parseFloat(d.valor) || 0,
          date: d.date || d.data || d.vencimento,
          observacao: d.observacao,
          description: d.description || d.descricao || 'Despesa',
          vencimento: d.vencimento || d.date || d.data,
          status: d.status || 'Pago',
        })));
      }

      // Ordenar por data decrescente
      return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error('Error fetching transactions from Supabase', e);
      return [];
    }
  },

  saveTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    try {
      if (transaction.type === 'income') {
        const { id, type, ...payload } = transaction as IncomeTransaction;
        // Evitamos enviar ID caso seja mock string de locale antigo
        const dbPayload = typeof id === 'string' && id.startsWith('inc_') ? payload : { id, ...payload };
        
        const { data, error } = await supabase.from('Receitas').insert([dbPayload]).select().single();
        if (error) throw error;
        return { ...data, type: 'income' } as IncomeTransaction;
      } else {
        const { id, type, ...payload } = transaction as ExpenseTransaction;
        const dbPayload = typeof id === 'string' && id.startsWith('exp_') ? payload : { id, ...payload };

        const { data, error } = await supabase.from('Despesas').insert([dbPayload]).select().single();
        if (error) throw error;
        return { ...data, type: 'expense' } as ExpenseTransaction;
      }
    } catch (e) {
      console.error('Erro ao salvar transação', e);
      return null;
    }
  },

  updateTransaction: async (id: string | number, updatedTransaction: Transaction): Promise<boolean> => {
    try {
      if (updatedTransaction.type === 'income') {
        const { type, id: _, ...payload } = updatedTransaction as IncomeTransaction;
        const { error } = await supabase.from('Receitas').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { type, id: _, ...payload } = updatedTransaction as ExpenseTransaction;
        const { error } = await supabase.from('Despesas').update(payload).eq('id', id);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('Erro ao atualizar transação', e);
      return false;
    }
  },

  deleteTransaction: async (id: string | number, type: 'income' | 'expense'): Promise<boolean> => {
    try {
      if (type === 'income') {
        const { error } = await supabase.from('Receitas').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('Despesas').delete().eq('id', id);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      console.error('Erro ao deletar transação', e);
      return false;
    }
  },
};
