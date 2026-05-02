import { Transaction } from '@/core/types/finance';

export const TransactionMapper = {
  /**
   * Converte um registro bruto da tabela 'Receitas' para o tipo Transaction padronizado
   */
  toIncome(raw: Record<string, any>): Transaction {
    const amountBruto = parseFloat(raw.amountBruto) || parseFloat(raw.amount) || 0;
    const amountLiquido = parseFloat(raw.amountLiquido) || amountBruto || 0;
    
    return {
      id: String(raw.id),
      type: 'income',
      category: raw.category || 'Outros',
      amount: amountBruto,
      grossAmount: amountBruto,
      netAmount: amountLiquido,
      date: String(raw.date || raw.data || '').split('T')[0],
      description: `Placa: ${raw.placa || 'N/A'} - ${raw.cliente || 'Particular'}`,
      customer: raw.cliente || 'Particular',
      status: 'paid', // Receitas no Supabase geralmente são tratadas como pagas
      source: raw.source || 'supabase',
      metadata: {
        placa: raw.placa,
        nf: raw.nf,
        pagamento: raw.pagamento,
        observacao: raw.observacao
      },
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt
    };
  },

  /**
   * Converte um registro bruto da tabela 'Despesas' para o tipo Transaction padronizado
   */
  toExpense(raw: Record<string, any>): Transaction {
    const amount = parseFloat(raw.amount) || parseFloat(raw.valor) || 0;
    const legacyStatus = raw.status || 'Pago';
    
    return {
      id: String(raw.id),
      type: 'expense',
      category: raw.category || 'Operacional',
      amount: amount,
      grossAmount: amount,
      netAmount: amount,
      date: String(raw.date || raw.data || raw.vencimento || '').split('T')[0],
      dueDate: raw.vencimento ? String(raw.vencimento).split('T')[0] : undefined,
      description: raw.description || raw.descricao || 'Despesa',
      status: legacyStatus === 'Pago' ? 'paid' : 'pending',
      source: raw.source || 'supabase',
      metadata: {
        observacao: raw.observacao
      },
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt
    };
  }
};
