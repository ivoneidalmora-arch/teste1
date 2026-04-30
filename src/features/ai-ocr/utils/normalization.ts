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
  if (!date) return '';

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  let dateStr = String(date).trim();

  // Caso YYYY-MM-DD (ISO) - CHECAR ANTES DE QUALQUER MUDANÇA
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  if (dateStr.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
    return dateStr.replace(/\//g, '-');
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  // Se não é ISO, tenta normalizar separadores para processar DD/MM/YYYY
  dateStr = dateStr.replace(/[\.\-]/g, '/');

  // Caso DD/MM/YYYY ou DD/MM/YY ou DD/MM
  if (dateStr.includes('/')) {
    let parts = dateStr.split('/');
    
    // Se a primeira parte tem 4 dígitos, provavelmente é YYYY/MM/DD (invertido mas com barra)
    if (parts[0].length === 4) {
      const [y, m, d] = parts;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    let [d, m, y] = parts;
    
    // Se não tem ano, assume o ano atual
    if (!y || y.length === 0) {
      y = String(currentYear);
    } 
    // Se o ano tem apenas 2 dígitos (ex: 25)
    else if (y.length === 2) {
      y = '20' + y;
    }

    if (d && m && y) {
      const day = parseInt(d);
      const month = parseInt(m);
      const year = parseInt(y);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // Fallback para Date.parse
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {}

  return '';
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
