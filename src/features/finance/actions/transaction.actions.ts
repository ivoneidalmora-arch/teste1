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

  const [resRec, resDes] = await Promise.all([
    supabaseAdmin.from('Receitas').select('*').eq('app_user_id', userId).is('deleted_at', null),
    supabaseAdmin.from('Despesas').select('*').eq('app_user_id', userId).is('deleted_at', null)
  ]);

  if (resRec.error) throw resRec.error;
  if (resDes.error) throw resDes.error;

  const income = (resRec.data || []).map(raw => TransactionMapper.toIncome(raw));
  const expense = (resDes.data || []).map(raw => TransactionMapper.toExpense(raw));

  return [...income, ...expense].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return String(b.id).localeCompare(String(a.id));
  });
}

/**
 * Server Action para salvar uma nova transação.
 */
export async function saveTransactionAction(transaction: NewTransaction) {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const table = transaction.type === 'income' ? 'Receitas' : 'Despesas';
  
  const payload: Record<string, any> = {
    app_user_id: userId,
    amount: transaction.amount,
    date: transaction.date,
    category: transaction.type === 'income' ? normalizeRevenueName(transaction.category || '') : (transaction.category || ''),
  };

  if (transaction.type === 'income') {
    payload.amountBruto = transaction.grossAmount || transaction.amount;
    payload.amountLiquido = transaction.netAmount || transaction.amount;
    payload.cliente = transaction.customer;
    payload.placa = normalizePlaca((transaction as any).placa ?? transaction.metadata?.placa) || '';
    payload.nf = transaction.metadata?.nf;
    payload.pagamento = transaction.metadata?.pagamento;
    payload.observacao = transaction.metadata?.observacao;
  } else {
    payload.description = transaction.description;
    payload.vencimento = transaction.dueDate || transaction.date;
    payload.status = transaction.status === 'paid' ? 'Pago' : 'Pendente';
    payload.observacao = transaction.metadata?.observacao;
  }
  
  const { data, error } = await supabaseAdmin.from(table).insert([payload]).select().single();
  
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
  const table = type === 'income' ? 'Receitas' : 'Despesas';
  
  const payload: Record<string, any> = {};
  if (transaction.amount !== undefined) payload.amount = transaction.amount;
  if (transaction.date !== undefined) payload.date = transaction.date;
  if (transaction.category !== undefined) {
    payload.category = type === 'income' ? normalizeRevenueName(transaction.category) : transaction.category;
  }
  
  if (type === 'income') {
    if (transaction.grossAmount !== undefined) payload.amountBruto = transaction.grossAmount;
    if (transaction.netAmount !== undefined) payload.amountLiquido = transaction.netAmount;
    if (transaction.customer !== undefined) payload.cliente = transaction.customer;
    if (transaction.metadata?.placa !== undefined) payload.placa = transaction.metadata.placa;
  } else {
    if (transaction.description !== undefined) payload.description = transaction.description;
    if (transaction.status !== undefined) payload.status = transaction.status === 'paid' ? 'Pago' : 'Pendente';
    if (transaction.dueDate !== undefined) payload.vencimento = transaction.dueDate;
  }
  
  // Buscar valor antigo para o log
  const { data: oldRecord } = await supabaseAdmin.from(table).select('*').eq('id', id).single();

  const { error } = await supabaseAdmin.from(table).update(payload).eq('id', id).eq('app_user_id', userId);
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
  const table = type === 'income' ? 'Receitas' : 'Despesas';
  
  // Buscar valor antigo para o log
  const { data: oldRecord } = await supabaseAdmin.from(table).select('*').eq('id', id).single();

  const { error } = await supabaseAdmin
    .from(table)
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
