import { calculateLiquido } from '@/core/utils/finance';

export const COLUMN_ALIASES = {
  data: [
    'data', 'DATA', 'Data', 'Data Serviço', 'Data do Serviço', 'Dt Serviço', 'Dt',
    'data_lancamento', 'data lançamento', 'Data Lançamento', 'vencimento', 'data_pagamento', 
    'Data Pagamento', 'data_vistoria', 'vistoria'
  ],
  placa: [
    'placa', 'PLACA', 'Placa', 'Veículo', 'Veiculo', 'carro', 'identificacao'
  ],
  cliente: [
    'cliente', 'CLIENTE', 'Cliente', 'Nome Cliente', 'Nome do Cliente', 'Proprietário', 
    'Proprietario', 'nome', 'Nome', 'solicitante'
  ],
  servico: [
    'serviço', 'servico', 'SERVIÇO', 'SERVICO', 'Serviço', 'Servico', 'Tipo Serviço', 
    'Tipo Servico', 'tipo_servico', 'item', 'categoria', 'Categoria', 'CATEGORIA', 
    'grupo', 'classificacao', 'classificação'
  ],
  valorBruto: [
    'valor', 'VALOR', 'Valor', 'Valor Bruto', 'VALOR BRUTO', 'Bruto', 'BRUTO', 
    'Receita Bruta', 'Total', 'amount', 'total', 'preco', 'preço', 'valor_total', 
    'valor total', 'valor_bruto', 'receita', 'despesa', 'credito', 'crédito', 
    'debito', 'débito', 'entrada', 'saida', 'importancia', 'importância', 
    'lancamento', 'lançamento', 'r$', 'valor (r$)'
  ],
  valorLiquido: [
    'liquido', 'líquido', 'LÍQUIDO', 'LIQUIDO', 'Valor Líquido', 'Valor Liquido', 
    'VALOR LIQUIDO', 'VALOR LÍQUIDO', 'Liq', 'Líquido', 'Liquido', 'Receita Líquida', 
    'Receita Liquida'
  ],
  description: [
    "descricao", "descrição", "Descrição", "DESCRIÇÃO", "historico", "histórico", 
    "Histórico", "observacao", "observação", "obs", "historico_lancamento"
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
    // Preserva o primeiro valor encontrado ou valores não vazios
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

  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const result = new Date(excelEpoch.getTime() + value * 86400000);
    // Avoid timezone offset bugs
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

  let name = String(value)
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
  const normalized = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes('completo') || normalized.includes('transferencia')) return 'Transferência';
  if (normalized.includes('simplificada') || normalized.includes('entrada')) return 'Vistoria de Entrada';
  if (normalized.includes('retorno')) return 'Vistoria de Retorno';
  if (normalized.includes('saida')) return 'Vistoria de Saída';
  if (normalized.includes('cautelar')) return 'Vistoria Cautelar';
  
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
