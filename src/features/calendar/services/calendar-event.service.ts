import { supabase } from '@/services/supabase';
import { CalendarEvent, EventStatus, SyncStatus } from '../types/calendar.types';

export const calendarEventService = {
  async getAll(userId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('app_user_id', userId)
      .is('deleted_at', null)
      .gte('start_at', start.toISOString())
      .lte('end_at', end.toISOString());

    if (error) throw error;
    return data || [];
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        ...event,
        sync_status: 'pending' as SyncStatus,
        status: 'active' as EventStatus,
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
        sync_status: 'deleted' as SyncStatus,
      })
      .eq('id', id);

    if (error) throw error;
  }
};
