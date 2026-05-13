import { toLocalDateKey, parseDateKeyAsLocalDate } from '../utils/date-key';
import type { CalendarEvent, CalendarEventType } from '../types/calendar.types';

/**
 * Serviço oficial de feriados do sistema.
 * Unifica feriados Nacionais, Estaduais (ES) e Municipais (São Mateus-ES).
 */

/**
 * Algoritmo de Butcher-Meuss para calcular o Domingo de Páscoa.
 */
export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  // Retorna ao meio-dia local para evitar problemas de timezone
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Adiciona dias a uma data de forma segura.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getHolidays(year: number): CalendarEvent[] {
  const holidays: CalendarEvent[] = [];
  const easter = getEasterDate(year);

  const addHoliday = (dateStr: string, title: string, type: CalendarEventType, description?: string) => {
    // A holidayKey deve ser única por feriado no ano para evitar duplicidade no Google
    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    const holidayKey = `${dateStr}-${slug}`;

    holidays.push({
      id: holidayKey,
      title,
      date: dateStr,
      type,
      allDay: true,
      source: 'local',
      description: description || null,
      holidayKey,
      visible: true
    });
  };

  // --- NACIONAIS FIXOS ---
  addHoliday(`${year}-01-01`, 'Confraternização Universal', 'national');
  addHoliday(`${year}-04-21`, 'Tiradentes', 'national');
  addHoliday(`${year}-05-01`, 'Dia do Trabalho', 'national');
  addHoliday(`${year}-09-07`, 'Independência do Brasil', 'national');
  addHoliday(`${year}-10-12`, 'Nossa Senhora Aparecida', 'national');
  addHoliday(`${year}-11-02`, 'Finados', 'national');
  addHoliday(`${year}-11-15`, 'Proclamação da República', 'national');
  addHoliday(`${year}-11-20`, 'Consciência Negra', 'national');
  addHoliday(`${year}-12-25`, 'Natal', 'national');

  // --- NACIONAIS MÓVEIS ---
  addHoliday(toLocalDateKey(addDays(easter, -48)), 'Carnaval (Segunda)', 'optional');
  addHoliday(toLocalDateKey(addDays(easter, -47)), 'Carnaval (Terça)', 'optional');
  addHoliday(toLocalDateKey(addDays(easter, -46)), 'Quarta-feira de Cinzas', 'optional');
  addHoliday(toLocalDateKey(addDays(easter, -2)), 'Paixão de Cristo', 'national', 'Sexta-feira Santa');
  addHoliday(toLocalDateKey(addDays(easter, 60)), 'Corpus Christi', 'national');

  // --- ESTADUAL (Espírito Santo) ---
  // Nossa Senhora da Penha: segunda-feira, 8 dias após o Domingo de Páscoa
  addHoliday(toLocalDateKey(addDays(easter, 8)), 'Nossa Senhora da Penha', 'state', 'Feriado Estadual ES');

  // --- MUNICIPAIS (São Mateus - ES) ---
  addHoliday(`${year}-09-21`, 'Emancipação Política de São Mateus', 'municipal');
  addHoliday(`${year}-12-27`, 'Dia de São Benedito', 'municipal');
  
  // Ponto Facultativo Municipal
  addHoliday(`${year}-10-28`, 'Dia do Servidor Público Municipal', 'optional');

  return holidays.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}
