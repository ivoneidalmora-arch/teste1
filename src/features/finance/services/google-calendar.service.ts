import { supabaseAdmin } from '@/services/supabase-admin';
import { decrypt, encrypt } from '@/core/utils/encryption';
import { getHolidays, Holiday } from './holiday.service';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  source: 'google' | 'holiday' | 'system';
  type?: 'national' | 'state' | 'municipal';
  color?: string;
}

class GoogleCalendarService {
  private async getActiveConnection(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('google_calendar_connections')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching connection:', error);
      return null;
    }
    return data;
  }

  private async refreshAccessToken(connection: any) {
    if (!connection.refresh_token) throw new Error('No refresh token available');

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
    if (data.error) throw new Error(`Refresh failed: ${data.error}`);

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

  async getEvents(userId: string, month: Date): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    
    // 1. Get Holidays
    const year = month.getFullYear();
    const holidays = getHolidays(year);
    holidays.forEach(h => {
      events.push({
        id: `h-${h.date}-${h.name}`,
        title: h.name,
        description: h.description,
        start: h.date,
        end: h.date,
        source: 'holiday',
        type: h.type,
        color: h.type === 'municipal' ? '#f59e0b' : h.type === 'state' ? '#ec4899' : '#ef4444'
      });
    });

    // 2. Get Google Events
    const connection = await this.getActiveConnection(userId);
    if (connection && connection.status === 'active') {
      try {
        let token = decrypt(connection.access_token);
        const isExpired = new Date(connection.token_expires_at) <= new Date();

        if (isExpired) {
          token = await this.refreshAccessToken(connection);
        }

        const timeMin = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
        const timeMax = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();

        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (data.items) {
          data.items.forEach((item: any) => {
            events.push({
              id: item.id,
              title: item.summary,
              description: item.description,
              start: item.start.dateTime || item.start.date,
              end: item.end.dateTime || item.end.date,
              source: 'google',
              color: '#2563eb'
            });
          });
        }
      } catch (err) {
        console.error('Error fetching Google Events:', err);
      }
    }

    return events;
  }

  async getConnectionStatus(userId: string) {
    const conn = await this.getActiveConnection(userId);
    if (!conn) return { connected: false, status: 'disconnected' };
    
    const isExpired = new Date(conn.token_expires_at) <= new Date();
    if (isExpired && !conn.refresh_token) return { connected: true, status: 'reconnect_required', email: conn.google_email };
    
    return { connected: true, status: conn.status, email: conn.google_email };
  }
}

export const googleCalendarService = new GoogleCalendarService();

