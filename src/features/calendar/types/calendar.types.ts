export type CalendarEventSource = 'local' | 'google';
export type CalendarEventType = 'national' | 'state' | 'municipal' | 'optional' | 'google';
export type SyncStatus = 'pending' | 'synced' | 'error' | 'reconnect_required';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date?: string; // Formato YYYY-MM-DD para eventos all-day
  start_at?: string; // ISO String para eventos com horário
  end_at?: string;   // ISO String para eventos com horário
  allDay: boolean;
  source: CalendarEventSource;
  type?: CalendarEventType;
  category?: string;
  holidayKey?: string;
  googleEventId?: string;
  visible?: boolean; // Controle de UI
}

export interface GoogleConnectionStatus {
  connected: boolean;
  status: 'disconnected' | 'active' | 'reconnect_required' | 'error';
  email?: string;
  last_sync_at?: string | null;
  needs_reconnect: boolean;
  message?: string;
}

export interface SyncHolidaysResponse {
  success: boolean;
  code?: 
    | "not_authenticated"
    | "google_not_connected"
    | "reconnect_required"
    | "missing_refresh_token"
    | "invalid_google_scope"
    | "supabase_schema_error"
    | "google_api_error"
    | "partial_success"
    | "unknown_error";
  message: string;
  details?: string;
  created: number;
  updated: number;
  ignored: number;
  errors: Array<{ 
    holidayKey?: string; 
    message: string;
    code?: string;
  }>;
}
