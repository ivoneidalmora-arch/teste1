import { NextResponse } from 'next/server';
import { HolidayLib } from '@/lib/holidays/holiday-sync';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { year } = await request.json();
    const targetYear = year || new Date().getFullYear();
    
    const holidays = HolidayLib.getHolidaysForYear(targetYear);
    
    // Sincroniza feriados na tabela global (opcional conforme arquitetura solicitada)
    // Se a tabela 'holidays' existir, fazemos o upsert. 
    // Se não, o serviço do calendário já faz o upsert na 'calendar_events'.
    
    // Vamos tentar inserir na 'holidays' para seguir a recomendação de arquitetura
    const { error: tableError } = await supabaseAdmin.from('holidays').select('id').limit(1);
    
    if (!tableError) {
      for (const h of holidays) {
        await supabaseAdmin.from('holidays').upsert({
          title: h.title,
          date: h.date,
          type: h.type,
          scope: h.scope,
          city: h.city,
          state: h.state,
          holiday_key: h.holidayKey,
          year: targetYear
        }, { onConflict: 'holiday_key' });
      }
    }

    return NextResponse.json({ success: true, count: holidays.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
