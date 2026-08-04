import ExcelJS from 'exceljs';
import { InvoiceImportData, validateInvoiceData } from '../schemas/invoice.schema';
import { format } from 'date-fns';
import { readXlsFile } from '@/lib/xls-reader';

// Helper aliases to find columns even if slightly misnamed
const COLUMNS = {
  data: ['geração', 'geracao', 'data'],
  cliente: ['tomador', 'cliente'],
  situacao: ['situação', 'situacao', 'status'],
  valorBruto: ['valor total', 'valor bruto', 'bruto', 'valor'],
  valorLiquido: ['valor líquido', 'valor liquido', 'liquido', 'líquido', 'valor servico', 'valor do servico', 'vl. liquido', 'vl liquido'],
  discriminacao: ['discriminação do serviço', 'discriminacao', 'serviço', 'servico', 'descrição', 'descricao', 'discriminação']
};

const findColumn = (headers: string[], aliases: string[]): string | undefined => {
  return headers.find(h => {
    const normalized = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return aliases.some(alias => normalized.includes(alias));
  });
};

const parseCurrencyBR = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const cleaned = value.replace(/[R$\s]/g, '').trim();
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) {
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else {
      return parseFloat(cleaned.replace(/,/g, ''));
    }
  } else if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.'));
  }
  return parseFloat(cleaned) || 0;
};

/**
 * Extrai a placa de um texto qualquer.
 * Suporta:
 *  - Formato antigo:   ABC1234  (3 letras + 4 dígitos)
 *  - Formato Mercosul: ABC1D23  (3 letras + dígito + letra + 2 dígitos)
 * Aceita separadores: espaço, hífen, barra, ponto ou nenhum.
 * Também busca placa no formato com hífen (ABC-1234).
 */
const extractPlate = (text: string, fallbackTexts: string[] = []): string => {
  const allTexts = [text, ...fallbackTexts].filter(Boolean);

  // Mercosul + antigo, com ou sem separador entre grupo de letras e números
  const regex = /\b([A-Za-z]{3})[\s\-\.\/_]?([0-9][A-Za-z0-9][0-9]{2})\b/g;

  for (const src of allTexts) {
    if (!src) continue;
    const matches = [...src.matchAll(regex)];
    for (const m of matches) {
      const candidate = (m[1] + m[2]).toUpperCase();
      // Valida formato final: 3 letras + 4 chars (onde o 5º pode ser letra ou dígito)
      if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(candidate)) {
        return candidate;
      }
    }
  }

  return 'PLACA NÃO IDENTIFICADA';
};

/**
 * Calcula valor líquido: subtrai ISS (5%) + outros impostos padrão (3%).
 * Use sempre que não houver coluna de valor líquido explícita.
 * Regra: líquido = bruto * 0.92 (desconto de 8% de impostos totais)
 * Ajuste o percentual conforme sua aliquota real.
 */
const calcNetValue = (gross: number): number => {
  // 8% de imposto total (ISS 5% + outros 3%) — ajuste conforme necessidade
  return parseFloat((gross * 0.92).toFixed(2));
};

export const invoiceParserService = {
  async parseFile(file: File): Promise<InvoiceImportData[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension !== 'xlsx' && extension !== 'xls' && extension !== 'csv') {
      throw new Error('Apenas arquivos Excel (.xlsx, .xls) ou CSV são suportados para notas fiscais.');
    }

    if (extension === 'csv') {
      throw new Error('Para importar CSV, por favor salve como .xlsx no Excel antes de importar.');
    }

    // Arquivos .xls legados: usar SheetJS para leitura
    if (extension === 'xls') {
      return this._parseXls(file);
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('A planilha está vazia.');
    }

    const rows: Record<string, unknown>[] = [];
    let headerRowIndex = 1;
    let headers: string[] = [];

    // Busca cabeçalhos até a linha 20
    for (let i = 1; i <= Math.min(20, worksheet.rowCount); i++) {
      const row = worksheet.getRow(i);
      const cellValues: string[] = [];
      row.eachCell((cell) => {
        cellValues.push(cell.text || cell.value?.toString() || '');
      });

      const hasGeracao = cellValues.some(c => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('geracao'));
      const hasTomador = cellValues.some(c => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('tomador'));

      if (hasGeracao || hasTomador || cellValues.length > 3) {
        headerRowIndex = i;
        headers = cellValues;
        break;
      }
    }

    if (headers.length === 0) {
      throw new Error('Não foi possível identificar o cabeçalho da planilha de notas fiscais.');
    }

    const colData = findColumn(headers, COLUMNS.data);
    const colCliente = findColumn(headers, COLUMNS.cliente);
    const colSituacao = findColumn(headers, COLUMNS.situacao);
    const colValor = findColumn(headers, COLUMNS.valorBruto);
    const colLiquido = findColumn(headers, COLUMNS.valorLiquido);
    const colDescricao = findColumn(headers, COLUMNS.discriminacao);

    if (!colData && !colCliente) {
      throw new Error('As colunas de "Geração" (Data) e "Tomador" (Cliente) não foram encontradas.');
    }

    // Lê linhas
    for (let i = headerRowIndex + 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowData: Record<string, unknown> = {};
      let hasData = false;
      
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (!header) return;
        
        let val: any = cell.value;
        if (val && typeof val === 'object' && val.result !== undefined) {
           val = val.result;
        } else if (val && typeof val === 'object' && val.text !== undefined) {
           val = val.text;
        }
        rowData[header] = val;
        if (val !== null && val !== '') hasData = true;
      });

      if (hasData) {
        rows.push({ ...rowData, _sourceRowNumber: i });
      }
    }

    return rows.map((row, index) => {
      const rawDate = colData ? row[colData] : '';
      const rawCliente = colCliente ? String(row[colCliente] || '').trim() : '';
      const rawSituacao = colSituacao ? String(row[colSituacao] || '').trim() : '';
      const rawValor = colValor ? row[colValor] : 0;
      const rawDescricao = colDescricao ? String(row[colDescricao] || '') : '';
      const rawLiquido = colLiquido ? row[colLiquido] : null;

      // Trata data
      let dateStr = '';
      if (rawDate instanceof Date) {
        dateStr = format(rawDate, 'yyyy-MM-dd');
      } else if (typeof rawDate === 'string') {
        const dateMatch = rawDate.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (dateMatch) {
          dateStr = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }
      }

      const grossValue = typeof rawValor === 'number' ? rawValor : parseCurrencyBR(String(rawValor || '0'));

      // Valor líquido: usa coluna explícita se existir, senão calcula automaticamente
      const netValue = rawLiquido !== null && rawLiquido !== undefined
        ? (typeof rawLiquido === 'number' ? rawLiquido : parseCurrencyBR(String(rawLiquido)))
        : calcNetValue(grossValue);

      // Extrai placa da discriminação; usa campo cliente como fallback
      const placa = extractPlate(rawDescricao, [rawCliente]);

      const item: Partial<InvoiceImportData> = {
        id: `inv-${index}-${Math.random().toString(36).substr(2, 5)}`,
        date: dateStr,
        cliente: rawCliente || 'NÃO INFORMADO',
        placa,
        statusNota: rawSituacao || 'NÃO INFORMADA',
        grossValue,
        netValue,
        description: rawDescricao,
        sourceRowNumber: Number(row._sourceRowNumber) || index + headerRowIndex + 1,
        errors: [],
        warnings: [],
        status: 'pending'
      };

      const validation = validateInvoiceData(item);
      if (!validation.isValid) {
        item.status = 'error';
        item.errors = validation.errors;
      } else {
        item.status = 'valid';
      }

      return item as InvoiceImportData;
    });
  },

  /**
   * Lê arquivo .xls legado via SheetJS e converte para InvoiceImportData[].
   * A lógica de mapeamento de colunas é a mesma usada para .xlsx acima.
   */
  async _parseXls(file: File): Promise<InvoiceImportData[]> {
    const rows = await readXlsFile(file);

    if (rows.length === 0) throw new Error('A planilha está vazia.');

    // Encontrar linha de cabeçalho (igual ao fluxo ExcelJS)
    let headerRowIndex = 0;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(20, rows.length); i++) {
      const cellValues = (rows[i] ?? []).map((c: any) => String(c ?? ''));
      const normalized = cellValues.map((c) =>
        c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
      );
      const hasGeracao = normalized.some((c) => c.includes('geracao'));
      const hasTomador = normalized.some((c) => c.includes('tomador'));
      if (hasGeracao || hasTomador || cellValues.filter(Boolean).length > 3) {
        headerRowIndex = i;
        headers = cellValues;
        break;
      }
    }

    if (headers.length === 0)
      throw new Error('Não foi possível identificar o cabeçalho da planilha de notas fiscais.');

    const colData = findColumn(headers, COLUMNS.data);
    const colCliente = findColumn(headers, COLUMNS.cliente);
    const colSituacao = findColumn(headers, COLUMNS.situacao);
    const colValor = findColumn(headers, COLUMNS.valorBruto);
    const colLiquido = findColumn(headers, COLUMNS.valorLiquido);
    const colDescricao = findColumn(headers, COLUMNS.discriminacao);

    if (!colData && !colCliente)
      throw new Error('As colunas de "Geração" (Data) e "Tomador" (Cliente) não foram encontradas.');

    const dataRows = rows.slice(headerRowIndex + 1);

    return dataRows
      .map((rawRow, index) => {
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, colIdx) => {
          if (header) rowData[header] = rawRow[colIdx] ?? null;
        });

        const rawDate = colData ? rowData[colData] : '';
        const rawCliente = colCliente ? String(rowData[colCliente] ?? '').trim() : '';
        const rawSituacao = colSituacao ? String(rowData[colSituacao] ?? '').trim() : '';
        const rawValor = colValor ? rowData[colValor] : 0;
        const rawDescricao = colDescricao ? String(rowData[colDescricao] ?? '') : '';
        const rawLiquido = colLiquido ? rowData[colLiquido] : null;

        let dateStr = '';
        if (rawDate instanceof Date) {
          dateStr = format(rawDate, 'yyyy-MM-dd');
        } else if (typeof rawDate === 'string') {
          const dateMatch = rawDate.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
          if (dateMatch) dateStr = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }

        const grossValue =
          typeof rawValor === 'number' ? rawValor : parseCurrencyBR(String(rawValor ?? '0'));

        // Valor líquido: usa coluna explícita se existir, senão calcula automaticamente
        const netValue = rawLiquido !== null && rawLiquido !== undefined
          ? (typeof rawLiquido === 'number' ? rawLiquido : parseCurrencyBR(String(rawLiquido)))
          : calcNetValue(grossValue);

        // Extrai placa da discriminação; usa campo cliente como fallback
        const placa = extractPlate(rawDescricao, [rawCliente]);

        const item: Partial<InvoiceImportData> = {
          id: `inv-${index}-${Math.random().toString(36).substr(2, 5)}`,
          date: dateStr,
          cliente: rawCliente || 'NÃO INFORMADO',
          placa,
          statusNota: rawSituacao || 'NÃO INFORMADA',
          grossValue,
          netValue,
          description: rawDescricao,
          sourceRowNumber: index + headerRowIndex + 2,
          errors: [],
          warnings: [],
          status: 'pending',
        };

        const validation = validateInvoiceData(item);
        if (!validation.isValid) {
          item.status = 'error';
          item.errors = validation.errors;
        } else {
          item.status = 'valid';
        }

        return item as InvoiceImportData;
      })
      .filter((item) => item.cliente !== 'NÃO INFORMADO' || item.grossValue > 0);
  }
};
