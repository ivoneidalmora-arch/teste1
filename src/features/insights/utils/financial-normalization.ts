/**
 * Utilitário central de normalização financeira
 * Resolve inconsistências entre campos antigos e novos das tabelas do Supabase
 */

/**
 * Obtém o valor bruto de uma transação, tratando múltiplas variantes de campos.
 */
export function getGrossAmount(transaction: any): number {
  if (!transaction) return 0;
  
  const val = 
    transaction.grossAmount ??
    transaction.amountBruto ??
    transaction.valor_bruto ??
    transaction.gross_value ??
    transaction.amount ??
    transaction.valor ??
    0;

  return Number(val);
}

/**
 * Obtém o valor líquido de uma transação, tratando múltiplas variantes de campos.
 */
export function getNetAmount(transaction: any): number {
  if (!transaction) return 0;

  const val = 
    transaction.netAmount ??
    transaction.amountLiquido ??
    transaction.valor_liquido ??
    transaction.net_value ??
    transaction.liquid_value ??
    transaction.amountBruto ??
    transaction.valor_bruto ??
    transaction.amount ??
    transaction.valor ??
    0;

  return Number(val);
}

/**
 * Obtém o valor de uma despesa, tratando as variantes específicas de despesas.
 */
export function getExpenseAmount(transaction: any): number {
  if (!transaction) return 0;

  const val = 
    transaction.amount ??
    transaction.valor ??
    transaction.netAmount ??
    transaction.amountLiquido ??
    transaction.valor_liquido ??
    0;

  return Number(val);
}

/**
 * Calcula a margem líquida percentual.
 */
export function calculateNetMargin(gross: number, net: number): number {
  if (gross <= 0) return 0;
  return ((net / gross) * 100);
}

/**
 * Calcula o saldo final (Receita Líquida - Despesas).
 */
export function calculateNetBalance(netRevenue: number, totalExpenses: number): number {
  return netRevenue - totalExpenses;
}
