import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function POST() {
  try {
    const result = await GoogleCalendarServerService.disconnect();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Calendar Disconnect] Error:', error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao desconectar Google Calendar' }, { status: 500 });
  }
}
