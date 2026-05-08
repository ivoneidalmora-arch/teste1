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

  static async getEvents(monthStr: string): Promise<CalendarEvent[]> {
    const userId = await this.getUserIdFromSession();
    if (!userId) throw new Error('UNAUTHORIZED');

    const events: CalendarEvent[] = [];
    
    // 1. Local Holidays
    const [year, month] = monthStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, 1);
    const holidays = getHolidays(year);
    
    holidays.forEach(h => {
      // Filter holidays for the requested month
      const hDate = new Date(h.date);
      if (hDate.getMonth() === month - 1) {
        events.push({
          id: `h-${h.date}-${h.name}`,
          title: h.name,
          description: h.description,
          start_at: h.date,
          end_at: h.date,
          all_day: true,
          source: 'holiday',
          color: h.type === 'municipal' ? '#f59e0b' : h.type === 'state' ? '#ec4899' : '#ef4444'
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
        const timeMax = new Date(year, month, 1).toISOString(); // Próximo mês 00:00:00

        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 401) {
          // Token expirou entre a checagem e a chamada ou é inválido
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
      events.push({
        id: item.id,
        title: item.summary || '(Sem título)',
        description: item.description,
        start_at: item.start.dateTime || item.start.date,
        end_at: item.end.dateTime || item.end.date,
        all_day: !!item.start.date,
        source: 'google',
        color: '#2563eb'
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
