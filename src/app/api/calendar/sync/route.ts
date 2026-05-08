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
    
    if (!result.success) {
      // Se tivermos um código de erro mapeado, podemos ajustar o status HTTP
      const statusMap: Record<string, number> = {
        'not_authenticated': 401,
        'google_not_connected': 400,
        'reconnect_required': 403,
        'missing_refresh_token': 403,
        'invalid_google_scope': 403,
        'supabase_schema_error': 500,
        'google_api_error': 502,
        'unknown_error': 500
      };
      
      const status = result.code ? statusMap[result.code] || 500 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Sync Holidays] Fatal Error:', error);
    
    return NextResponse.json({ 
      success: false,
      code: 'unknown_error',
      message: 'Erro interno inesperado ao sincronizar feriados.',
      details: error.message,
      created: 0, updated: 0, ignored: 0, errors: []
    }, { status: 500 });
  }
}
