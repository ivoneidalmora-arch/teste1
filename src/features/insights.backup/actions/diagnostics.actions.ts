"use server";

import { diagnosticGeneratorService } from "../services/diagnostics/diagnostic-generator.service";
import { getSession } from "@/features/auth/actions/auth.actions";
import { PeriodFilter } from "../types/insights.types";

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
