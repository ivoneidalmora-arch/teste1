import { Transaction } from '@/core/types/finance';
import { normalizeCurrencyValue } from '@/lib/financial-rules';
import { formatBRL } from '@/core/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Helpers para categorização e filtragem
 */
export const isIncome = (t: any): boolean => {
  const type = String(t.type ?? t.tipo ?? "").toLowerCase();
  return ["receita", "income", "entrada", "revenue"].includes(type);
};

export const isExpense = (t: any): boolean => {
  const type = String(t.type ?? t.tipo ?? "").toLowerCase();
  return ["despesa", "expense", "saida", "saída", "outcome"].includes(type);
};

/**
 * Agrupa transações por cliente e retorna os TOP 5
 */
export function getTopClients(transactions: Transaction[]) {
  const clientsMap = new Map<string, { name: string; total: number; count: number }>();

  transactions
    .filter(isIncome)
    .forEach((transaction: any) => {
      const clientName = (
        transaction.cliente ??
        transaction.client ??
        transaction.customer ??
        transaction.nome_cliente ??
        "Cliente não informado"
      ).toString().toUpperCase().trim();

      const value = normalizeCurrencyValue(
        transaction.valor_bruto ??
        transaction.grossAmount ??
        transaction.gross_value ??
        transaction.amountBruto ??
        transaction.valor_liquido ??
        transaction.netAmount ??
        transaction.net_value ??
        transaction.liquid_value ??
        transaction.amountLiquido ??
        transaction.valor ??
        transaction.amount ??
        0
      );

      const current = clientsMap.get(clientName) ?? {
        name: clientName,
        total: 0,
        count: 0,
      };

      current.total += value;
      current.count += 1;

      clientsMap.set(clientName, current);
    });

  const totalRevenue = Array.from(clientsMap.values()).reduce((sum, c) => sum + c.total, 0);

  const sortedClients = Array.from(clientsMap.values()).sort((a, b) => b.total - a.total);
  
  // Pegar os top 4
  const topClients = sortedClients.slice(0, 4);
  
  // Somar o resto em 'Outros'
  const others = sortedClients.slice(4);
  if (others.length > 0) {
    const othersTotal = others.reduce((sum, c) => sum + c.total, 0);
    const othersCount = others.reduce((sum, c) => sum + c.count, 0);
    topClients.push({
      name: 'Outros Clientes',
      total: othersTotal,
      count: othersCount
    });
  }

  return topClients.map(c => ({
      ...c,
      percentage: totalRevenue > 0 ? (c.total / totalRevenue) * 100 : 0
  }));
}

/**
 * Agrupa despesas por categoria
 */
export function getExpensesByCategory(transactions: Transaction[]) {
  const expenses = transactions.filter(isExpense);

  const total = expenses.reduce((sum, item: any) => {
    return sum + normalizeCurrencyValue(
      item.valor ??
      item.amount ??
      item.valor_bruto ??
      item.amountBruto ??
      0
    );
  }, 0);

  const categoryMap = new Map<string, number>();

  expenses.forEach((transaction: any) => {
    const category =
      transaction.categoria ??
      transaction.category ??
      transaction.tipo_despesa ??
      "Sem categoria";

    const value = normalizeCurrencyValue(
      transaction.valor ??
      transaction.amount ??
      transaction.valor_bruto ??
      transaction.amountBruto ??
      0
    );

    categoryMap.set(category, (categoryMap.get(category) ?? 0) + value);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    total,
    categories,
  };
}

/**
 * Retorna eventos financeiros (pendências e previsões)
 */
export function getFinancialCalendarEvents(transactions: Transaction[]) {
  return transactions
    .filter((transaction: any) => {
      const status = String(transaction.status ?? "").toLowerCase();

      return [
        "pendente",
        "pending",
        "aberto",
        "open",
        "previsto",
        "scheduled"
      ].includes(status);
    })
    .map((transaction: any) => ({
      id: String(transaction.id),
      title:
        transaction.descricao ??
        transaction.description ??
        transaction.categoria ??
        transaction.category ??
        "Evento financeiro",
      date:
        transaction.data_vencimento ??
        transaction.due_date ??
        transaction.vencimento ??
        transaction.data ??
        transaction.date,
      value: normalizeCurrencyValue(
        transaction.valor ??
        transaction.amount ??
        transaction.valor_bruto ??
        transaction.amountBruto ??
        0
      ),
      type: (transaction.tipo ?? transaction.type) === 'income' ? 'income' : 'expense' as 'income' | 'expense',
      status: transaction.status,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

/**
 * Utilitários de formatação
 */
export const formatCurrency = (value: number) => formatBRL(value);

export const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
    return format(d, "dd 'de' MMMM", { locale: ptBR });
};
