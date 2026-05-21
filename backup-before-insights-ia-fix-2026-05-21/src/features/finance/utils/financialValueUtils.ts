/**
 * Converte qualquer valor para número de forma segura.
 * Nunca retorna NaN.
 */
export function parseMoney(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extrai o valor bruto da receita seguindo a prioridade:
 * 1. valorBruto, 2. grossAmount, 3. valor, 4. amount, 5. total
 */
export function getGrossRevenueValue(t: any): number {
  const value = 
    t.valorBruto ?? 
    t.grossAmount ?? 
    t.valor_bruto ?? 
    t.gross_value ?? 
    t.valor ?? 
    t.amount ?? 
    t.total ?? 
    0;
  return parseMoney(value);
}

/**
 * Extrai o valor líquido da receita seguindo a prioridade:
 * 1. receitaLiquida, 2. valorLiquido, 3. netAmount, 4. valor calculado, 5. fallback bruto
 */
export function getNetRevenueValue(t: any): number {
  const value = 
    t.receitaLiquida ?? 
    t.valorLiquido ?? 
    t.netAmount ?? 
    t.valor_liquido ?? 
    t.net_value ?? 
    t.liquid_value;

  if (value !== undefined && value !== null) {
    return parseMoney(value);
  }

  // Fallback para bruto como solicitado
  return getGrossRevenueValue(t);
}

/**
 * Extrai o valor da despesa seguindo a prioridade:
 * 1. valor, 2. amount, 3. total, 4. paidAmount
 */
export function getExpenseValue(e: any): number {
  const value = 
    e.valor ?? 
    e.amount ?? 
    e.total ?? 
    e.paidAmount ?? 
    0;
  return parseMoney(value);
}

/**
 * Identifica se é uma receita.
 */
export function isIncome(t: any): boolean {
  const type = String(t.tipo ?? t.type ?? t.categoria ?? t.category ?? t.transactionType ?? t.origem ?? t.source ?? "").toLowerCase();
  return ["receita", "income", "entrada", "vistoria", "service", "revenue"].includes(type);
}

/**
 * Identifica se é uma despesa.
 */
export function isExpense(t: any): boolean {
  const type = String(t.tipo ?? t.type ?? t.categoria ?? t.category ?? t.transactionType ?? t.origem ?? t.source ?? "").toLowerCase();
  return ["despesa", "expense", "saída", "saida", "custo", "cost"].includes(type);
}

/**
 * Identifica se a despesa está paga.
 */
export function isExpensePaid(e: any): boolean {
  const status = String(e.status ?? "").toLowerCase();
  return ["pago", "paid", "confirmada", "confirmado", "concluida", "concluído", "completed", "liquidada"].includes(status);
}

/**
 * Identifica se a despesa está pendente.
 */
export function isExpensePending(e: any): boolean {
  const status = String(e.status ?? "").toLowerCase();
  return ["pendente", "pending", "aberto", "open", "vencido", "overdue", "aguardando", "waiting"].includes(status);
}

/**
 * Calcula métricas financeiras para um conjunto de transações.
 */
export function calculateDashboardMetrics(items: any[]) {
  let receitaBruta = 0;
  let receitaLiquida = 0;
  let despesasPagas = 0;
  let despesasPendentes = 0;

  items.forEach(item => {
    if (isIncome(item)) {
      receitaBruta += getGrossRevenueValue(item);
      receitaLiquida += getNetRevenueValue(item);
    } else if (isExpense(item)) {
      const val = getExpenseValue(item);
      if (isExpensePaid(item)) {
        despesasPagas += val;
      } else if (isExpensePending(item)) {
        despesasPendentes += val;
      }
    }
  });

  return {
    receitaBruta,
    receitaLiquida,
    despesasPagas,
    despesasPendentes,
    saldoDisponivel: receitaLiquida - despesasPagas,
    totalTransactions: items.length
  };
}
