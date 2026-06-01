import { Transaction } from '@/core/types/finance';
import { normalizeRevenueName } from '../utils/normalization';

export const TransactionMapper = {
  /**
   * Converte um registro bruto da tabela unificada 'transactions' para o tipo Transaction de Receita
   */
  toIncome(raw: Record<string, any>): Transaction {
    const amountBruto = parseFloat(raw.gross_amount ?? raw.amountBruto ?? raw.valor_bruto ?? raw.grossAmount ?? raw.amount ?? raw.valor ?? 0);
    const amountLiquido = parseFloat(raw.net_amount ?? raw.amountLiquido ?? raw.valor_liquido ?? raw.netAmount ?? amountBruto);
    
    return {
      id: String(raw.id),
      app_user_id: raw.app_user_id,
      type: 'income',
      category: normalizeRevenueName(raw.category || 'Outros'),
      amount: amountBruto,
      grossAmount: amountBruto,
      netAmount: amountLiquido,
      date: String(raw.date || raw.data || '').split('T')[0],
      description: `Placa: ${raw.plate || raw.placa || 'N/A'} - ${raw.customer_name || raw.cliente || 'Particular'}`,
      customer: raw.customer_name || raw.cliente || 'Particular',
      status: raw.status || 'paid',
      source: raw.source || 'supabase',
      metadata: {
        placa: raw.plate || raw.placa,
        pagamento: raw.payment_method || raw.pagamento,
        observacao: raw.observacao || raw.description
      },
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt
    };
  },

  /**
   * Converte um registro bruto da tabela unificada 'transactions' para o tipo Transaction de Despesa
   */
  toExpense(raw: Record<string, any>): Transaction {
    const amount = parseFloat(raw.expense_amount ?? raw.amount ?? raw.valor ?? 0);
    
    return {
      id: String(raw.id),
      app_user_id: raw.app_user_id,
      type: 'expense',
      category: raw.category || 'Operacional',
      amount: amount,
      grossAmount: amount,
      netAmount: amount,
      date: String(raw.date || raw.data || raw.vencimento || '').split('T')[0],
      description: raw.description || raw.descricao || 'Despesa',
      status: raw.status === 'Pago' || raw.status === 'paid' ? 'paid' : 'pending',
      source: raw.source || 'supabase',
      metadata: {
        pagamento: raw.payment_method || raw.pagamento,
        observacao: raw.observacao
      },
      createdAt: raw.created_at || raw.createdAt,
      updatedAt: raw.updated_at || raw.updatedAt
    };
  }
};
