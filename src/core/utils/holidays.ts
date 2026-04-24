import { addDays, format, isSaturday, isSunday, startOfDay } from 'date-fns';

/**
 * Calcula o Domingo de Páscoa usando o algoritmo de Meeus/Jones/Butcher.
 */
function getEaster(year: number): Date {
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
  
  // Usar Meio-dia para evitar problemas de fuso horário na conversão
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Retorna um mapa de feriados para o ano especificado.
 */
export function getHolidays(year: number): Record<string, string> {
  const easter = getEaster(year);
  
  const holidays: Record<string, string> = {
    // Feriados Fixos - Nacionais
    [`${year}-01-01`]: "Confraternização Universal",
    [`${year}-04-21`]: "Tiradentes",
    [`${year}-05-01`]: "Dia do Trabalho",
    [`${year}-09-07`]: "Independência do Brasil",
    [`${year}-10-12`]: "Nossa Senhora Aparecida",
    [`${year}-11-02`]: "Finados",
    [`${year}-11-15`]: "Proclamação da República",
    [`${year}-11-20`]: "Dia da Consciência Negra",
    [`${year}-12-25`]: "Natal",
    
    // Feriados Fixos - Municipais (São Mateus)
    [`${year}-09-21`]: "Emancipação de São Mateus",
    [`${year}-12-27`]: "Dia de São Benedito",
    
    // Feriados Móveis
    [format(addDays(easter, -2), 'yyyy-MM-dd')]: "Paixão de Cristo",
    [format(addDays(easter, 8), 'yyyy-MM-dd')]: "Nossa Senhora da Penha (ES)",
    [format(addDays(easter, 60), 'yyyy-MM-dd')]: "Corpus Christi",
  };

  return holidays;
}

/**
 * Verifica se uma data é feriado e retorna o nome, ou null.
 */
export function isHoliday(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getHolidays(year);
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays[dateStr] || null;
}

/**
 * Ajusta a data para o próximo dia útil (ignora feriados e finais de semana).
 */
export function adjustToNextBusinessDay(date: Date): Date {
  let current = startOfDay(date);
  // Se a hora for zero, às vezes o fuso horário joga pro dia anterior se não tomar cuidado
  // Mas o startOfDay do date-fns é robusto.
  
  let loopCount = 0;
  while ((isSaturday(current) || isSunday(current) || isHoliday(current)) && loopCount < 30) {
    current = addDays(current, 1);
    loopCount++;
  }
  return current;
}
