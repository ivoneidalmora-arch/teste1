import { Transaction as StandardTransaction, NewTransaction as StandardNewTransaction } from '../schemas/transaction.schema';

export type TransactionType = 'income' | 'expense';
export type ExpenseStatus = 'Pago' | 'Pendente' | 'paid' | 'pending' | 'overdue';

/**
 * @deprecated Use Transaction from @/core/schemas/transaction.schema instead.
 * Mantido temporariamente para compatibilidade durante a refatoração.
 */
export interface TransactionBase {
  id: string | number;
  app_user_id?: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // Formato YYYY-MM-DD
  description?: string;
  observacao?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  source?: string;
  metadata?: any;
}

export interface IncomeTransaction extends TransactionBase {
  type: 'income';
  description?: string;
  placa?: string;
  cliente?: string;
  nf?: string;
  pagamento?: string;
  amountBruto?: number;
  amountLiquido?: number;
  grossAmount?: number;
  netAmount?: number;
  customer?: string;
}

export interface ExpenseTransaction extends TransactionBase {
  type: 'expense';
  description?: string;
  vencimento?: string;
  status?: ExpenseStatus;
  grossAmount?: number;
  netAmount?: number;
  dueDate?: string;
}

export type Transaction = IncomeTransaction | ExpenseTransaction;
export type NewTransaction = Partial<Transaction>;

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
  currentPendingExpense: number;
  cashFlowData: any[];
  topClients: any[];
  categoryDistribution: any[];
  calendarEvents: any[];
}
