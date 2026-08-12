import { calculateLiquido } from '@/core/utils/finance';

export const COLUMN_ALIASES = {
  numeroNfse: [
    'Número', 'Numero', 'Nº', 'N°', 'Número NF-e', 'Número da Nota', 'Numero da Nota', 'nf', 'nfe'
  ],
  numeroRps: [
    'Nº RPS', 'N° RPS', 'Numero RPS', 'RPS'
  ],
  competencia: [
    'Competência', 'Competencia'
  ],
  data: [
    'Geração', 'Geracao', 'Data Geração', 'Data de Geração', 'Data Geracao', 'data', 'DATA', 
    'Data', 'Data Serviço', 'Data do Serviço', 'Dt Serviço', 'Dt', 'data_lancamento', 
    'data lançamento', 'Data Lançamento', 'vencimento', 'data_pagamento', 'Data Pagamento'
  ],
  placa: [
    'placa', 'PLACA', 'Placa', 'Veículo', 'Veiculo', 'carro', 'identificacao'
  ],
  cliente: [
    'Tomador', 'Tomador de Serviços', 'Nome Tomador', 'cliente', 'CLIENTE', 'Cliente', 
    'Nome Cliente', 'Nome do Cliente', 'Proprietário', 'Proprietario', 'nome', 'Nome', 'solicitante'
  ],
  prestador: [
    'Prestador', 'Prestador de Serviços', 'Nome Prestador'
  ],
  situacao: [
    'Situação', 'Situacao', 'status', 'Status', 'pago', 'pendente'
  ],
  servico: [
    'Serviço', 'Servico', 'Tipo Serviço', 'Tipo Servico', 'tipo_servico', 'item', 
    'categoria', 'Categoria', 'CATEGORIA', 'grupo', 'classificacao', 'classificação'
  ],
  valorBruto: [
    'Valor', 'VALOR', 'valor', 'Valor Bruto', 'VALOR BRUTO', 'Valor Total', 'Bruto', 
    'BRUTO', 'Receita Bruta', 'Total', 'amount', 'total', 'preco', 'preço', 'valor_total', 
    'valor total', 'valor_bruto', 'receita', 'despesa', 'r$', 'valor (r$)'
  ],
  desconto: [
    'Valor Desconto', 'Desconto', 'desconto'
  ],
  valorLiquido: [
    'liquido', 'líquido', 'LÍQUIDO', 'LIQUIDO', 'Valor Líquido', 'Valor Liquido', 
    'VALOR LIQUIDO', 'VALOR LÍQUIDO', 'Liq', 'Líquido', 'Liquido', 'Receita Líquida'
  ],
  description: [
    "Discriminação Serviço", "Discriminacao Servico", "Discriminação do Serviço", 
    "Discriminacao do Servico", "Discriminação", "Discriminacao", "descricao", "descrição", 
    "Descrição", "DESCRIÇÃO", "historico", "histórico", "Histórico", "observacao", "observação", "obs"
  ],
  observacao: [
    "Observação", "Observacao", "observacao", "observação", "obs", "Obs", "nota"
  ],
  type: [
    "tipo", "Tipo", "TIPO", "natureza", "entrada_saida", "entrada/saida", "entrada saída"
  ],
  paymentMethod: [
    "forma_pagamento", "forma de pagamento", "Forma de Pagamento", "pagamento", "método", "metodo", "fp"
  ],
  status: [
    "status", "Status", "situação", "situacao", "pago", "pendente"
  ],
  notes: [
    "observacao", "observação", "Observação", "obs", "Obs", "nota", "comentario", "comentário"
  ]
};

/**
 * Extrai exclusivamente a placa do veículo a partir do texto de Discriminação de Serviço.
 * Valida os padrões brasileiros:
 * - Antigo: ABC1234 (3 letras + 4 dígitos)
 * - Mercosul: ABC1D23 (3 letras + 1 dígito + 1 letra + 2 dígitos)
 * Retorna a placa normalizada em maiúsculas sem hífen/espaço ou null se não encontrada.
 */
export function extractVehiclePlate(discriminacao: unknown): string | null {
  if (!discriminacao) return null;
  const text = String(discriminacao).toUpperCase();
  if (!text.trim()) return null;

  // 1. Padrão Mercosul: 3 letras, hífen/espaço opcional, 1 dígito, 1 letra, 2 dígitos
  // Ex: SKP4J26, SKP-4J26, SKP 4J26
  const mercosulMatch = text.match(/\b([A-Z]{3})[-\s]?([0-9][A-Z][0-9]{2})\b/);
  if (mercosulMatch) {
    return `${mercosulMatch[1]}${mercosulMatch[2]}`;
  }

  // 2. Padrão Antigo: 3 letras, hífen/espaço opcional, 4 dígitos
  // Ex: ABC1234, ABC-1234, ABC 1234
  const antigoMatch = text.match(/\b([A-Z]{3})[-\s]?([0-9]{4})\b/);
  if (antigoMatch) {
    return `${antigoMatch[1]}${antigoMatch[2]}`;
  }

  return null;
}

/**
 * Valida se uma string é uma placa no padrão brasileiro (Antigo ou Mercosul).
 */
export function isValidPlate(plate: string | null | undefined): boolean {
  if (!plate) return false;
  const p = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (p.length !== 7) return false;

  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const antigo = /^[A-Z]{3}[0-9]{4}$/;

  return mercosul.test(p) || antigo.test(p);
}

/**
 * Localiza dinamicamente a linha de cabeçalho da planilha de NFS-e (varrendo as primeiras 20 linhas).
 */
export function findHeaderRowIndex(rows: any[][]): number {
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const rowCells = (rows[i] || []).map(cell => 
      String(cell || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    );

    const matches = rowCells.filter(cell => {
      return [
        'numero', 'geracao', 'valor', 'tomador', 'situacao', 'discriminacao', 'servico'
      ].some(k => cell.includes(k));
    });

    if (matches.length >= 3) {
      return i;
    }
  }
  return 1;
}

export function normalizeColumnName(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getValueByAliases(row: Record<string, unknown>, aliases: string[]): unknown {
  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    const normalizedKey = normalizeColumnName(key);
    if (!(normalizedKey in acc) || (value !== undefined && value !== null && String(value).trim() !== "")) {
      acc[normalizedKey] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  for (const alias of aliases) {
    const normalizedAlias = normalizeColumnName(alias);
    if (normalizedAlias in normalizedRow) {
      const val = normalizedRow[normalizedAlias];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        return val;
      }
    }
  }

  // Fallback: Partial matching
  for (const alias of aliases) {
    const normalizedAlias = normalizeColumnName(alias);
    const partialMatchKey = Object.keys(normalizedRow).find(k => k.includes(normalizedAlias));
    if (partialMatchKey) {
       const val = normalizedRow[partialMatchKey];
       if (val !== undefined && val !== null && String(val).trim() !== "") {
         return val;
       }
    }
  }

  return null;
}

export function parseCurrencyBR(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value)
    .replace(/\u00A0/g, ' ')
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .trim();

  if (!text) return null;

  const hasComma = text.includes(',');
  const hasDot = text.includes('.');

  if (hasComma && hasDot) {
    text = text.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    text = text.replace(',', '.');
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

export function parseBrazilianDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  // Detecta número serial do Excel passado como string ou número
  const numVal = Number(value);
  const isString = typeof value === 'string';
  const hasDateSeparators = isString && (value.includes('/') || value.includes('-'));

  if (!isNaN(numVal) && !hasDateSeparators && numVal >= 30000 && numVal <= 60000) {
    const excelEpoch = new Date(1899, 11, 30);
    const result = new Date(excelEpoch.getTime() + numVal * 86400000);
    return new Date(result.getUTCFullYear(), result.getUTCMonth(), result.getUTCDate());
  }

  const text = String(value).trim();

  const brMatch = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return null;
}

export function formatDateBR(date: Date | null): string {
  if (!date) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function normalizeClientName(value: unknown): string {
  if (!value) return '';

  const name = String(value)
    .normalize('NFC')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  const simplified = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const isParticularSaoMateus =
    simplified.includes('PARTICULAR') &&
    (
      simplified.includes('SAO MATEU') ||
      simplified.includes('SI MATEU') ||
      simplified.includes('SÏ MATEU') ||
      simplified.includes('S MATEU') ||
      simplified.includes('MATEU')
    );

  if (isParticularSaoMateus) {
    return 'PARTICULAR SÃO MATEUS';
  }

  return name;
}

export function standardizeService(raw: string): string {
  const s = String(raw).trim();
  if (!s) return 'Vistoria Veicular';
  const normalized = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes('completo') || normalized.includes('transferencia')) return 'Transferência';
  if (normalized.includes('simplificada') || normalized.includes('entrada')) return 'Vistoria de Entrada';
  if (normalized.includes('retorno')) return 'Vistoria de Retorno';
  if (normalized.includes('saida')) return 'Vistoria de Saída';
  if (normalized.includes('cautelar')) return 'Vistoria Cautelar';
  
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

