import { describe, it, expect } from 'vitest';
import { getHolidays, getEasterDate } from './holiday.service';

describe('HolidayService', () => {
  it('should calculate correct holidays for 2026', () => {
    const holidays = getHolidays(2026);
    const holidayDates = holidays.map(h => h.date);

    // Páscoa: 2026-04-05 (Domingo)
    expect(getEasterDate(2026).getFullYear()).toBe(2026);
    
    // Nacionais Fixos
    expect(holidayDates).toContain('2026-01-01');
    expect(holidayDates).toContain('2026-04-21'); // Tiradentes
    expect(holidayDates).toContain('2026-05-01');
    expect(holidayDates).toContain('2026-09-07');
    expect(holidayDates).toContain('2026-10-12');
    expect(holidayDates).toContain('2026-11-02');
    expect(holidayDates).toContain('2026-11-15');
    expect(holidayDates).toContain('2026-11-20');
    expect(holidayDates).toContain('2026-12-25');

    // Móveis 2026
    expect(holidayDates).toContain('2026-04-03'); // Paixão de Cristo (Easter - 2)
    expect(holidayDates).toContain('2026-06-04'); // Corpus Christi (Easter + 60)
    
    // Estadual ES 2026
    expect(holidayDates).toContain('2026-04-13'); // N. Sra. da Penha (Easter + 8)

    // Municipais São Mateus 2026
    expect(holidayDates).toContain('2026-09-21'); // Emancipação
    expect(holidayDates).toContain('2026-12-27'); // São Benedito
  });

  it('should not shift dates due to timezone (exact string match)', () => {
    const year = 2026;
    const holidays = getHolidays(year);
    
    const tiradentes = holidays.find(h => h.title === 'Tiradentes');
    expect(tiradentes?.date).toBe('2026-04-21');
    
    const natal = holidays.find(h => h.title === 'Natal');
    expect(natal?.date).toBe('2026-12-25');
  });

  it('should have unique holidayKeys', () => {
    const holidays = getHolidays(2026);
    const keys = holidays.map(h => h.holidayKey);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});
