import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { decrypt } from '@/core/utils/encryption';
import { HolidayLib } from '@/lib/holidays/holiday-sync';
import { GoogleCalendarClient } from '@/lib/google/calendar';
import { GoogleAuthService } from '@/lib/google/auth';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { addOneDayToDateKey } from '../utils/date-key';
import type { CalendarEvent, GoogleConnectionStatus, SyncHolidaysResponse } from '../types/calendar.types';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export class GoogleCalendarServerService {
  private static async getUserIdFromSession(): Promise<string | null> {
    const session = (await cookies()).get('alfa_session')?.value;
    if (!session) return null;
    try {
      const { payload } = await jwtVerify(session, key);
      return (payload.user as any)?.id;
    } catch (err) {
      return null;
    }
  }

  static async getActiveConnection(app_user_id: string) {
    const { data, error } = await supabaseAdmin
      .from('google_calendar_connections')
      .select('*')
      .eq('app_user_id', app_user_id)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  static async ensureValidToken(connection: any): Promise<string> {
    let token = decrypt(connection.access_token);
    const isExpired = new Date(connection.token_expires_at) <= new Date();

    if (isExpired || connection.status === 'reconnect_required') {
      if (!connection.refresh_token) throw new Error('RECONNECT_REQUIRED');
      token = await GoogleAuthService.refreshAccessToken(connection.id, connection.refresh_token, connection.app_user_id);
    }
    return token;
  }

  static async getEvents(monthStr: string): Promise<CalendarEvent[]> {
    const userId = await this.getUserIdFromSession();
    if (!userId) throw new Error('UNAUTHORIZED');

    const [year, month] = monthStr.split('-').map(Number);
    const events: CalendarEvent[] = [];
    
    // Feriados da Lib
    const holidays = HolidayLib.getHolidaysForYear(year);
    holidays.forEach(h => {
      const hMonth = parseInt(h.date.split('-')[1]);
      if (hMonth === month) {
        events.push({
          id: h.holidayKey,
          title: h.title,
          date: h.date,
          allDay: true,
          type: h.type,
          source: 'local',
          visible: true
        });
      }
    });

    const connection = await this.getActiveConnection(userId);
    if (connection && connection.status === 'active') {
      try {
        const token = await this.ensureValidToken(connection);
        const timeMin = new Date(year, month - 1, 1).toISOString();
        const timeMax = new Date(year, month, 1).toISOString();

        const data = await GoogleCalendarClient.listEvents(token, 'primary', {
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime'
        });

        this.processGoogleItems(data.items, events);
      } catch (err) {
        console.error('[GoogleCalendarServer] Error fetching Google Events:', err);
      }
    }

    return events;
  }

  private static processGoogleItems(items: any[], events: CalendarEvent[]) {
    if (!items) return;

    items.forEach((item: any) => {
      const isAllDay = !!item.start.date;
      let dateKey: string;

      if (isAllDay) {
        dateKey = item.start.date;
      } else {
        const dt = new Date(item.start.dateTime);
        dateKey = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(dt);
      }
      
      const isSystemHoliday = item.extendedProperties?.private?.app === 'alfa-vistoria';
      if (isSystemHoliday) return;

      events.push({
        id: item.id,
        title: item.summary || '(Sem título)',
        date: isAllDay ? dateKey : undefined,
        start_at: !isAllDay ? item.start.dateTime : undefined,
        end_at: !isAllDay ? item.end.dateTime : undefined,
        allDay: isAllDay,
        source: 'google',
        type: 'google',
        description: item.description,
        visible: true,
        googleEventId: item.id
      });
    });
  }

  static async syncHolidays(targetYear?: number): Promise<SyncHolidaysResponse> {
    const userId = await this.getUserIdFromSession();
    if (!userId) return { success: false, code: 'not_authenticated', message: 'Não autorizado', created: 0, updated: 0, ignored: 0, errors: [] };

    const connection = await this.getActiveConnection(userId);
    if (!connection) return { success: false, code: 'google_not_connected', message: 'Google não conectado', created: 0, updated: 0, ignored: 0, errors: [] };

    try {
      const token = await this.ensureValidToken(connection);
      const currentYear = targetYear || new Date().getFullYear();
      const holidays = HolidayLib.getHolidaysForYear(currentYear);
      
      const response: SyncHolidaysResponse = { success: true, message: 'Sync iniciado', created: 0, updated: 0, ignored: 0, errors: [] };

      for (const h of holidays) {
        try {
          const query = `privateExtendedProperty=app=alfa-vistoria&privateExtendedProperty=holidayKey=${h.holidayKey}`;
          const searchData = await GoogleCalendarClient.listEvents(token, 'primary', { privateExtendedProperty: `app=alfa-vistoria,holidayKey=${h.holidayKey}` });
          const existing = searchData.items?.[0];

          if (existing) {
            response.ignored++;
            await this.upsertLocalEvent(userId, h, existing.id);
          } else {
            const newEvent = await GoogleCalendarClient.createEvent(token, {
              summary: `📍 ${h.title}`,
              description: h.description || `Feriado ${h.type}`,
              start: { date: h.date },
              end: { date: addOneDayToDateKey(h.date) },
              transparency: 'transparent',
              extendedProperties: {
                private: { app: 'alfa-vistoria', type: 'holiday', holidayKey: h.holidayKey }
              }
            });
            await this.upsertLocalEvent(userId, h, newEvent.id);
            response.created++;
          }
        } catch (itemErr: any) {
          response.errors.push({ holidayKey: h.holidayKey, message: itemErr.message });
        }
      }

      await supabaseAdmin.from('google_calendar_connections').update({ last_sync_at: new Date().toISOString() }).eq('app_user_id', userId);
      return response;
    } catch (err: any) {
      return { success: false, code: 'unknown_error', message: err.message, created: 0, updated: 0, ignored: 0, errors: [] };
    }
  }

  private static async upsertLocalEvent(userId: string, h: any, googleEventId: string) {
    await supabaseAdmin.from('calendar_events').upsert({
      app_user_id: userId,
      title: h.title,
      description: h.description,
      date: h.date,
      all_day: true,
      source: 'google',
      category: h.type,
      holiday_key: h.holidayKey,
      google_event_id: googleEventId,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    }, { onConflict: 'app_user_id, holiday_key' });
  }

  static async getConnectionStatus(): Promise<GoogleConnectionStatus> {
    const userId = await this.getUserIdFromSession();
    if (!userId) return { connected: false, status: 'error', needs_reconnect: false };

    const conn = await this.getActiveConnection(userId);
    if (!conn) return { connected: false, status: 'disconnected', needs_reconnect: false };

    const isExpired = new Date(conn.token_expires_at) <= new Date();
    const needsReconnect = (isExpired && !conn.refresh_token) || conn.status === 'reconnect_required';

    return {
      connected: true,
      status: conn.status as any,
      email: conn.google_email,
      last_sync_at: conn.last_sync_at,
      needs_reconnect: needsReconnect
    };
  }

  static async disconnect() {
    const userId = await this.getUserIdFromSession();
    if (!userId) throw new Error('UNAUTHORIZED');

    await supabaseAdmin
      .from('google_calendar_connections')
      .delete()
      .eq('app_user_id', userId);

    return { success: true };
  }
}
