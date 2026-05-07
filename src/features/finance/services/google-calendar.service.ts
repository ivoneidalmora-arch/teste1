/**
 * Google Calendar Integration Service
 * Infrastructure for Bi-directional synchronization.
 */

export interface CalendarEvent {
  id: string;
  google_id?: string;
  title: string;
  description?: string;
  start: string; // ISO String
  end: string;   // ISO String
  color?: string;
  source: 'local' | 'google';
}

class GoogleCalendarService {
  private isConnected = false;
  private clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Mock initial events for demonstration
  private mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Vistoria Agendada - ABC-1234',
      start: new Date().toISOString(),
      end: new Date(new Date().getTime() + 3600000).toISOString(),
      source: 'local',
      color: '#2563EB'
    },
    {
      id: '2',
      title: 'Reunião Contabilidade (Google)',
      start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      end: new Date(new Date().setDate(new Date().getDate() + 1) + 3600000).toISOString(),
      source: 'google',
      color: '#059669'
    }
  ];

  async connect() {
    if (!this.clientId) {
      console.warn('Google Client ID not configured. Running in DEMO mode.');
    }
    // Logic for OAuth 2.0 would go here
    this.isConnected = true;
    return true;
  }

  async getEvents(): Promise<CalendarEvent[]> {
    // In a real scenario, this would fetch from both Supabase and Google Calendar
    // and perform a merge/reconciliation based on google_id.
    return this.mockEvents;
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    this.mockEvents.push(newEvent);
    
    if (this.isConnected && this.clientId) {
      // Sync to Google Calendar API
      console.log('Syncing new event to Google Calendar:', newEvent);
    }
    
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEvents[index] = { ...this.mockEvents[index], ...updates };
      
      if (this.isConnected && this.mockEvents[index].google_id) {
        // Sync update to Google
        console.log('Syncing update to Google Calendar:', id);
      }
    }
  }

  async deleteEvent(id: string) {
    const event = this.mockEvents.find(e => e.id === id);
    this.mockEvents = this.mockEvents.filter(e => e.id !== id);
    
    if (this.isConnected && event?.google_id) {
      // Sync deletion to Google
      console.log('Syncing deletion to Google Calendar:', id);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      mode: this.clientId ? 'PROD' : 'DEMO'
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
