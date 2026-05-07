export type EventStatus = 'active' | 'completed' | 'cancelled';
export type EventSource = 'site' | 'google';
export type SyncStatus = 'pending' | 'synced' | 'error' | 'conflict' | 'deleted';

export interface CalendarEvent {
  id: string;
  app_user_id: string;
  title: string;
  description?: string;
  start_at: string; // ISO String
  end_at: string;   // ISO String
  all_day: boolean;
  status: EventStatus;
  source: EventSource;
  google_event_id?: string;
  google_calendar_id?: string;
  sync_status: SyncStatus;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // UI related
  category?: 'finance' | 'appointment' | 'pending' | 'reminder' | 'expense' | 'external';
  color?: string;
}

export interface GoogleIntegration {
  id: string;
  app_user_id: string;
  google_account_email: string;
  access_token: string; // Encrypted
  refresh_token: string; // Encrypted
  token_expires_at: string;
  calendar_id: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarSyncLog {
  id: string;
  app_user_id: string;
  calendar_event_id?: string;
  google_event_id?: string;
  action: 'create' | 'update' | 'delete' | 'sync';
  direction: 'site_to_google' | 'google_to_site';
  status: 'success' | 'error';
  error_message?: string;
  payload?: any;
  created_at: string;
}
