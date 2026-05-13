import { toLocalDateKey } from "@/features/calendar/utils/date-key";
import { getHolidays as getHolidaysBase } from "@/features/calendar/services/holiday.service";

export type HolidayType = 'national' | 'state' | 'municipal' | 'optional';
export type HolidayScope = 'BR' | 'ES' | 'SAO_MATEUS_ES';

export interface HolidayRecord {
  title: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
  scope: HolidayScope;
  city?: string;
  state?: string;
  description?: string | null;
  holidayKey: string;
}

export class HolidayLib {
  /**
   * Retorna a lista unificada de feriados para um determinado ano.
   * Centraliza as regras de feriados móveis e locais.
   */
  static getHolidaysForYear(year: number): HolidayRecord[] {
    const rawHolidays = getHolidaysBase(year);
    
    return rawHolidays.map(h => ({
      title: h.title,
      date: h.date!,
      type: h.type as HolidayType,
      scope: this.inferScope(h.type as string),
      city: h.type === 'municipal' ? 'São Mateus' : undefined,
      state: (h.type === 'state' || h.type === 'municipal') ? 'ES' : undefined,
      description: h.description,
      holidayKey: h.holidayKey!
    }));
  }

  private static inferScope(type: string): HolidayScope {
    if (type === 'national') return 'BR';
    if (type === 'state') return 'ES';
    return 'SAO_MATEUS_ES';
  }

  /**
   * Verifica se uma data específica é um feriado.
   */
  static isHoliday(date: Date | string): HolidayRecord | null {
    const dateKey = typeof date === 'string' ? date : toLocalDateKey(date);
    const [year] = dateKey.split('-').map(Number);
    const holidays = this.getHolidaysForYear(year);
    
    return holidays.find(h => h.date === dateKey) || null;
  }
}
