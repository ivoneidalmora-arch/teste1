import { NextResponse } from 'next/server';
import { GoogleCalendarServerService } from '@/features/calendar/services/google-calendar.server';

export async function GET() {
  try {
    const status = await GoogleCalendarServerService.getConnectionStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('[API Calendar Status] Error:', error);
    return NextResponse.json(
      { connected: false, status: 'error', message: 'Erro ao verificar status da conexão' },
      { status: 500 }
    );
  }
}
