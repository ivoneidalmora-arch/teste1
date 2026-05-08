import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/actions/auth.actions';
import { googleCalendarService } from '@/features/finance/services/google-calendar.service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get('month');
    const month = monthStr ? new Date(monthStr) : new Date();

    const events = await googleCalendarService.getEvents(session.user.id, month);
    return NextResponse.json(events);
  } catch (error) {
    console.error('[API Calendar Events] Error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
