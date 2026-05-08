import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM

  if (!month) {
    return NextResponse.json({ error: 'Month parameter is required (YYYY-MM)' }, { status: 400 });
  }

  try {
    const events = await GoogleCalendarServerService.getEvents(month);
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('[API Events] Error:', error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'RECONNECT_REQUIRED') {
      return NextResponse.json({ error: 'Reconnect required', code: 'RECONNECT_REQUIRED' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
