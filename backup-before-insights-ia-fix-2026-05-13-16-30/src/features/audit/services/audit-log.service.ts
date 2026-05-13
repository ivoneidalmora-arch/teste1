import { supabaseAdmin } from "@/lib/supabase/server";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'IMPORT' | 'LOGIN';
export type AuditEntity = 'RECEITA' | 'DESPESA' | 'DUPLICIDADE' | 'CALENDARIO';

export const auditLogService = {
  async log(payload: {
    userId: string;
    action: AuditAction;
    entityType: AuditEntity;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    status?: 'SUCCESS' | 'ERROR';
    errorMessage?: string;
  }) {
    try {
      const { error } = await supabaseAdmin.from('audit_logs').insert([{
        app_user_id: payload.userId,
        action: payload.action,
        entity_type: payload.entityType,
        entity_id: payload.entityId,
        old_values: payload.oldValues,
        new_values: payload.newValues,
        status: payload.status || 'SUCCESS',
        error_message: payload.errorMessage
      }]);
      
      if (error) {
        console.error("[AuditLogService] Error saving log:", error);
      }
    } catch (e) {
      console.error("[AuditLogService] Fatal error:", e);
    }
  }
};
