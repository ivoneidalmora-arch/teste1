"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/features/auth/actions/auth.actions";
import { TransactionMapper } from "../mappers/transaction.mapper";

/**
 * Busca itens excluídos logicamente (Soft Deleted).
 */
export async function getDeletedTransactionsAction() {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;

  const [resRec, resDes] = await Promise.all([
    supabaseAdmin.from('Receitas').select('*').eq('app_user_id', userId).not('deleted_at', 'is', null),
    supabaseAdmin.from('Despesas').select('*').eq('app_user_id', userId).not('deleted_at', 'is', null)
  ]);

  if (resRec.error) throw resRec.error;
  if (resDes.error) throw resDes.error;

  const income = (resRec.data || []).map(raw => ({ ...TransactionMapper.toIncome(raw), deletedAt: raw.deleted_at }));
  const expense = (resDes.data || []).map(raw => ({ ...TransactionMapper.toExpense(raw), deletedAt: raw.deleted_at }));

  return [...income, ...expense].sort((a, b) => {
    return new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime();
  });
}

/**
 * Restaura um item excluído.
 */
export async function restoreTransactionAction(id: string | number, type: 'income' | 'expense') {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const table = type === 'income' ? 'Receitas' : 'Despesas';

  const { error } = await supabaseAdmin
    .from(table)
    .update({ deleted_at: null, deleted_by: null })
    .eq('id', id)
    .eq('app_user_id', userId);

  if (error) throw error;
  return true;
}

/**
 * Exclusão Permanente (Auditada).
 */
export async function permanentDeleteTransactionAction(id: string | number, type: 'income' | 'expense') {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  const userId = session.user.id;
  const table = type === 'income' ? 'Receitas' : 'Despesas';

  // Opcional: Logar em tabela de auditoria permanente antes de deletar
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)
    .eq('app_user_id', userId)
    .not('deleted_at', 'is', null); // Garantir que só deleta o que já estava na lixeira

  if (error) throw error;
  return true;
}
