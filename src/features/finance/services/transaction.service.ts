import { Transaction, NewTransaction } from '@/core/types/finance';
import { 
  getTransactionsAction, 
  saveTransactionAction, 
  updateTransactionAction, 
  deleteTransactionAction 
} from '../actions/transaction.actions';

export const transactionService = {
  async getAll(app_user_id: string): Promise<Transaction[]> {
    return await getTransactionsAction();
  },

  async save(transaction: NewTransaction, app_user_id: string): Promise<Transaction | null> {
    return await saveTransactionAction(transaction);
  },

  async update(id: string | number, type: 'income' | 'expense', transaction: Partial<Transaction>, app_user_id: string): Promise<boolean> {
    return await updateTransactionAction(id, type, transaction);
  },

  async delete(id: string | number, type: 'income' | 'expense', app_user_id: string): Promise<boolean> {
    return await deleteTransactionAction(id, type);
  },

  async deleteAll(app_user_id: string): Promise<boolean> {
    // Bloqueado em produção conforme Requisito 1
    if (process.env.NODE_ENV === 'production') {
      throw new Error("A exclusão em massa está desabilitada em ambiente de produção para sua segurança.");
    }
    // Para dev, poderíamos implementar, mas o foco é segurança.
    return false;
  },

  async bulkInsert(transactions: NewTransaction[], app_user_id: string): Promise<boolean> {
    // Para simplificar agora, fazemos saves individuais ou poderíamos criar uma bulkInsertAction
    for (const t of transactions) {
      await saveTransactionAction(t);
    }
    return true;
  }
};
