/**
 * Serviço centralizado para interação direta com a Google Calendar API v3.
 * Focado em chamadas REST brutas e formatação de payloads do Google.
 */

export class GoogleCalendarClient {
  private static BASE_URL = 'https://www.googleapis.com/calendar/v3';

  static async listEvents(token: string, calendarId = 'primary', params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}/calendars/${calendarId}/events?${query}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Google Calendar API Error: ${err.error?.message || res.statusText}`);
    }

    return res.json();
  }

  static async createEvent(token: string, event: any, calendarId = 'primary') {
    const url = `${this.BASE_URL}/calendars/${calendarId}/events`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Google Calendar API Error (Create): ${err.error?.message || res.statusText}`);
    }

    return res.json();
  }

  static async updateEvent(token: string, eventId: string, event: any, calendarId = 'primary') {
    const url = `${this.BASE_URL}/calendars/${calendarId}/events/${eventId}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Google Calendar API Error (Update): ${err.error?.message || res.statusText}`);
    }

    return res.json();
  }

  static async deleteEvent(token: string, eventId: string, calendarId = 'primary') {
    const url = `${this.BASE_URL}/calendars/${calendarId}/events/${eventId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok && res.status !== 404) {
      const err = await res.json();
      throw new Error(`Google Calendar API Error (Delete): ${err.error?.message || res.statusText}`);
    }

    return true;
  }
}
