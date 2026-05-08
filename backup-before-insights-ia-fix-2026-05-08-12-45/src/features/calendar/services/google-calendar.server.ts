import 'server-only';
import { supabaseAdmin } from '@/services/supabase-admin';
import { decrypt, encrypt } from '@/core/utils/encryption';
import { getHolidays } from './holiday.service';
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

    if (error) {
      console.error('[GoogleCalendarServer] Error fetching connection:', error);
      return null;
    }
    return data;
  }

  static async refreshAccessToken(connection: any): Promise<string> {
    if (!connection.refresh_token) {
      console.error('[calendar:refresh-token] Missing refresh_token', { userId: connection.app_user_id });
      throw new Error('MISSING_REFRESH_TOKEN');
    }

    const decryptedRefreshToken = decrypt(connection.refresh_token);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[calendar:refresh-token] Google Config missing in environment');
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
      console.error('[calendar:refresh-token] Google API Error', {
        userId: connection.app_user_id,
        error: data.error,
        description: data.error_description
      });

      if (data.error === 'invalid_grant') {
        await supabaseAdmin
          .from('google_calendar_connections')
          .update({ status: 'reconnect_required', updated_at: new Date().toISOString() })
          .eq('id', connection.id);
        throw new Error('RECONNECT_REQUIRED');
      }
      throw new Error(`REFRESH_FAILED: ${data.error}`);
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

    const connection = await this.getActiveConnection(userId);
    if (connection && (connection.status === 'active' || connection.status === 'synced')) {
      try {
        let token = decrypt(connection.access_token);
        const isExpired = new Date(connection.token_expires_at) <= new Date();

        if (isExpired) {
          token = await this.refreshAccessToken(connection);
        }

        const timeMin = new Date(year, month - 1, 1).toISOString();
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
        console.error('[calendar:get-events] Error fetching Google Events:', err);
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
    if (!userId) {
      return { 
        success: false, 
        code: 'not_authenticated', 
        message: 'Usuário não autenticado.',
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    const connection = await this.getActiveConnection(userId);
    if (!connection) {
      return { 
        success: false, 
        code: 'google_not_connected', 
        message: 'Google Agenda não conectado.',
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    if (connection.status === 'reconnect_required') {
      return { 
        success: false, 
        code: 'reconnect_required', 
        message: 'Reconexão com Google necessária.',
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    // Validar escopo
    const hasEventsScope = connection.scopes?.includes('https://www.googleapis.com/auth/calendar.events');
    if (!hasEventsScope) {
      return { 
        success: false, 
        code: 'invalid_google_scope', 
        message: 'Permissão insuficiente no Google Agenda. Reconecte usando a permissão de eventos.',
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    let token: string;
    try {
      token = decrypt(connection.access_token);
      if (new Date(connection.token_expires_at) <= new Date()) {
        token = await this.refreshAccessToken(connection);
      }
    } catch (err: any) {
      console.error('[calendar:sync-holidays] Auth Error', { userId, error: err.message });
      if (err.message === 'RECONNECT_REQUIRED' || err.message === 'MISSING_REFRESH_TOKEN') {
        return { 
          success: false, 
          code: err.message.toLowerCase() as any, 
          message: 'Falha na autenticação com Google. Reconecte sua conta.',
          created: 0, updated: 0, ignored: 0, errors: [] 
        };
      }
      return { 
        success: false, 
        code: 'unknown_error', 
        message: 'Erro ao renovar acesso ao Google.',
        details: err.message,
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    // Verificar se a tabela existe (testando uma query simples)
    const { error: tableCheckError } = await supabaseAdmin.from('calendar_events').select('id').limit(1);
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.error('[calendar:sync-holidays] Supabase Schema Error', { userId, error: tableCheckError });
      return { 
        success: false, 
        code: 'supabase_schema_error', 
        message: 'Tabela calendar_events não encontrada no Supabase. Rode a migration.',
        created: 0, updated: 0, ignored: 0, errors: [] 
      };
    }

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    if (targetYear && !years.includes(targetYear)) {
      years.push(targetYear);
    }

    const response: SyncHolidaysResponse = {
      success: true,
      message: 'Iniciando sincronização...',
      created: 0,
      updated: 0,
      ignored: 0,
      errors: []
    };

    console.info('[calendar:sync-holidays] Starting sync', { userId, years });

    for (const year of years) {
      const holidays = getHolidays(year);
      
      for (const h of holidays) {
        if (!h.date || !h.holidayKey) continue;

        try {
          // 1. Verificar duplicidade real no Google Calendar
          const query = `privateExtendedProperty=app=alfa-vistoria&privateExtendedProperty=holidayKey=${h.holidayKey}`;
          const searchRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (!searchRes.ok) {
            const errBody = await searchRes.json();
            throw new Error(`Google Search Error: ${errBody.error?.message || searchRes.statusText}`);
          }

          const searchData = await searchRes.json();
          const existingGoogleEvent = searchData.items?.[0];

          if (existingGoogleEvent) {
            if (existingGoogleEvent.summary !== `📍 ${h.title}` || existingGoogleEvent.description !== h.description) {
              const patchRes = await fetch(
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
              if (patchRes.ok) response.updated++;
              else console.warn('[calendar:sync-holidays] Patch failed', { id: existingGoogleEvent.id, status: patchRes.status });
            } else {
              response.ignored++;
            }
            
            await this.upsertLocalEvent(userId, h, existingGoogleEvent.id);
            continue;
          }

          // 2. Criar novo
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
            console.error('[calendar:sync-holidays] Google Create Error', { 
              holiday: h.title, 
              status: createRes.status, 
              error: errData.error 
            });
            throw new Error(errData.error?.message || 'Erro ao criar evento no Google');
          }

          const newEvent = await createRes.json();
          await this.upsertLocalEvent(userId, h, newEvent.id);
          response.created++;

        } catch (err: any) {
          console.error('[calendar:sync-holidays] Item failed', { holiday: h.title, error: err.message });
          response.errors.push({ holidayKey: h.holidayKey, message: err.message, code: 'google_api_error' });
        }
      }
    }

    if (response.errors.length > 0 && response.created === 0 && response.updated === 0) {
      response.success = false;
      response.code = 'google_api_error';
      response.message = 'Falha total ao sincronizar com Google Agenda.';
    } else if (response.errors.length > 0) {
      response.code = 'partial_success';
      response.message = 'Sincronização concluída com alguns erros.';
    } else {
      response.message = 'Sincronização concluída com sucesso.';
    }

    await supabaseAdmin
      .from('google_calendar_connections')
      .update({ last_sync_at: new Date().toISOString(), status: 'active' })
      .eq('app_user_id', userId);

    return response;
  }

  private static async upsertLocalEvent(userId: string, h: CalendarEvent, googleEventId: string) {
    const { error } = await supabaseAdmin
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
    
    if (error) {
      console.error('[calendar:upsert-local] DB Error', { userId, holiday: h.holidayKey, error });
    }
  }

  static async getConnectionStatus(): Promise<GoogleConnectionStatus> {
    const userId = await this.getUserIdFromSession();
    if (!userId) return { connected: false, status: 'error', needs_reconnect: false, message: 'Não autorizado' };

    const conn = await this.getActiveConnection(userId);
    if (!conn) return { connected: false, status: 'disconnected', needs_reconnect: false };
    
    const isExpired = new Date(conn.token_expires_at) <= new Date();
    const needsReconnect = (isExpired && !conn.refresh_token) || conn.status === 'reconnect_required';
    
    // Validar escopo também no status
    const hasEventsScope = conn.scopes?.includes('https://www.googleapis.com/auth/calendar.events');

    return { 
      connected: true, 
      status: conn.status as any, 
      email: conn.google_email,
      last_sync_at: conn.last_sync_at,
      needs_reconnect: needsReconnect || !hasEventsScope,
      message: !hasEventsScope ? 'Permissão insuficiente' : undefined
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
