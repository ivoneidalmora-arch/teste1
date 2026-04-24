export type TransactionType = 'income' | 'expense';
export type ExpenseStatus = 'Pago' | 'Pendente';

export interface TransactionBase {
  id: string | number;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // Formato YYYY-MM-DD
  observacao?: string;
  createdAt?: string;
}

export interface IncomeTransaction extends TransactionBase {
  type: 'income';
  placa?: string;
  cliente?: string;
  nf?: string;
  pagamento?: string;
  amountBruto?: number;
  amountLiquido?: number;
}

export interface ExpenseTransaction extends TransactionBase {
  type: 'expense';
  description?: string;
  vencimento?: string;
  status?: ExpenseStatus;
}

export type Transaction = IncomeTransaction | ExpenseTransaction;

// Tipos para Agregações e Dashboards
export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalGlobalBalance: number;
  currentIncome: number;
  incomeVariation: number;
  currentExpense: number;
  expenseVariation: number;
  currentBalance: number;
  balanceVariation: number;
  ticketMedio: number;
  availableMonths: string[];
}
