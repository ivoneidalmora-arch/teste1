import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';
import { supabaseAdmin } from '@/services/supabase-admin';
import { decrypt } from '@/core/utils/encryption';
import { getHolidays } from '@/features/finance/services/holiday.service';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export async function POST() {
  const session = (await cookies()).get('alfa_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(session, key);
    const userId = (payload.user as any).id;

    const connection = await GoogleCalendarServerService.getActiveConnection(userId);
    if (!connection || connection.status !== 'active') {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    let token = decrypt(connection.access_token);
    const isExpired = new Date(connection.token_expires_at) <= new Date();
    if (isExpired) {
      token = await GoogleCalendarServerService.refreshAccessToken(connection);
    }

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];
    let created = 0;
    let ignored = 0;
    let errors = 0;

    for (const year of years) {
      const holidays = getHolidays(year);
      
      for (const h of holidays) {
        const holidayKey = `${h.date}-${h.title.toLowerCase().replace(/\s+/g, '-')}`;
        
        // 1. Check local DB first
        const { data: existingEvent } = await supabaseAdmin
          .from('calendar_events')
          .select('id, google_event_id')
          .eq('app_user_id', userId)
          .eq('google_event_id', holidayKey)
          .maybeSingle();

        if (existingEvent) {
          ignored++;
          continue;
        }

        // 2. Double check Google Calendar for idempotency (search by private property)
        // We could use a specific query if the API supports it, or just list.
        // For simplicity and performance, we rely on our 'extendedProperties' mapping.
        
        const nextDay = new Date(h.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const endDateStr = nextDay.toISOString().split('T')[0];

        try {
          const googleRes = await fetch(
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
                end: { date: endDateStr },
                transparency: 'transparent',
                extendedProperties: {
                  private: {
                    app: 'alfa-vistoria',
                    type: 'holiday',
                    holidayKey: holidayKey
                  }
                }
              })
            }
          );

          if (!googleRes.ok) {
             const err = await googleRes.json();
             console.error('Google API Error:', err);
             errors++;
             continue;
          }
          
          // 3. Save in local database
          await supabaseAdmin
            .from('calendar_events')
            .insert({
              app_user_id: userId,
              title: h.title,
              description: h.description,
              start_at: h.date,
              end_at: h.date,
              all_day: true,
              source: 'holiday',
              category: h.type,
              google_event_id: holidayKey,
              sync_status: 'synced',
              last_synced_at: new Date().toISOString()
            });

          created++;
        } catch (err) {
          console.error(`Error syncing holiday ${h.title}:`, err);
          errors++;
        }
      }
    }

    // Update last sync at
    await supabaseAdmin
      .from('google_calendar_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('app_user_id', userId);

    return NextResponse.json({ 
      success: true, 
      summary: { created, ignored, errors } 
    });

  } catch (error: any) {
    console.error('[API Sync Holidays] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
