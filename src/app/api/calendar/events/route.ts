import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthStr = searchParams.get('month'); // YYYY-MM

  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return NextResponse.json({ error: 'Mês inválido. Use o formato YYYY-MM.' }, { status: 400 });
  }

  try {
    const events = await GoogleCalendarServerService.getEvents(monthStr);
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('[API Calendar Events] Error:', error);
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 });
  }
}
