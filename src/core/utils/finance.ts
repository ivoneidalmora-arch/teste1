import { Transaction } from '@/core/types/finance';
import { isSameMonth, isSameYear, subMonths } from 'date-fns';
import { normalizeCurrencyValue } from '@/lib/financial-rules';

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
 * Auxiliares de Tipo
 */
export function isIncome(t: any): boolean {
  const type = String(t.type ?? t.tipo ?? "").toLowerCase();
  return ["receita", "income", "entrada", "revenue"].includes(type);
}

export function isExpense(t: any): boolean {
  const type = String(t.type ?? t.tipo ?? "").toLowerCase();
  return ["despesa", "expense", "saida", "saída", "outcome"].includes(type);
}

/**
 * Normaliza dados de transação para um padrão único.
 */
export function normalizeTransaction(t: any): Transaction {
  const dateStr = t.date ?? t.data ?? new Date().toISOString();
  const dateObj = dateStr instanceof Date ? dateStr : new Date(dateStr);
  
  const amount = normalizeCurrencyValue(t.amount ?? t.valor ?? 0);
  
  // Prioridade Receita Bruta: valor_bruto, gross_value, valor, amount
  const grossValue = normalizeCurrencyValue(
    t.valor_bruto ??
    t.grossAmount ??
    t.gross_value ??
    t.valor ??
    t.amount ??
    0
  );

  // Prioridade Receita Líquida: valor_liquido, net_value, liquid_value, valor_bruto, gross_value, valor, amount
  const netValue = normalizeCurrencyValue(
    t.valor_liquido ??
    t.netAmount ??
    t.net_value ??
    t.liquid_value ??
    t.valor_bruto ??
    t.grossAmount ??
    t.gross_value ??
    t.valor ??
    t.amount ??
    0
  );

  return {
    id: String(t.id),
    app_user_id: t.app_user_id,
    date: dateObj.toISOString().split('T')[0],
    description: t.description ?? t.descricao ?? "Sem descrição",
    customer: t.customer ?? t.cliente ?? t.client ?? "N/A",
    category: t.category ?? t.categoria ?? "Outros",
    amount,
    grossAmount: grossValue,
    netAmount: netValue,
    type: isIncome(t) ? 'income' : 'expense',
    status: (t.status === 'paid' || t.status === 'pago' || t.status === 'Pago') ? 'paid' : 
            (t.status === 'pending' || t.status === 'pendente' || t.status === 'Pendente') ? 'pending' :
            t.status === 'overdue' || t.status === 'atrasado' ? 'overdue' : 'cancelled',
    source: t.source ?? t.origem ?? t.origin ?? "manual",
    metadata: t.metadata ?? {
      placa: t.placa,
      nf: t.nf,
      pagamento: t.pagamento,
      observacao: t.observacao
    }
  };
}

/**
 * Calcula métricas financeiras para um conjunto de transações
 */
export function calculateFinancialMetrics(transactions: any[]) {
  const normalized = transactions.map(normalizeTransaction);
  
  const receitas = normalized.filter(t => t.type === 'income');
  const despesas = normalized.filter(t => t.type === 'expense');

  // Receita Bruta: soma dos valores brutos das receitas
  const receitaBruta = receitas.reduce((sum, t) => sum + t.grossAmount!, 0);

  // Receita Líquida: soma dos valores líquidos das receitas
  const receitaLiquida = receitas.reduce((sum, t) => sum + t.netAmount!, 0);

  // Despesas: soma das despesas do período
  const despesasTotal = despesas.reduce((sum, t) => sum + t.amount, 0);

  // Despesas Pendentes
  const despesasPendentes = despesas
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Saldo Disponível = Receita Líquida - Despesas Total
  const saldoDisponivel = receitaLiquida - despesasTotal;
  
  // Lucro do Mês = Receita Líquida - Despesas Total (conforme regra solicitada)
  const lucroMes = saldoDisponivel;

  return {
    receitaBruta,
    receitaLiquida,
    despesasTotal,
    despesasPendentes,
    saldoDisponivel,
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
