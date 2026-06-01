"use server";

import { diagnosticGeneratorService } from "../services/diagnostics/diagnostic-generator.service";
import { getSession } from "@/features/auth/actions/auth.actions";
import { PeriodFilter } from "../types/insights.types";
import { toUuid } from "../utils/uuid";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Server Action para gerar diagnósticos de forma segura no servidor.
 * Protege contra vazamento de chaves e resolve o erro de ambiente client-side.
 */
export async function generateDiagnosticsAction(period: PeriodFilter) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Sessão não encontrada ou expirada.");

    const userId = session.user.id;
    
    // O service agora roda 100% no servidor quando chamado por esta action
    const result = await diagnosticGeneratorService.generateDiagnostics(userId, period);
    
    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    console.error("[generateDiagnosticsAction] Erro:", error);
    return {
      success: false,
      error: error.message || "Falha interna ao processar inteligência financeira."
    };
  }
}

/**
 * Atualiza o status de um insight (Aprovado, Ignorado, Resolvido)
 */
export async function updateInsightStatusAction(insightId: string, status: string, feedback?: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Sessão não encontrada.");

    const userId = session.user.id;

    // Tentamos salvar no audit_issues como um insight genérico
    const { error } = await supabaseAdmin
      .from('audit_issues')
      .upsert({
        app_user_id: userId,
        transaction_id: toUuid(`insight-${insightId}`), // ID virtual
        issue_type: 'ai_insight',
        status,
        approval_reason: feedback,
        payload: { insightId, updatedAt: new Date().toISOString() }
      }, { onConflict: 'app_user_id,transaction_id,issue_type' });

    if (error) throw error;

    revalidatePath('/insights-ia');
    return { success: true };
  } catch (error: any) {
    console.error("[updateInsightStatusAction] Erro:", error);
    return { success: false, error: error.message };
  }
}
