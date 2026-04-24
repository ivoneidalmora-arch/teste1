import { Transaction, IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';

export const TransactionMapper = {
  /**
   * Converte um registro bruto da tabela 'Receitas' para o tipo IncomeTransaction
   */
  toIncome(raw: any): IncomeTransaction {
    const amountBruto = parseFloat(raw.amountBruto) || parseFloat(raw.amount) || 0;
    const amountLiquido = parseFloat(raw.amountLiquido) || amountBruto || 0;
    
    return {
      id: raw.id,
      type: 'income',
      category: raw.category || 'Outros',
      amount: amountBruto, // No sistema atual, amount geralmente reflete o bruto
      amountBruto,
      amountLiquido,
      date: raw.date || raw.data || '',
      placa: raw.placa || '',
      cliente: raw.cliente || '',
      nf: raw.nf || '',
      pagamento: raw.pagamento || 'Pix',
      observacao: raw.observacao || '',
      createdAt: raw.created_at || raw.createdAt
    };
  },

  /**
   * Converte um registro bruto da tabela 'Despesas' para o tipo ExpenseTransaction
   */
  toExpense(raw: any): ExpenseTransaction {
    return {
      id: raw.id,
      type: 'expense',
      category: raw.category || 'Operacional',
      amount: parseFloat(raw.amount) || parseFloat(raw.valor) || 0,
      date: raw.date || raw.data || raw.vencimento || '',
      description: raw.description || raw.descricao || 'Despesa',
      vencimento: raw.vencimento || raw.date || '',
      status: raw.status || 'Pago',
      observacao: raw.observacao || '',
      createdAt: raw.created_at || raw.createdAt
    };
  }
};
