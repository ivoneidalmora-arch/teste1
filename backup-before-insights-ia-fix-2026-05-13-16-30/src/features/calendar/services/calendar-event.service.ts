import { supabase } from '@/lib/supabase/client';
import type { CalendarEvent, SyncStatus } from '../types/calendar.types';

/**
 * Serviço de gerenciamento de eventos do calendário (Client-side).
 * Nota: Sincronização Google é tratada exclusivamente pelo GoogleCalendarServerService.
 */
export const calendarEventService = {
  async getAll(userId: string, start: string, end: string): Promise<CalendarEvent[]> {
    // Busca eventos locais criados pelo usuário ou sincronizados
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('app_user_id', userId)
      .is('deleted_at', null)
      .or(`date.gte.${start},start_at.gte.${start}`)
      .or(`date.lte.${end},end_at.lte.${end}`);

    if (error) throw error;
    return data || [];
  },

  async create(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        ...event,
        sync_status: 'pending' as SyncStatus,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        sync_status: 'pending' as SyncStatus,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        deleted_at: new Date().toISOString(),
        sync_status: 'pending' as SyncStatus,
      })
      .eq('id', id);

    if (error) throw error;
  }
};
