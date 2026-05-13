"use server";

import { inconsistencyService } from "../services/diagnostics/inconsistency.service";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function getInconsistencyGroupsAction() {
  return await inconsistencyService.getInconsistencyGroups();
}

export async function getAuditIssuesAction(userId: string) {
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
  try {
    const { error } = await supabaseAdmin
      .from('audit_issues')
      .upsert({
        app_user_id: userId,
        transaction_id: transactionId,
        issue_type: issueType,
        status,
        ...details
      }, { onConflict: 'transaction_id, issue_type' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
