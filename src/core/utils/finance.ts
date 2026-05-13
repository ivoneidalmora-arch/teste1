import { Transaction } from '@/core/types/finance';
import { isSameMonth, isSameYear } from 'date-fns';

/**
 * Normaliza um valor monetário para número
 */
export function normalizeCurrencyValue(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const str = String(value).replace(/[^\d.,-]/g, '');
  if (!str) return 0;
  // Trata formato brasileiro (1.000,00) -> 1000.00
  if (str.includes(',') && str.includes('.')) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  }
  if (str.includes(',')) {
    return parseFloat(str.replace(',', '.'));
  }
  return parseFloat(str);
}

/**
 * Normaliza uma transação bruta do banco para o tipo Transaction padrão do sistema
 */
export function normalizeTransaction(raw: any): Transaction {
  // Se já estiver normalizada, retorna
  if (raw.type && (raw.type === 'income' || raw.type === 'expense')) {
    return raw as Transaction;
  }

  const isIncome = raw.amountBruto !== undefined || raw.cliente !== undefined || raw.placa !== undefined;
  
  if (isIncome) {
    return {
      id: String(raw.id),
      type: 'income',
      amount: normalizeCurrencyValue(raw.amount || raw.amountBruto || 0),
      grossAmount: normalizeCurrencyValue(raw.amountBruto || raw.amount || 0),
      netAmount: normalizeCurrencyValue(raw.amountLiquido || raw.amount || 0),
      date: raw.date || raw.data || '',
      category: raw.category || raw.categoria || 'Outros',
      customer: raw.cliente || raw.customer || 'S/N',
      status: 'paid',
      source: 'database',
      metadata: {
        placa: raw.placa,
        nf: raw.nf,
        pagamento: raw.pagamento,
        observacao: raw.observacao
      }
    };
  }

  return {
    id: String(raw.id),
    type: 'expense',
    amount: normalizeCurrencyValue(raw.amount || 0),
    date: raw.date || raw.data || '',
    category: raw.category || raw.categoria || 'Outros',
    description: raw.description || raw.descricao || 'Despesa sem descrição',
    status: (raw.status === 'Pago' || raw.status === 'paid') ? 'paid' : ((raw.status === 'Pendente' || raw.status === 'pending') ? 'pending' : 'overdue'),
    dueDate: raw.vencimento || raw.date || '',
    source: 'database',
    metadata: {
      observacao: raw.observacao
    }
  };
}

/**
 * Calcula métricas financeiras para um conjunto de transações
 */
export function calculateFinancialMetrics(transactions: (Transaction | any)[]) {
  const normalized = transactions.map(normalizeTransaction);
  
  const receitas = normalized.filter(t => t.type === 'income');
  const despesas = normalized.filter(t => t.type === 'expense');

  const receitaBruta = receitas.reduce((sum, t) => sum + (t.grossAmount || 0), 0);
  const receitaLiquida = receitas.reduce((sum, t) => sum + (t.netAmount || 0), 0);

  const despesasPagas = despesas
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesasPendentes = despesas
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesasTotal = despesasPagas + despesasPendentes;

  const saldoDisponivel = receitaLiquida - despesasPagas;
  const saldoProjetado = receitaLiquida - despesasTotal;
  const lucroMes = receitaLiquida - despesasTotal;
  const margemLiquida = receitaBruta > 0 ? (receitaLiquida / receitaBruta) * 100 : 0;
  const ticketMedio = receitas.length > 0 ? receitaBruta / receitas.length : 0;

  return {
    receitaBruta,
    receitaLiquida,
    despesasPagas,
    despesasPendentes,
    despesasTotal,
    saldoDisponivel,
    saldoProjetado,
    lucroMes,
    margemLiquida,
    ticketMedio,
    totalTransactions: normalized.length
  };
}

/**
 * Calcula variação percentual entre dois valores
 */
export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Filtra transações por mês e ano específicos
 */
export function filterByMonth(transactions: Transaction[], selectedDate: Date) {
  return transactions.filter(t => {
    try {
      const d = new Date(t.date);
      return isSameMonth(d, selectedDate) && isSameYear(d, selectedDate);
    } catch (e) {
      return false;
    }
  });
}

// Constantes legadas mantidas para compatibilidade de UI se necessário
export const CONVERSAO_VRTE_2025 = 4.6732;
export const VISTORIA_CATEGORIES = [
  'Vistoria de Entrada',
  'Vistoria de Saída',
  'Vistoria Cautelar',
  'Vistoria de Retorno',
  'Transferência'
] as const;
export type VistoriaCategory = typeof VISTORIA_CATEGORIES[number];

export function calculateLiquido(bruto: number) {
  return Math.max(0, bruto - 50.72);
}
