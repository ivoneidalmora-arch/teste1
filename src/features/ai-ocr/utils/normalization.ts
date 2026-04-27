/**
 * Utilitários de normalização para o Mapper Central
 */

/**
 * Normaliza a placa: remove espaços, traços e converte para UPPERCASE.
 */
export const normalizePlaca = (placa: string): string => {
  if (!placa) return '';
  return placa.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * Converte data para formato ISO (YYYY-MM-DD).
 * Suporta formatos: DD/MM/YYYY, YYYY-MM-DD, e objetos Date.
 */
export const normalizeDate = (date: any): string => {
  if (!date) return new Date().toISOString().split('T')[0];

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  const dateStr = String(date).trim();

  // Caso DD/MM/YYYY
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    if (d && m && y) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // Caso YYYY-MM-DD
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  // Fallback para Date.parse
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {}

  return new Date().toISOString().split('T')[0];
};

/**
 * Capitaliza nomes (ex: "ivone idalmora" -> "Ivone Idalmora")
 */
export const capitalizeName = (name: string): string => {
  if (!name) return 'DESCONHECIDO';
  return name
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Padroniza o status para termos específicos.
 */
export const standardizeStatus = (status: string): 'APROVADO' | 'REPROVADO' | 'PENDENTE' => {
  if (!status) return 'APROVADO';
  const s = status.toUpperCase();
  if (s.includes('APROVADO') || s.includes('OK') || s.includes('SUCESSO')) return 'APROVADO';
  if (s.includes('REPROVADO') || s.includes('FALHA') || s.includes('ERRO')) return 'REPROVADO';
  return 'PENDENTE';
};
