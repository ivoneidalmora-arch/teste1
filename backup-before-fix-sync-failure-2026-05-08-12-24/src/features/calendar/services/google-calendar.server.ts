import 'server-only';
import { supabaseAdmin } from '@/services/supabase-admin';
import { decrypt, encrypt } from '@/core/utils/encryption';
import { getHolidays } from './holiday.service';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { addOneDayToDateKey, toLocalDateKey } from '../utils/date-key';
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

    if (error) {
      console.error('[GoogleCalendarServer] Error fetching connection:', error);
      return null;
    }
    return data;
  }

  static async refreshAccessToken(connection: any): Promise<string> {
    if (!connection.refresh_token) throw new Error('RECONNECT_REQUIRED');

    const decryptedRefreshToken = decrypt(connection.refresh_token);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_CONFIG_MISSING');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: decryptedRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (data.error) {
      if (data.error === 'invalid_grant') {
        await supabaseAdmin
          .from('google_calendar_connections')
          .update({ status: 'reconnect_required', updated_at: new Date().toISOString() })
          .eq('id', connection.id);
        throw new Error('RECONNECT_REQUIRED');
      }
      throw new Error(`Refresh failed: ${data.error}`);
    }

    const encryptedAccessToken = encrypt(data.access_token);
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    await supabaseAdmin
      .from('google_calendar_connections')
      .update({
        access_token: encryptedAccessToken,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    return data.access_token;
  }

  static async getEvents(monthStr: string): Promise<CalendarEvent[]> {
    const userId = await this.getUserIdFromSession();
    if (!userId) throw new Error('UNAUTHORIZED');

    const events: CalendarEvent[] = [];
    
    // 1. Local Holidays (Generate for the specific year of monthStr)
    const [year, month] = monthStr.split('-').map(Number);
    const holidays = getHolidays(year);
    
    holidays.forEach(h => {
      if (h.date) {
        const [hYear, hMonth] = h.date.split('-').map(Number);
        if (hMonth === month) {
          events.push({ ...h, visible: true });
        }
      }
    });

    // 2. Google Events
    const connection = await this.getActiveConnection(userId);
    if (connection && connection.status === 'active') {
      try {
        let token = decrypt(connection.access_token);
        const isExpired = new Date(connection.token_expires_at) <= new Date();

        if (isExpired) {
          token = await this.refreshAccessToken(connection);
        }

        const timeMin = new Date(year, month - 1, 1).toISOString();
        // Primeiro dia do próximo mês
        const timeMax = new Date(year, month, 1).toISOString();

        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401) {
          token = await this.refreshAccessToken(connection);
          const retryRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await retryRes.json();
          this.processGoogleItems(data.items, events);
        } else {
          const data = await res.json();
          this.processGoogleItems(data.items, events);
        }
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
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(dt);
      }
      
      const isSystemHoliday = item.extendedProperties?.private?.app === 'alfa-vistoria' && 
                             item.extendedProperties?.private?.type === 'holiday';
      
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
    if (!userId) throw new Error('UNAUTHORIZED');

    const connection = await this.getActiveConnection(userId);
    if (!connection || connection.status !== 'active') {
      throw new Error('DISCONNECTED');
    }

    let token = decrypt(connection.access_token);
    if (new Date(connection.token_expires_at) <= new Date()) {
      token = await this.refreshAccessToken(connection);
    }

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    if (targetYear && !years.includes(targetYear)) {
      years.push(targetYear);
    }

    const response: SyncHolidaysResponse = {
      success: true,
      created: 0,
      updated: 0,
      ignored: 0,
      errors: []
    };

    for (const year of years) {
      const holidays = getHolidays(year);
      
      for (const h of holidays) {
        if (!h.date || !h.holidayKey) continue;

        try {
          // 1. Verificar duplicidade real no Google Calendar usando privateExtendedProperty
          const query = `privateExtendedProperty=app=alfa-vistoria&privateExtendedProperty=holidayKey=${h.holidayKey}`;
          const searchRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const searchData = await searchRes.json();
          const existingGoogleEvent = searchData.items?.[0];

          if (existingGoogleEvent) {
            // Se já existe no Google, verificamos se o nome ou descrição mudou
            if (existingGoogleEvent.summary !== `📍 ${h.title}` || existingGoogleEvent.description !== h.description) {
              await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingGoogleEvent.id}`,
                {
                  method: 'PATCH',
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    summary: `📍 ${h.title}`,
                    description: h.description
                  })
                }
              );
              response.updated++;
            } else {
              response.ignored++;
            }
            
            // Garantir que está no banco local
            await this.upsertLocalEvent(userId, h, existingGoogleEvent.id);
            continue;
          }

          // 2. Não existe no Google, criar novo
          const endDate = addOneDayToDateKey(h.date);
          const createRes = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                summary: `📍 ${h.title}`,
                description: h.description || `Feriado ${h.type}`,
                start: { date: h.date },
                end: { date: endDate },
                transparency: 'transparent',
                extendedProperties: {
                  private: {
                    app: 'alfa-vistoria',
                    type: 'holiday',
                    holidayKey: h.holidayKey
                  }
                }
              })
            }
          );

          if (!createRes.ok) {
            const errData = await createRes.json();
            throw new Error(errData.error?.message || 'Erro ao criar evento no Google');
          }

          const newEvent = await createRes.json();
          await this.upsertLocalEvent(userId, h, newEvent.id);
          response.created++;

        } catch (err: any) {
          response.errors.push({ holidayKey: h.holidayKey, message: err.message });
        }
      }
    }

    await supabaseAdmin
      .from('google_calendar_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('app_user_id', userId);

    return response;
  }

  private static async upsertLocalEvent(userId: string, h: CalendarEvent, googleEventId: string) {
    await supabaseAdmin
      .from('calendar_events')
      .upsert({
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
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'app_user_id, holiday_key' });
  }

  static async getConnectionStatus(): Promise<GoogleConnectionStatus> {
    const userId = await this.getUserIdFromSession();
    if (!userId) return { connected: false, status: 'error', needs_reconnect: false, message: 'Não autorizado' };

    const conn = await this.getActiveConnection(userId);
    if (!conn) return { connected: false, status: 'disconnected', needs_reconnect: false };
    
    const isExpired = new Date(conn.token_expires_at) <= new Date();
    const needsReconnect = isExpired && !conn.refresh_token;
    
    return { 
      connected: true, 
      status: conn.status as any, 
      email: conn.google_email,
      last_sync_at: conn.last_sync_at,
      needs_reconnect: needsReconnect || conn.status === 'reconnect_required'
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
