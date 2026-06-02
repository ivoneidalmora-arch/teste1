"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/features/auth/actions/auth.actions";
import { NewTransaction, Transaction } from "@/core/types/finance";
import { TransactionMapper } from "../mappers/transaction.mapper";
import { normalizePlaca } from "@/features/ai-ocr/utils/normalization";
import { normalizeRevenueName } from "../utils/normalization";
import { auditLogService } from "@/features/audit/services/audit-log.service";

/**
 * Server Action para buscar todas as transações de um usuário de forma segura.
 */
export async function getTransactionsAction() {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;

  let { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('app_user_id', userId)
    .is('deleted_at', null)
    .order('date', { ascending: false });

  // Fallback caso a coluna deleted_at não exista ainda na tabela transactions (erro 42703)
  if (error && error.code === '42703') {
    const fallbackResult = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('app_user_id', userId)
      .order('date', { ascending: false });
    
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) throw error;

  const transactions = (data || []).map(raw => raw.type === 'income' 
    ? TransactionMapper.toIncome(raw) 
    : TransactionMapper.toExpense(raw)
  );

  return transactions;
}

/**
 * Server Action para salvar uma nova transação.
 */
export async function saveTransactionAction(transaction: NewTransaction) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const payload: Record<string, any> = {
    app_user_id: userId,
    type: transaction.type,
    date: transaction.date,
    category: transaction.type === 'income' ? normalizeRevenueName(transaction.category || '') : (transaction.category || ''),
    status: transaction.status || 'paid',
    source: 'system'
  };

  if (transaction.type === 'income') {
    payload.gross_amount = transaction.grossAmount || transaction.amount;
    payload.net_amount = transaction.netAmount || transaction.amount;
    payload.expense_amount = 0;
    payload.customer_name = transaction.customer;
    payload.plate = normalizePlaca((transaction as any).placa ?? transaction.metadata?.placa) || '';
    payload.service_name = payload.category;
    payload.payment_method = transaction.metadata?.pagamento || 'Pix';
  } else {
    payload.gross_amount = 0;
    payload.net_amount = 0;
    payload.expense_amount = transaction.amount;
    payload.payment_method = transaction.metadata?.pagamento || 'Pix';
  }
  
  const { data, error } = await supabaseAdmin.from('transactions').insert([payload]).select().single();
  
  if (error) {
    console.error("[saveTransactionAction] DB Error:", error);
    throw new Error(error.message);
  }
  
  const saved = transaction.type === 'income' 
    ? TransactionMapper.toIncome(data) 
    : TransactionMapper.toExpense(data);

  await auditLogService.log({
    userId,
    action: 'CREATE',
    entityType: transaction.type === 'income' ? 'RECEITA' : 'DESPESA',
    entityId: String(saved.id),
    newValues: payload
  });
  
  return saved;
}

/**
 * Server Action para atualizar uma transação.
 */
export async function updateTransactionAction(id: string | number, type: 'income' | 'expense', transaction: Partial<Transaction>) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const payload: Record<string, any> = {};
  if (transaction.date !== undefined) payload.date = transaction.date;
  if (transaction.category !== undefined) {
    payload.category = type === 'income' ? normalizeRevenueName(transaction.category) : transaction.category;
  }
  
  if (type === 'income') {
    if (transaction.grossAmount !== undefined) payload.gross_amount = transaction.grossAmount;
    if (transaction.netAmount !== undefined) payload.net_amount = transaction.netAmount;
    if ((transaction as any).customer !== undefined) payload.customer_name = (transaction as any).customer;
    if (transaction.metadata?.placa !== undefined) payload.plate = transaction.metadata.placa;
  } else {
    if (transaction.amount !== undefined) payload.expense_amount = transaction.amount;
    if (transaction.status !== undefined) payload.status = transaction.status;
  }
  
  // Buscar valor antigo para o log
  const { data: oldRecord } = await supabaseAdmin.from('transactions').select('*').eq('id', id).single();

  const { error } = await supabaseAdmin.from('transactions').update(payload).eq('id', id).eq('app_user_id', userId);
  if (error) throw error;

  await auditLogService.log({
    userId,
    action: 'UPDATE',
    entityType: type === 'income' ? 'RECEITA' : 'DESPESA',
    entityId: String(id),
    oldValues: oldRecord,
    newValues: payload
  });

  return true;
}

/**
 * Server Action para Soft Delete.
 */
export async function deleteTransactionAction(id: string | number, type: 'income' | 'expense') {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const { data: oldRecord } = await supabaseAdmin.from('transactions').select('*').eq('id', id).single();

  const { error } = await supabaseAdmin
    .from('transactions')
    .update({ 
      deleted_at: new Date().toISOString(),
      deleted_by: userId 
    })
    .eq('id', id)
    .eq('app_user_id', userId);
  
  if (error) throw error;

  await auditLogService.log({
    userId,
    action: 'DELETE',
    entityType: type === 'income' ? 'RECEITA' : 'DESPESA',
    entityId: String(id),
    oldValues: oldRecord
  });

  return true;
}
