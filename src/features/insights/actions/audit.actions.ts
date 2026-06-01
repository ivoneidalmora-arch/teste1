"use server";

import { inconsistencyService } from "../services/diagnostics/inconsistency.service";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/features/auth/actions/auth.actions";
import { InconsistencyRecord, InconsistencyGroup } from "../types/diagnostics.types";
import { toUuid, fromUuid, isValidUUID } from "../utils/uuid";

export async function getInconsistencyGroupsAction() {
  const session = await getSession();
  if (!session?.user?.id) {
    return [];
  }

  const userId = session.user.id;

  const { data: revenues } = await supabaseAdmin
    .from('Receitas')
    .select('*')
    .eq('app_user_id', userId)
    .is('deleted_at', null);

  const { data: expenses } = await supabaseAdmin
    .from('Despesas')
    .select('*')
    .eq('app_user_id', userId)
    .is('deleted_at', null);

  const { data: issues } = await supabaseAdmin
    .from('audit_issues')
    .select('*')
    .eq('app_user_id', userId);

  const mappedIssues = (issues || []).map(issue => ({
    ...issue,
    transaction_id: fromUuid(issue.transaction_id)
  }));

  const result = inconsistencyService.analyze({
    rawRevenues: revenues || [],
    rawExpenses: expenses || [],
    auditIssues: mappedIssues,
    period: { type: 'all' }
  });

  const groups: Record<string, InconsistencyRecord[]> = {};
  result.records.forEach(r => {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  });

  return Object.entries(groups).map(([type, items]) => ({
    id: type,
    title: items[0].description,
    description: items[0].details,
    severity: items[0].severity,
    items: items.map(i => ({
      id: i.id,
      transactionId: i.transactionId,
      transactionType: i.transactionType,
      date: i.date,
      description: i.description,
      value: i.value,
      details: i.details,
      severity: i.severity,
      status: i.status,
      type: i.type
    }))
  })) as InconsistencyGroup[];
}

export async function getAuditIssuesAction(userId: string) {
  const session = await getSession();
  if (!session?.user?.id || session.user.id !== userId) {
    return [];
  }

  const { data } = await supabaseAdmin
    .from('audit_issues')
    .select('*')
    .eq('app_user_id', userId);
  
  return (data || []).map(issue => ({
    ...issue,
    transaction_id: fromUuid(issue.transaction_id)
  }));
}

export async function updateAuditIssueAction(
  userId: string,
  transactionId: string,
  issueType: string,
  status: string,
  details: any,
  transactionType: string = 'income'
) {
  const session = await getSession();
  if (!session?.user?.id || session.user.id !== userId) {
    return { error: 'Sessão expirada ou acesso negado.' };
  }

  const uuidId = toUuid(transactionId);

  // Adicionando logs temporários antes da chamada ao Supabase
  const payload = {
    app_user_id: userId,
    transaction_id: uuidId,
    issue_type: issueType,
    transaction_type: transactionType,
    status,
    ...details
  };
  console.log("Dados enviados para aprovação:", payload);
  console.log("ID da inconsistência:", transactionId);
  console.log("Tipo do ID:", typeof transactionId);

  // Validação de UUID
  if (!isValidUUID(uuidId)) {
    throw new Error(`ID da inconsistência inválido. Esperado UUID, recebido: ${uuidId}`);
  }

  try {
    const { error } = await supabaseAdmin
      .from('audit_issues')
      .upsert(payload, { onConflict: 'app_user_id,transaction_id,issue_type' });

    if (error) {
      console.error("[updateAuditIssueAction] Supabase Error:", error);
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Erro ao atualizar status de auditoria.' };
  }
}
