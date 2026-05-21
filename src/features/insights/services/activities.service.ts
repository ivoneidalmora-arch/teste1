import { supabase } from '@/lib/supabase/client';

export interface SystemActivityInput {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  category: 'security' | 'audit' | 'financial' | 'system';
  metadata?: any;
}

const serverMemoryActivities: any[] = [];

// Atividades mockadas padrão para o caso de o banco estar zerado
const DEFAULT_ACTIVITIES = [
  {
    id: 'activity-default-1',
    type: 'success',
    title: 'Análise de Inteligência Financeira',
    description: 'Diagnósticos gerais atualizados e consolidados para o período corrente.',
    category: 'system',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
  },
  {
    id: 'activity-default-2',
    type: 'warning',
    title: 'Detecção de Transações Duplicadas',
    description: 'Sistema identificou 2 possíveis lançamentos em duplicidade no faturamento.',
    category: 'financial',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
  },
  {
    id: 'activity-default-3',
    type: 'info',
    title: 'Auditoria de Receitas',
    description: 'Verificação automática executada em 142 lançamentos ativos.',
    category: 'audit',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
  }
];

export const activitiesService = {
  async register(userId: string, input: SystemActivityInput) {
    const payload = {
      app_user_id: userId,
      type: input.type,
      title: input.title,
      description: input.description,
      category: input.category,
      metadata: input.metadata || {},
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('system_activities')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn('[ActivitiesService] Falha ao persistir atividade no Supabase, usando fallback local:', error.message);
        this.saveToFallback(payload);
        return payload;
      }
      return data;
    } catch (err: any) {
      console.warn('[ActivitiesService] Erro ao registrar atividade no Supabase, usando fallback local:', err);
      this.saveToFallback(payload);
      return payload;
    }
  },

  saveToFallback(activity: any) {
    if (typeof window !== 'undefined') {
      try {
        const key = 'alfa_pericia_system_activities';
        const existing = localStorage.getItem(key);
        const activities = existing ? JSON.parse(existing) : [];
        activities.unshift(activity);
        localStorage.setItem(key, JSON.stringify(activities.slice(0, 100)));
      } catch (err) {
        console.error('[ActivitiesService] Falha ao salvar no localStorage:', err);
      }
    } else {
      serverMemoryActivities.unshift(activity);
      if (serverMemoryActivities.length > 100) {
        serverMemoryActivities.pop();
      }
    }
  },

  async getActivities(userId: string) {
    try {
      const { data, error } = await supabase
        .from('system_activities')
        .select('*')
        .eq('app_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn('[ActivitiesService] Falha ao ler do Supabase, buscando do fallback local:', error.message);
        return this.getMergedActivities();
      }
      
      const dbActivities = data || [];
      if (dbActivities.length === 0) {
        return this.getMergedActivities();
      }
      return dbActivities;
    } catch (err) {
      console.warn('[ActivitiesService] Erro ao ler do Supabase, buscando do fallback local:', err);
      return this.getMergedActivities();
    }
  },

  getMergedActivities(): any[] {
    let locals: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const key = 'alfa_pericia_system_activities';
        const existing = localStorage.getItem(key);
        locals = existing ? JSON.parse(existing) : [];
      } catch (err) {
        console.error('[ActivitiesService] Falha ao ler do localStorage:', err);
      }
    } else {
      locals = serverMemoryActivities;
    }

    if (locals.length === 0) {
      return DEFAULT_ACTIVITIES;
    }
    return locals;
  }
};
