import { addDays, format } from 'date-fns';

export type HolidayType = 'national' | 'state' | 'municipal' | 'optional';

export interface Holiday {
  id: string;
  title: string;
  date: string; // Formato estrito YYYY-MM-DD (Local)
  type: HolidayType;
  allDay: boolean;
  source: 'local' | 'google';
  description?: string;
}

/**
 * Retorna a chave YYYY-MM-DD para um objeto Date usando o tempo local do navegador,
 * evitando qualquer conversão para UTC.
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Algoritmo de Butcher-Meuss para calcular o Domingo de Páscoa
 */
function getEasterDate(year: number): Date {
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
  
  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easter = getEasterDate(year);

  const addHoliday = (dateStr: string, title: string, type: HolidayType, desc?: string) => {
    holidays.push({
      id: `${dateStr}-${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      date: dateStr,
      type,
      allDay: true,
      source: 'local',
      description: desc
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
  addHoliday(`${year}-11-20`, 'Dia da Consciência Negra', 'national');
  addHoliday(`${year}-12-25`, 'Natal', 'national');

  // --- NACIONAIS MÓVEIS ---
  // Carnaval: Segunda (-48), Terça (-47)
  addHoliday(toLocalDateKey(addDays(easter, -48)), 'Carnaval (Segunda)', 'optional');
  addHoliday(toLocalDateKey(addDays(easter, -47)), 'Carnaval (Terça)', 'optional');
  addHoliday(toLocalDateKey(addDays(easter, -46)), 'Quarta-feira de Cinzas', 'optional', 'Ponto Facultativo até 14h');
  
  // Paixão de Cristo: Sexta-feira (-2)
  addHoliday(toLocalDateKey(addDays(easter, -2)), 'Sexta-feira Santa', 'national', 'Paixão de Cristo');
  
  // Páscoa (Domingo) - Embora não seja feriado oficial em lei (é domingo), incluímos como celebração
  addHoliday(toLocalDateKey(easter), 'Páscoa', 'optional');

  // Corpus Christi: (+60)
  addHoliday(toLocalDateKey(addDays(easter, 60)), 'Corpus Christi', 'national');

  // --- ESTADUAL (Espírito Santo) ---
  // Nossa Senhora da Penha: Segunda-feira, 8 dias após a Páscoa
  addHoliday(toLocalDateKey(addDays(easter, 8)), 'Nossa Senhora da Penha', 'state', 'Feriado Estadual ES');

  // --- MUNICIPAIS (São Mateus - ES) ---
  addHoliday(`${year}-09-21`, 'Emancipação de São Mateus', 'municipal', 'Aniversário da Cidade');
  addHoliday(`${year}-12-27`, 'Dia de São Benedito', 'municipal', 'Padroeiro da Cidade');
  // Ponto Facultativo Municipal
  addHoliday(`${year}-10-28`, 'Dia do Servidor Público', 'optional', 'Ponto Facultativo Municipal');

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
