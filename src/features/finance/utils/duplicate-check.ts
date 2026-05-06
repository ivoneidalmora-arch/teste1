import { Transaction } from '@/core/types/finance';

/**
 * Normaliza o texto para comparação: minúsculo, sem acentos e espaços extras.
 */
export function normalizeText(value: string | undefined | null) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Normaliza placa: maiúsculo e sem espaços.
 */
export function normalizePlate(value: string | undefined | null) {
  if (!value) return "";
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Calcula a diferença em dias entre duas datas.
 */
export function daysBetween(date1: Date, date2: Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Zera as horas para comparar apenas os dias
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se um lançamento é uma possível duplicata de algum existente.
 */
export function checkDuplicateLaunch(
  newLaunch: { placa: string; categoria: string; data: string; id?: string | number },
  existingTransactions: Transaction[]
): Transaction | null {
  const normalizedNewPlate = normalizePlate(newLaunch.placa);
  const normalizedNewService = normalizeText(newLaunch.categoria);
  const newDate = new Date(newLaunch.data + 'T12:00:00');

  if (!normalizedNewPlate || !normalizedNewService || isNaN(newDate.getTime())) {
    return null;
  }

  for (const t of existingTransactions) {
    // Se for edição, não comparar com o próprio registro
    if (newLaunch.id && String(t.id) === String(newLaunch.id)) continue;

    const existingPlate = normalizePlate(t.metadata?.placa || (t as any).placa);
    const existingService = normalizeText(t.category);
    const existingDate = new Date(t.date + 'T12:00:00');

    if (!existingPlate || !existingService || isNaN(existingDate.getTime())) continue;

    const samePlate = existingPlate === normalizedNewPlate;
    const sameService = existingService === normalizedNewService;
    const diffDays = daysBetween(newDate, existingDate);

    if (samePlate && sameService && diffDays < 30) {
      return t;
    }
  }

  return null;
}
