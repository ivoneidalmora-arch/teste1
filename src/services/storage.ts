import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/transaction';
import { supabase } from './supabase';
import { calculateLiquido } from '@/utils/finance';

export const storageService = {
  // === Persistência de Preferências ===
  getLastUsedDate: (): string | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('last_used_date');
    if (!stored) return null;
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!stored.startsWith(currentMonth)) {
      localStorage.removeItem('last_used_date');
      return null;
    }
    return stored;
  },

  setLastUsedDate: (date: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('last_used_date', date);
  },

  // === Transactions CRUD (Cloud Supabase) ===
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const [resRec, resDes] = await Promise.all([
        supabase.from('Receitas').select('*'),
        supabase.from('Despesas').select('*')
      ]);

      const { data: receitas } = resRec;
      const { data: despesas } = resDes;

      const combined: Transaction[] = [];

      if (receitas) {
        combined.push(...receitas.map((r: any) => ({
          ...r,
          type: 'income' as const,
          amount: parseFloat(r.amount) || parseFloat(r.amountBruto) || 0,
          amountBruto: parseFloat(r.amountBruto),
          amountLiquido: parseFloat(r.amountLiquido),
          createdAt: r.created_at
        })));
      }

      if (despesas) {
        combined.push(...despesas.map((d: any) => ({
          ...d,
          type: 'expense' as const,
          amount: parseFloat(d.amount) || parseFloat(d.valor) || 0,
          date: d.date || d.data || d.vencimento,
          description: d.description || d.descricao || 'Despesa',
          status: d.status || 'Pago',
          createdAt: d.created_at
        })));
      }

      return combined.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
    } catch (e) {
      console.error('Error fetching transactions', e);
      return [];
    }
  },

  saveTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    try {
      const { id, type, ...payload } = transaction as any;
      const table = type === 'income' ? 'Receitas' : 'Despesas';
      const dbPayload = typeof id === 'string' ? payload : { id, ...payload };
      
      const { data, error } = await supabase.from(table).insert([dbPayload]).select().single();
      if (error) throw error;
      return { ...data, type } as Transaction;
    } catch (e) {
      console.error('Erro ao salvar transação', e);
      return null;
    }
  },

  updateTransaction: async (id: string | number, updatedTransaction: Transaction): Promise<boolean> => {
    try {
      const { type, id: _, createdAt, ...payload } = updatedTransaction as any;
      const table = type === 'income' ? 'Receitas' : 'Despesas';
      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Erro ao atualizar transação', e);
      return false;
    }
  },

  deleteTransaction: async (id: string | number, type: 'income' | 'expense'): Promise<boolean> => {
    try {
      const table = type === 'income' ? 'Receitas' : 'Despesas';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Erro ao deletar transação', e);
      return false;
    }
  },

  // --- FERRAMENTAS DE DADOS ---
  exportData: async (): Promise<any> => {
    const { data: receitas } = await supabase.from('Receitas').select('*');
    const { data: despesas } = await supabase.from('Despesas').select('*');
    return { exportDate: new Date().toISOString(), data: { receitas, despesas } };
  },

  saveBulkIncomes: async (incomes: any[]): Promise<{ success: boolean, count: number }> => {
    try {
      const payload = incomes.map(item => {
        const bruto = parseFloat(item.valorBruto) || 0;
        const liquido = calculateLiquido(bruto);

        return {
          category: item.categoria || 'Transferência',
          placa: item.placa?.toUpperCase(),
          cliente: item.cliente?.toUpperCase(),
          amountBruto: bruto,
          amountLiquido: liquido,
          amount: bruto,
          date: item.data,
          pagamento: 'Pix',
          type: 'income'
        };
      });

      const { data, error } = await supabase.from('Receitas').insert(payload).select();
      if (error) throw error;
      return { success: true, count: data?.length || 0 };
    } catch (e) {
      console.error('Erro no bulk insert', e);
      return { success: false, count: 0 };
    }
  }
};
