export type TransactionType = 'income' | 'expense';
export type ExpenseStatus = 'Pago' | 'Pendente';

export interface TransactionBase {
  id: string | number;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO string format usually YYYY-MM-DD
  observacao?: string;
  createdAt?: string; // Metadata from Supabase or generated locally
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
