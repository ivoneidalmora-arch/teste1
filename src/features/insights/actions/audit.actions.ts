"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { AuditStatus } from "../types/diagnostics.types";
import { revalidatePath } from "next/cache";

export async function updateAuditIssueAction(
  userId: string, 
  transactionId: string, 
  issueType: string, 
  status: AuditStatus, 
  payload: any = {}
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_issues')
      .upsert({
        app_user_id: userId,
        transaction_id: transactionId,
        issue_type: issueType,
        status,
        updated_at: new Date().toISOString(),
        ...payload
      }, { onConflict: 'app_user_id,transaction_id,issue_type' })
      .select()
      .single();

    if (error) {
      console.error("[updateAuditIssueAction] DB Error:", error);
      return { error: `Erro no Banco: ${error.message}` };
    }

    revalidatePath('/insights-ia');
    return { success: true, data };
  } catch (err: any) {
    console.error("[updateAuditIssueAction] Critical Error:", err);
    return { error: `Erro Crítico: ${err.message || "Erro interno"}` };
  }
}

export async function getAuditIssuesAction(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_issues')
      .select('*')
      .eq('app_user_id', userId);

    if (error) {
      console.error("[getAuditIssuesAction] Error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[getAuditIssuesAction] Critical Error:", err);
    return [];
  }
}
