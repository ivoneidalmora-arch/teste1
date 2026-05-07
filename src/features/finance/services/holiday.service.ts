import { addDays, format, getYear } from 'date-fns';

export type HolidayType = 'national' | 'state' | 'municipal';

export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
  description?: string;
}

/**
 * Calculations for mobile holidays based on Easter (Pascoa)
 */
function getEasterDate(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(H / 28) * f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterDate(year);

  // --- NATIONAL FIXED ---
  holidays.push({ date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national' });
  holidays.push({ date: `${year}-04-21`, name: 'Tiradentes', type: 'national' });
  holidays.push({ date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'national' });
  holidays.push({ date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' });
  holidays.push({ date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national' });
  holidays.push({ date: `${year}-11-02`, name: 'Finados', type: 'national' });
  holidays.push({ date: `${year}-11-15`, name: 'Proclamação da República', type: 'national' });
  holidays.push({ date: `${year}-11-20`, name: 'Dia da Consciência Negra', type: 'national' }); // Novo feriado nacional
  holidays.push({ date: `${year}-12-25`, name: 'Natal', type: 'national' });

  // --- NATIONAL MOBILE ---
  holidays.push({ date: format(addDays(easter, -47), 'yyyy-MM-dd'), name: 'Carnaval', type: 'national' });
  holidays.push({ date: format(addDays(easter, -2), 'yyyy-MM-dd'), name: 'Sexta-feira Santa', type: 'national' });
  holidays.push({ date: format(addDays(easter, 60), 'yyyy-MM-dd'), name: 'Corpus Christi', type: 'national' });

  // --- STATE (Espírito Santo) ---
  // Nossa Senhora da Penha é na segunda-feira seguinte ao domingo de Páscoa (8 dias após o domingo anterior)
  // Na verdade é o 8º dia após a páscoa (segunda-feira da oitava de páscoa)
  holidays.push({ date: format(addDays(easter, 8), 'yyyy-MM-dd'), name: 'Nossa Senhora da Penha (Estadual-ES)', type: 'state' });

  // --- MUNICIPAL (São Mateus - ES) ---
  holidays.push({ date: `${year}-09-21`, name: 'Dia de São Mateus (Municipal)', type: 'municipal', description: 'Padroeiro e Aniversário da Cidade' });
  holidays.push({ date: `${year}-12-13`, name: 'Santa Luzia (Municipal)', type: 'municipal' });

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
