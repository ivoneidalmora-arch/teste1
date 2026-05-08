import { getHolidays as getHolidaysV2 } from '@/features/calendar/services/holiday.service';
import { isSaturday, isSunday, startOfDay, addDays } from 'date-fns';

/**
 * Wrapper de compatibilidade para o novo serviço de feriados.
 * Mantém a interface antiga mas consome a lógica unificada.
 */

export function getHolidays(year: number): Record<string, string> {
  const holidays = getHolidaysV2(year);
  const map: Record<string, string> = {};
  
  holidays.forEach(h => {
    if (h.date) {
      map[h.date] = h.title;
    }
  });

  return map;
}

export function isHoliday(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getHolidays(year);
  // Usar formatação manual para evitar problemas de timezone se date-fns format não for usado com cuidado
  const yearStr = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
  
  return holidays[dateStr] || null;
}

export function adjustToNextBusinessDay(date: Date): Date {
  let current = startOfDay(date);
  
  let loopCount = 0;
  while ((isSaturday(current) || isSunday(current) || isHoliday(current)) && loopCount < 30) {
    current = addDays(current, 1);
    loopCount++;
  }
  return current;
}
