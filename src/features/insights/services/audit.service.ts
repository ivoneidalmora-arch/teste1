import { supabase } from '@/lib/supabase/client';

export interface AuditLogInput {
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
}

// Fallback em memória para o lado do servidor
const serverMemoryLogs: any[] = [];

export const auditService = {
  async log(userId: string, input: AuditLogInput) {
    const payload = {
      app_user_id: userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      old_data: input.oldData || null,
      new_data: input.newData || null,
      ip_address: typeof window !== 'undefined' ? 'client-side' : 'server-side',
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'node-environment',
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Se der erro de tabela ausente (código de erro PG 42P01 ou similar)
        console.warn('[AuditService] Falha ao persistir no Supabase, usando fallback local:', error.message);
        this.saveToFallback(payload);
        return payload;
      }
      return data;
    } catch (err: any) {
      console.warn('[AuditService] Erro desconhecido ao logar no Supabase, usando fallback local:', err);
      this.saveToFallback(payload);
      return payload;
    }
  },

  saveToFallback(log: any) {
    if (typeof window !== 'undefined') {
      try {
        const key = 'alfa_pericia_audit_logs';
        const existing = localStorage.getItem(key);
        const logs = existing ? JSON.parse(existing) : [];
        logs.unshift(log);
        // Limita a 100 logs locais
        localStorage.setItem(key, JSON.stringify(logs.slice(0, 100)));
      } catch (err) {
        console.error('[AuditService] Falha ao salvar no localStorage:', err);
      }
    } else {
      serverMemoryLogs.unshift(log);
      if (serverMemoryLogs.length > 100) {
        serverMemoryLogs.pop();
      }
    }
  },

  async getLogs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('app_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('[AuditService] Falha ao ler do Supabase, buscando do fallback local:', error.message);
        return this.getFallbackLogs();
      }
      return data || [];
    } catch (err) {
      console.warn('[AuditService] Erro ao ler do Supabase, buscando do fallback local:', err);
      return this.getFallbackLogs();
    }
  },

  getFallbackLogs(): any[] {
    if (typeof window !== 'undefined') {
      try {
        const key = 'alfa_pericia_audit_logs';
        const existing = localStorage.getItem(key);
        return existing ? JSON.parse(existing) : [];
      } catch (err) {
        console.error('[AuditService] Falha ao ler do localStorage:', err);
        return [];
      }
    }
    return serverMemoryLogs;
  }
};
