import { calculateLiquido } from '@/core/utils/finance';

export const COLUMN_ALIASES = {
  date: [
    "data", "Data", "DATA", "data_lancamento", "data lançamento", "Data Lançamento",
    "vencimento", "data_pagamento", "Data Pagamento", "data_vistoria", "vistoria"
  ],
  description: [
    "descricao", "descrição", "Descrição", "DESCRIÇÃO", "historico", "histórico", 
    "Histórico", "observacao", "observação", "obs", "historico_lancamento"
  ],
  type: [
    "tipo", "Tipo", "TIPO", "natureza", "entrada_saida", "entrada/saida", "entrada saída"
  ],
  category: [
    "categoria", "Categoria", "CATEGORIA", "grupo", "classificacao", "classificação", "servico", "serviço"
  ],
  amount: [
    "valor", "Valor", "VALOR", "amount", "total", "preco", "preço", "valor_total", 
    "valor total", "valor_bruto", "valor bruto", "bruto", "receita", "despesa",
    "credito", "crédito", "debito", "débito", "liquido", "líquido", "entrada", "saida",
    "importancia", "importância", "lancamento", "lançamento", "r$", "valor (r$)"
  ],
  plate: [
    "placa", "Placa", "PLACA", "veiculo", "veículo", "carro", "identificacao"
  ],
  service: [
    "servico", "serviço", "Serviço", "SERVIÇO", "tipo_servico", "tipo serviço", "item"
  ],
  client: [
    "cliente", "Cliente", "CLIENTE", "nome", "Nome", "proprietario", "proprietário", "solicitante"
  ],
  paymentMethod: [
    "forma_pagamento", "forma de pagamento", "Forma de Pagamento", "pagamento", "método", "metodo"
  ],
  status: [
    "status", "Status", "situação", "situacao", "pago", "pendente"
  ],
  notes: [
    "observacao", "observação", "Observação", "obs", "Obs", "nota", "comentario", "comentário"
  ]
};

/**
 * Normaliza valores monetários de diversos formatos para número.
 */
export function normalizeCurrency(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  // Limpa tudo que não for número, ponto, vírgula ou sinal negativo (resolve r$, espaços inquebráveis, etc)
  let cleaned = String(value).replace(/[^0-9.,-]/g, "");

  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma < lastDot) {
      // Padrão americano: 1,500.00
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Padrão brasileiro: 1.500,00
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (lastComma > -1) {
    // Apenas vírgula, assume decimal brasileiro
    cleaned = cleaned.replace(',', '.');
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
}

/**
 * Normaliza datas de diversos formatos (Excel serial, DD/MM/YYYY, ISO) para Objeto Date.
 */
export function normalizeDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    // Excel Serial Date
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const raw = String(value).trim();

  // Suporte a formato brasileiro DD/MM/YYYY
  const brazilianDateMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilianDateMatch) {
    const [, day, month, year] = brazilianDateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // ISO ou outros formatos nativos
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Identifica o tipo de transação (receita ou despesa) baseado no valor ou texto.
 */
export function normalizeTransactionType(value: unknown, amount?: number | null): "receita" | "despesa" | null {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["receita", "entrada", "credito", "crédito", "income", "revenue", "positivo"].includes(raw)) {
    return "receita";
  }

  if (["despesa", "saida", "saída", "debito", "débito", "expense", "negativo"].includes(raw)) {
    return "despesa";
  }

  // Se não houver texto, tenta pelo sinal do valor
  if (typeof amount === "number") {
    return amount < 0 ? "despesa" : "receita";
  }

  return null;
}

/**
 * Mapeia as chaves de um objeto usando os aliases definidos.
 */
export function normalizeRowKeys(row: Record<string, unknown>): Record<string, any> {
  const normalized: Record<string, any> = {};
  const rowKeys = Object.keys(row);

  Object.entries(COLUMN_ALIASES).forEach(([targetKey, aliases]) => {
    // 1. Encontra todas as chaves exatas
    let exactMatches = rowKeys.filter(rk => {
      const cleanRK = rk.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return aliases.some(alias => {
        const cleanAlias = alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return cleanRK === cleanAlias;
      });
    });

    // 2. Encontra todas as chaves parciais
    let partialMatches = rowKeys.filter(rk => {
      const cleanRK = rk.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return aliases.some(alias => {
        const cleanAlias = alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return cleanRK.includes(cleanAlias);
      });
    });

    // 3. Prioriza a chave que não tem valor vazio
    const isNotEmpty = (val: unknown) => val !== undefined && val !== null && String(val).trim() !== "";
    
    const bestKey = 
      exactMatches.find(k => isNotEmpty(row[k])) ||
      exactMatches[0] ||
      partialMatches.find(k => isNotEmpty(row[k])) ||
      partialMatches[0];

    if (bestKey) {
      normalized[targetKey] = row[bestKey];
    }
  });

  return normalized;
}

/**
 * Padroniza os nomes dos serviços/categorias.
 */
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
