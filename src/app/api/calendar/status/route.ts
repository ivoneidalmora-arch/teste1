import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/actions/auth.actions';
import { googleCalendarService } from '@/features/finance/services/google-calendar.service';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const status = await googleCalendarService.getConnectionStatus(session.user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[API Calendar Status] Error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
