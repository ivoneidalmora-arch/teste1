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

  const today = new Date();
  const currentYear = today.getFullYear();
  let dateStr = String(date).trim();

  // Remove caracteres invisíveis e normaliza separadores
  dateStr = dateStr.replace(/[\.\-]/g, '/');

  // Caso DD/MM/YYYY ou DD/MM/YY ou DD/MM
  if (dateStr.includes('/')) {
    let [d, m, y] = dateStr.split('/');
    
    // Se não tem ano, assume o ano atual
    if (!y || y.length === 0) {
      y = String(currentYear);
    } 
    // Se o ano tem apenas 2 dígitos (ex: 25)
    else if (y.length === 2) {
      y = '20' + y;
    }

    if (d && m && y) {
      // Garante que são números válidos
      const day = parseInt(d);
      const month = parseInt(m);
      const year = parseInt(y);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  // Caso YYYY-MM-DD (ISO)
  if (dateStr.match(/^\d{4}/\d{2}/\d{2}$/)) {
    return dateStr.replace(/\//g, '-');
  }
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

  // Retorna vazio em vez de "hoje" para que o usuário perceba a falha na extração
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
