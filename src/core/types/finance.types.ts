export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'pending' | 'paid' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  date: string; // ISO Date YYYY-MM-DD
  grossAmount: number;
  netAmount: number;
  expenseAmount: number;
  category: string;
  customerName?: string;
  plate?: string;
  serviceName?: string;
  paymentMethod?: string;
  status: TransactionStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  grossIncome: number;
  netIncome: number;
  paidExpenses: number;
  pendingExpenses: number;
  totalExpenses: number;
  balance: number;
  profitOrLoss: number;
  averageTicket: number;
}
