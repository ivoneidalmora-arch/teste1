import { Transaction } from '@/core/types/finance';

export const TransactionMapper = {
  /**
   * Converte um registro bruto da tabela 'Receitas' para o tipo Transaction padronizado
   */
  toIncome(raw: Record<string, any>): Transaction {
    const amount = parseFloat(raw.amount) || parseFloat(raw.valor) || 0;
    
    // Prioridade Bruto: amountBruto, valor_bruto, gross_value, valor, amount
    const amountBruto = parseFloat(
      raw.amountBruto ?? 
      raw.valor_bruto ?? 
      raw.gross_value ?? 
      raw.grossAmount ??
      raw.valor ?? 
      raw.amount ?? 
      0
    );

    // Prioridade Líquido: amountLiquido, valor_liquido, net_value, liquid_value, amountBruto...
    const amountLiquido = parseFloat(
      raw.amountLiquido ?? 
      raw.valor_liquido ?? 
      raw.net_value ?? 
      raw.netAmount ??
      raw.liquid_value ??
      raw.amountBruto ?? 
      raw.valor_bruto ?? 
      raw.valor ?? 
      raw.amount ?? 
      0
    );
    
    return {
      id: String(raw.id),
      app_user_id: raw.app_user_id,
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
      app_user_id: raw.app_user_id,
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
