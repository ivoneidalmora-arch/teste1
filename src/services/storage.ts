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

  // === Persistência de Preferências ===
  getLastUsedDate: (): string | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('last_used_date');
    if (!stored) return null;
    
    // Se a data salva for de um mês/ano diferente do atual, ignoramos para evitar lançamentos retroativos acidentais
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

      const { data: receitas, error: errRec } = resRec;
      const { data: despesas, error: errDes } = resDes;

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
          createdAt: r.created_at || r.createdAt
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
          createdAt: d.created_at || d.createdAt
        })));
      }

      // Ordenar por data (string YYYY-MM-DD) decrescente e ID decrescente
      return combined.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
    } catch (e) {
      console.error('Error fetching transactions from Supabase', e);
      return [];
    }
  },

  saveTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    try {
      if (transaction.type === 'income') {
        const { id, type, ...payload } = transaction as IncomeTransaction;
        // Se o ID for string (ex: loc_... ou inc_...), omitimos para o Supabase gerar o ID real
        const dbPayload = typeof id === 'string' ? payload : { id, ...payload };
        
        const { data, error } = await supabase.from('Receitas').insert([dbPayload]).select().single();
        if (error) throw error;
        return { ...data, type: 'income' } as IncomeTransaction;
      } else {
        const { id, type, ...payload } = transaction as ExpenseTransaction;
        const dbPayload = typeof id === 'string' ? payload : { id, ...payload };

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
        const { type, id: _, createdAt, ...payload } = updatedTransaction as IncomeTransaction;
        const { error } = await supabase.from('Receitas').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { type, id: _, createdAt, ...payload } = updatedTransaction as ExpenseTransaction;
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

  // --- FERRAMENTAS DE DADOS (BACKUP / RESET) ---

  resetDatabase: async (): Promise<boolean> => {
    try {
      // Deleta todos os registros onde ID != 0 (ou seja, tudo)
      const { error: rErr } = await supabase.from('Receitas').delete().neq('id', 0);
      if (rErr) throw rErr;
      
      const { error: dErr } = await supabase.from('Despesas').delete().neq('id', 0);
      if (dErr) throw dErr;

      return true;
    } catch (e) {
      console.error('Erro ao resetar banco', e);
      return false;
    }
  },

  exportData: async (): Promise<any> => {
    try {
      const { data: receitas } = await supabase.from('Receitas').select('*');
      const { data: despesas } = await supabase.from('Despesas').select('*');
      
      return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          receitas: receitas || [],
          despesas: despesas || []
        }
      };
    } catch (e) {
      console.error('Erro ao exportar dados', e);
      return null;
    }
  },

  importData: async (json: any): Promise<{ success: boolean, count: number }> => {
    try {
      if (!json || !json.data) throw new Error('Formato de backup inválido');
      
      const { receitas, despesas } = json.data;
      let count = 0;

      if (receitas && receitas.length > 0) {
        // Remove IDs para gerar novos no Supabase e evitar conflitos
        const recs = receitas.map(({ id, ...rest }: any) => rest);
        const { error } = await supabase.from('Receitas').insert(recs);
        if (error) throw error;
        count += receitas.length;
      }

      if (despesas && despesas.length > 0) {
        const exps = despesas.map(({ id, ...rest }: any) => rest);
        const { error } = await supabase.from('Despesas').insert(exps);
        if (error) throw error;
        count += despesas.length;
      }

      return { success: true, count };
    } catch (e) {
      console.error('Erro na importação', e);
      return { success: false, count: 0 };
    }
  },

  saveBulkIncomes: async (incomes: any[]): Promise<{ success: boolean, count: number }> => {
    try {
      // Mapeamento VRTE para cálculo automático do líquido
      const CONVERSAO: Record<number, number> = {
        198.13: 147.41,
        169.83: 127.08,
        141.52: 105.86,
        108.50: 75.96,
        94.35: 63.49
      };

      const payload = incomes.map(item => {
        const bruto = parseFloat(item.valorBruto) || 0;
        // Acha o valor líquido correspondente na tabela ou usa o bruto se não houver match
        const match = Object.keys(CONVERSAO).find(k => Math.abs(parseFloat(k) - bruto) < 0.01);
        const liquido = match ? CONVERSAO[parseFloat(match)] : bruto;

        return {
          category: item.categoria || 'Transferência',
          placa: item.placa?.toUpperCase(),
          cliente: item.cliente?.toUpperCase(),
          amountBruto: bruto,
          amountLiquido: liquido,
          amount: bruto,
          date: item.data, // Esperado YYYY-MM-DD
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
