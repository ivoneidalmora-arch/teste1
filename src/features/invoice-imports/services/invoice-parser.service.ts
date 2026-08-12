import ExcelJS from 'exceljs';
import { InvoiceImportData, validateInvoiceData } from '../schemas/invoice.schema';
import { format } from 'date-fns';
import { readXlsFile } from '@/lib/xls-reader';
import { 
  extractVehiclePlate, 
  findHeaderRowIndex, 
  parseCurrencyBR as parseCurrencyUtils, 
  parseBrazilianDate,
  getValueByAliases,
  COLUMN_ALIASES
} from '@/features/imports/utils/import-utils';

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

    const rawMatrix: any[][] = [];
    for (let i = 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowValues: any[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        rowValues.push(cell.text || cell.value || '');
      });
      rawMatrix.push(rowValues);
    }

    const headerIndexZeroBased = findHeaderRowIndex(rawMatrix);
    const headerRowIndex = headerIndexZeroBased + 1;
    const headers = rawMatrix[headerIndexZeroBased]?.map((c: any) => String(c || '').trim()) || [];

    if (headers.length === 0) {
      throw new Error('Não foi possível identificar o cabeçalho da planilha de notas fiscais.');
    }

    const rows: Record<string, unknown>[] = [];
    for (let i = headerRowIndex + 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const rowData: Record<string, unknown> = {};
      let hasData = false;
      
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1] || `col_${colNumber}`;
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

    return rows.map((row, index) => this.mapRowToInvoiceImportData(row, index, headerRowIndex));
  },

  mapRowToInvoiceImportData(row: Record<string, unknown>, index: number, headerRowIndex: number): InvoiceImportData {
    const rawDateVal = getValueByAliases(row, COLUMN_ALIASES.data);
    const rawDateStr = String(rawDateVal || '');
    let dateObj = parseBrazilianDate(rawDateVal || rawDateStr);
    if (rawDateVal instanceof Date) {
      dateObj = rawDateVal;
    }
    const dateStr = dateObj ? format(dateObj, 'yyyy-MM-dd') : '';

    const rawCliente = String(getValueByAliases(row, COLUMN_ALIASES.cliente) || '').trim();
    const rawSituacao = String(getValueByAliases(row, COLUMN_ALIASES.situacao) || 'ATIVA').toUpperCase().trim();

    const rawValorBrutoStr = String(getValueByAliases(row, COLUMN_ALIASES.valorBruto) || '0');
    let grossValue = parseCurrencyUtils(rawValorBrutoStr) ?? 0;
    if (grossValue === 0) {
      const val = getValueByAliases(row, COLUMN_ALIASES.valorBruto);
      if (typeof val === 'number') grossValue = val;
    }

    const rawDescontoStr = String(getValueByAliases(row, COLUMN_ALIASES.desconto) || '0');
    const descontoVal = parseCurrencyUtils(rawDescontoStr) ?? 0;

    // Valor Líquido no XLS: NÃO aplicar dedução de 8% (* 0.92). Igual ao bruto ou bruto - desconto.
    const netValue = grossValue > 0 ? grossValue - descontoVal : 0;

    const rawDescricao = String(getValueByAliases(row, COLUMN_ALIASES.description) || '');
    const extractedPlaca = extractVehiclePlate(rawDescricao) || extractVehiclePlate(getValueByAliases(row, COLUMN_ALIASES.placa));
    const placaFinal = extractedPlaca ? extractedPlaca.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

    const item: Partial<InvoiceImportData> = {
      id: `inv-${index}-${Math.random().toString(36).substr(2, 5)}`,
      date: dateStr,
      cliente: rawCliente || 'NÃO INFORMADO',
      placa: placaFinal,
      statusNota: rawSituacao || 'ATIVA',
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
  },

  async _parseXls(file: File): Promise<InvoiceImportData[]> {
    const rows = await readXlsFile(file);

    if (rows.length === 0) throw new Error('A planilha está vazia.');

    const headerIndexZeroBased = findHeaderRowIndex(rows);
    const headers: string[] = (rows[headerIndexZeroBased] ?? []).map((c: any) => String(c ?? '').trim());

    if (headers.length === 0) {
      throw new Error('Não foi possível identificar o cabeçalho da planilha de notas fiscais.');
    }

    const dataRows = rows.slice(headerIndexZeroBased + 1);

    return dataRows
      .map((rawRow, index) => {
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, colIdx) => {
          if (header) rowData[header] = rawRow[colIdx] ?? null;
        });

        return this.mapRowToInvoiceImportData({ ...rowData, _sourceRowNumber: index + headerIndexZeroBased + 2 }, index, headerIndexZeroBased);
      })
      .filter((item) => item.cliente !== 'NÃO INFORMADO' || item.grossValue > 0);
  }
};

