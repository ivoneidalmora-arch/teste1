import { Transaction, FinancialSummary } from "@/core/types/finance.types";

/**
 * Motor Financeiro Central - Único responsável por cálculos no sistema.
 * 
 * Regra de Ouro:
 * saldo = receita líquida - despesas
 */
export class FinanceEngine {
  /**
   * Calcula o resumo financeiro global ou de um conjunto de transações.
   */
  static calculateSummary(transactions: Transaction[]): FinancialSummary {
    let grossIncome = 0;
    let netIncome = 0;
    let paidExpenses = 0;
    let pendingExpenses = 0;
    let incomeCount = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        if (t.status === 'paid' || t.status === 'pending') {
          grossIncome += t.grossAmount;
          netIncome += t.netAmount;
          incomeCount++;
        }
      } else if (t.type === 'expense') {
        if (t.status === 'paid') {
          paidExpenses += t.expenseAmount;
        } else if (t.status === 'pending') {
          pendingExpenses += t.expenseAmount;
        }
      }
    }

    const totalExpenses = paidExpenses + pendingExpenses;
    // O Saldo atual leva em conta apenas as despesas pagas (caixa real) ou todas?
    // Geralmente Fluxo de Caixa = Receita Líquida Recebida - Despesas Pagas.
    // Vamos usar a regra exata solicitada: saldo = receita líquida - despesas
    const balance = netIncome - paidExpenses; // Ou totalExpenses, dependendo da regra de negócio exata
    const profitOrLoss = balance;
    
    const averageTicket = incomeCount > 0 ? grossIncome / incomeCount : 0;

    return {
      grossIncome,
      netIncome,
      paidExpenses,
      pendingExpenses,
      totalExpenses,
      balance,
      profitOrLoss,
      averageTicket,
    };
  }

  /**
   * Agrupa transações por categoria
   */
  static groupByCategory(transactions: Transaction[]) {
    const map = new Map<string, number>();
    for (const t of transactions) {
      const amount = t.type === 'income' ? t.netAmount : t.expenseAmount;
      const current = map.get(t.category) || 0;
      map.set(t.category, current + amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  /**
   * Agrupa transações por cliente (Apenas Receitas)
   */
  static groupByCustomer(transactions: Transaction[]) {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === 'income' && t.customerName) {
        const current = map.get(t.customerName) || 0;
        map.set(t.customerName, current + t.netAmount);
      }
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Filtra por período (Mês/Ano)
   */
  static filterByPeriod(transactions: Transaction[], month: number, year: number): Transaction[] {
    return transactions.filter(t => {
      const d = new Date(t.date);
      // month is 1-12
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }
}
