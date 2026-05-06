import { Transaction } from '@/core/types/finance';
import { isSameMonth, isSameYear, subMonths } from 'date-fns';

/**
 * Constantes e Tipos Legados para compatibilidade com Modais
 */
export const CONVERSAO_VRTE_2025: Record<number, number> = {
  // VRTE 2025 = 4.67. Exemplo de mapeamento:
  15: 70.05,
  20: 93.40,
  25: 116.75
};

export type VistoriaCategory = 'Transferência' | 'Entrada' | 'Retorno' | 'Vistoria de Retorno' | 'Vistoria Cautelar' | 'Outros';

export const VISTORIA_CATEGORIES: VistoriaCategory[] = [
  'Transferência',
  'Entrada',
  'Retorno',
  'Vistoria de Retorno',
  'Vistoria Cautelar',
  'Outros',
];

export function calculateLiquido(bruto: number, taxa: number = 0, desconto: number = 0) {
  return bruto - taxa - desconto;
}

/**
 * Normaliza dados de transação para um padrão único,
 */
export function normalizeTransaction(t: any) {
  const dateObj = t.date instanceof Date ? t.date : new Date(t.date ?? t.data ?? new Date());
  return {
    id: String(t.id),
    date: dateObj,
    dateString: dateObj.toISOString(), // Adicionado para compatibilidade com tabelas que esperam string
    description: t.description ?? t.descricao ?? "Sem descrição",
    customer: t.customer ?? t.cliente ?? "N/A",
    category: t.category ?? t.categoria ?? "Outros",
    amount: Number(t.amount ?? t.valor ?? 0),
    type: (t.type ?? t.tipo) === 'income' || (t.type ?? t.tipo) === 'receita' ? 'income' : 'expense',
    status: t.status === 'paid' || t.status === 'pago' ? 'paid' : 
            t.status === 'pending' || t.status === 'pendente' ? 'pending' :
            t.status === 'overdue' || t.status === 'atrasado' ? 'overdue' : 'cancelled',
    origin: t.origin ?? t.origem ?? t.source ?? "sistema",
    discount: Number(t.discount ?? t.desconto ?? 0),
    fee: Number(t.fee ?? t.taxa ?? 0),
  };
}

/**
 * Calcula métricas financeiras para um conjunto de transações
 */
export function calculateFinancialMetrics(transactions: any[]) {
  const normalized = transactions.map(normalizeTransaction);

  const receitaBruta = normalized
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const despesasPagas = normalized
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const despesasPendentes = normalized
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const descontosETaxas = normalized
    .reduce((acc, t) => acc + t.discount + t.fee, 0);

  const estornos = normalized
    .filter(t => t.status === 'cancelled') // Assumindo cancelado como estorno para este contexto
    .reduce((acc, t) => acc + t.amount, 0);

  const receitaLiquida = receitaBruta - despesasPagas - descontosETaxas - estornos;
  const lucroMes = receitaLiquida; // Simplificado conforme pedido

  return {
    receitaBruta,
    receitaLiquida,
    despesasPagas,
    despesasPendentes,
    lucroMes,
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
export function filterByMonth(transactions: any[], selectedDate: Date) {
  return transactions.filter(t => {
    const d = new Date(t.date ?? t.data);
    return isSameMonth(d, selectedDate) && isSameYear(d, selectedDate);
  });
}
