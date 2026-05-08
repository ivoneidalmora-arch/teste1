import { supabaseAdmin } from '@/services/supabase-admin';
import { decrypt, encrypt } from '@/core/utils/encryption';
import { getHolidays } from '@/features/finance/services/holiday.service';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  source: 'google' | 'holiday' | 'system';
  category?: string;
  color?: string;
}

export class GoogleCalendarServerService {
  private static async getUserIdFromSession() {
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

  static async refreshAccessToken(connection: any) {
    if (!connection.refresh_token) throw new Error('RECONNECT_REQUIRED');

    const decryptedRefreshToken = decrypt(connection.refresh_token);
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.ID_DO_CLIENTE_DO_GOOGLE;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId as string,
        client_secret: clientSecret as string,
        refresh_token: decryptedRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (data.error) {
      if (data.error === 'invalid_grant') {
        // Token revogado no Google
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

  static async getEvents(monthStr: string): Promise<any[]> {
    const userId = await this.getUserIdFromSession();
    if (!userId) throw new Error('UNAUTHORIZED');

    const events: any[] = [];
    
    // 1. Local Holidays (Generate for current month)
    const [year, month] = monthStr.split('-').map(Number);
    const holidays = getHolidays(year);
    
    holidays.forEach(h => {
      const [hYear, hMonth] = h.date.split('-').map(Number);
      if (hMonth === month) {
        events.push({
          ...h,
          visible: true
        });
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

  private static processGoogleItems(items: any[], events: any[]) {
    if (!items) return;

    items.forEach((item: any) => {
      const isAllDay = !!item.start.date;
      let dateKey: string;

      if (isAllDay) {
        dateKey = item.start.date; // Já vem em YYYY-MM-DD
      } else {
        // Para eventos com horário, precisamos extrair a data local correta.
        // O formato do Google é "2026-05-08T22:00:00-03:00" ou "2026-05-09T01:00:00Z"
        // Se houver offset (-03:00), o split('T')[0] funciona. 
        // Se for 'Z', precisamos converter para o fuso de Brasília.
        const dt = new Date(item.start.dateTime);
        // Usamos Intl para garantir o dia correto em São Paulo independente de onde o servidor rode
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
        date: dateKey,
        allDay: isAllDay,
        source: 'google',
        type: 'google',
        description: item.description,
        visible: true
      });
    });
  }

  static async getConnectionStatus() {
    const userId = await this.getUserIdFromSession();
    if (!userId) return { connected: false, status: 'unauthorized' };

    const conn = await this.getActiveConnection(userId);
    if (!conn) return { connected: false, status: 'disconnected' };
    
    const isExpired = new Date(conn.token_expires_at) <= new Date();
    if (isExpired && !conn.refresh_token) {
      return { connected: true, status: 'reconnect_required', email: conn.google_email };
    }
    
    return { 
      connected: true, 
      status: conn.status, 
      email: conn.google_email,
      last_sync_at: conn.last_sync_at
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
