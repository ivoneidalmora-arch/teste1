import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function POST(request: Request) {
  try {
    let targetYear: number | undefined;
    try {
      const body = await request.json();
      targetYear = body.year;
    } catch (e) {
      // Ignora se não houver body
    }

    const result = await GoogleCalendarServerService.syncHolidays(targetYear);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Sync Holidays] Error:', error);
    
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    if (error.message === 'DISCONNECTED') {
      return NextResponse.json({ error: 'Google Calendar não conectado' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro interno ao sincronizar feriados' }, { status: 500 });
  }
}
