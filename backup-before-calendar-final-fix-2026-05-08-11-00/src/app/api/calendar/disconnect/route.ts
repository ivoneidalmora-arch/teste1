import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function POST() {
  try {
    const result = await GoogleCalendarServerService.disconnect();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Disconnect] Error:', error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
