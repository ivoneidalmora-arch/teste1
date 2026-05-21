"use server";

import { inconsistencyService } from "../services/diagnostics/inconsistency.service";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/features/auth/actions/auth.actions";
import { InconsistencyRecord, InconsistencyGroup } from "../types/diagnostics.types";

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

  const result = inconsistencyService.analyze({
    rawRevenues: revenues || [],
    rawExpenses: expenses || [],
    auditIssues: issues || [],
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
  return data || [];
}

export async function updateAuditIssueAction(
  userId: string,
  transactionId: string,
  issueType: string,
  status: string,
  details: any
) {
  const session = await getSession();
  if (!session?.user?.id || session.user.id !== userId) {
    return { error: 'Sessão expirada ou acesso negado.' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('audit_issues')
      .upsert({
        app_user_id: userId,
        transaction_id: transactionId,
        issue_type: issueType,
        status,
        ...details
      }, { onConflict: 'app_user_id,transaction_id,issue_type' });

    if (error) {
      console.error("[updateAuditIssueAction] Supabase Error:", error);
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Erro ao atualizar status de auditoria.' };
  }
}
