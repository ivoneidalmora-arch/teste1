import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function GET() {
  try {
    const status = await GoogleCalendarServerService.getConnectionStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('[API Status] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
