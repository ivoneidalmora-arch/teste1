/**
 * Utilitário para manipulação de chaves de data locais no formato YYYY-MM-DD.
 * Evita problemas de fuso horário/UTC tratando datas puramente como strings ou
 * criando objetos Date em horários neutros (meio-dia).
 */

/**
 * Retorna YYYY-MM-DD usando os métodos locais do objeto Date.
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona um dia a uma chave YYYY-MM-DD e retorna uma nova chave YYYY-MM-DD.
 * Implementação segura que evita deslocamento de timezone.
 */
export function addOneDayToDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  // Criamos ao meio-dia para garantir que setDate(+1) não pule o dia por conta de DST ou offsets
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() + 1);
  return toLocalDateKey(date);
}

/**
 * Cria um objeto Date local ao meio-dia a partir de uma chave YYYY-MM-DD.
 */
export function parseDateKeyAsLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Compara uma data com uma chave YYYY-MM-DD.
 */
export function isSameLocalDate(date: Date, dateKey: string): boolean {
  return toLocalDateKey(date) === dateKey;
}
