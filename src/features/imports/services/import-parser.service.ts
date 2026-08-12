import ExcelJS from 'exceljs';
import { ImportedTransaction } from '../types/import.types';
import { 
  getValueByAliases,
  COLUMN_ALIASES,
  parseBrazilianDate, 
  parseCurrencyBR, 
  normalizeClientName,
  standardizeService,
  extractVehiclePlate,
  findHeaderRowIndex
} from '../utils/import-utils';
import { format } from 'date-fns';
import { readXlsFile } from '@/lib/xls-reader';

export const importParserService = {
  async parseFile(file: File): Promise<ImportedTransaction[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return this.parseSpreadsheet(file);
    } else if (extension === 'pdf') {
      return this.parsePDF(file);
    }

    throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou PDF.');
  },

  async parseSpreadsheet(file: File): Promise<ImportedTransaction[]> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      // Arquivos .xls legados: usar SheetJS (ExcelJS não suporta BIFF8)
      if (extension === 'xls') {
        return this._parseXlsLegacy(file);
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      
      if (extension === 'csv') {
         throw new Error('Para importar CSV, por favor salve como .xlsx no Excel antes de importar.');
      } else {
         await workbook.xlsx.load(arrayBuffer);
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('A planilha está vazia.');
      }

      // Converte todas as linhas da planilha em matriz de valores brutos para busca dinâmica de cabeçalho
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
      const headerRowIndex = headerIndexZeroBased + 1; // 1-based para ExcelJS
      const headers = rawMatrix[headerIndexZeroBased]?.map((c: any) => String(c || '').trim()) || [];

      if (!headers.length) {
        throw new Error('Não foi possível identificar o cabeçalho da planilha.');
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
          rows.push(rowData);
        }
      }

      if (!rows.length) {
        throw new Error('A planilha não possui dados para importar após a linha de cabeçalho.');
      }

      return rows.map((row, index) => this.mapRowToImportedTransaction(row, index, file.name, worksheet.name, index + headerRowIndex + 1));
    } catch (error: any) {
      console.error('[IMPORT ERROR]', error);
      throw new Error(`Erro ao processar planilha: ${error.message}`);
    }
  },

  /**
   * Mapeamento unificado de linha (Record<string, unknown>) para ImportedTransaction.
   */
  mapRowToImportedTransaction(
    row: Record<string, unknown>, 
    index: number, 
    fileName: string, 
    sheetName: string, 
    rowNumber: number
  ): ImportedTransaction {
    // 1. Número NFS-e e RPS
    const numeroNfse = String(getValueByAliases(row, COLUMN_ALIASES.numeroNfse) || '').trim();
    const numeroRps = String(getValueByAliases(row, COLUMN_ALIASES.numeroRps) || '').trim();
    const competencia = String(getValueByAliases(row, COLUMN_ALIASES.competencia) || '').trim();

    // 2. Data oficial (campo Geração)
    const rawDateVal = getValueByAliases(row, COLUMN_ALIASES.data);
    const rawDateStr = String(rawDateVal || '');
    let dateObj = parseBrazilianDate(rawDateVal || rawDateStr);
    if (rawDateVal instanceof Date) {
      dateObj = rawDateVal;
    }

    // 3. Cliente oficial (campo Tomador)
    const rawClientStr = String(getValueByAliases(row, COLUMN_ALIASES.cliente) || '');
    const clienteStr = normalizeClientName(rawClientStr || 'NÃO INFORMADO');

    // 4. Valor Bruto (campo Valor) e Desconto (campo Valor Desconto)
    const rawValorBrutoStr = String(getValueByAliases(row, COLUMN_ALIASES.valorBruto) || '');
    let amount = parseCurrencyBR(rawValorBrutoStr);
    if (amount === null || amount === 0) {
      const val = getValueByAliases(row, COLUMN_ALIASES.valorBruto);
      if (typeof val === 'number') amount = val;
    }

    const rawDescontoStr = String(getValueByAliases(row, COLUMN_ALIASES.desconto) || '');
    const descontoVal = parseCurrencyBR(rawDescontoStr) || 0;

    const grossValue = amount ?? 0;
    // O XLS NÃO POSSUI coluna Valor Líquido -> NÃO aplicar deduções automáticas (ex: * 0.92)
    const netValue = grossValue > 0 ? grossValue - descontoVal : 0;

    // 5. Discriminação do Serviço
    const descriptionStr = String(
      getValueByAliases(row, COLUMN_ALIASES.description) ||
      getValueByAliases(row, COLUMN_ALIASES.servico) || ''
    ).trim();

    // 6. Placa extraída EXCLUSIVAMENTE de Discriminação Serviço
    const extractedPlaca = extractVehiclePlate(descriptionStr) || extractVehiclePlate(getValueByAliases(row, COLUMN_ALIASES.placa));
    const placaFinal = extractedPlaca ? extractedPlaca.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

    // 7. Serviço e Situação
    const rawCategory = String(getValueByAliases(row, COLUMN_ALIASES.servico) || 'Vistoria Veicular');
    const category = standardizeService(rawCategory);
    const rawSituacao = String(getValueByAliases(row, COLUMN_ALIASES.situacao) || 'ATIVA').toUpperCase().trim();

    return {
      id: `row-${index}-${Math.random().toString(36).substr(2, 5)}`,
      date: dateObj ? format(dateObj, 'yyyy-MM-dd') : '',
      placa: placaFinal,
      cliente: clienteStr,
      service: category,
      category: category,
      grossValue,
      netValue,
      status: 'pending',
      errors: [],
      warnings: [],
      validationMessages: [],
      description: descriptionStr,
      rawDate: rawDateVal instanceof Date ? format(rawDateVal, 'dd/MM/yyyy') : rawDateStr,
      rawValorBruto: rawValorBrutoStr || String(grossValue || ''),
      rawValorLiquido: String(netValue),
      rawClient: rawClientStr,
      sourceFileName: fileName,
      sourceSheetName: sheetName,
      sourceRowNumber: rowNumber,
      rawData: row,
      auditLog: [],
      formaPagamento: String(getValueByAliases(row, COLUMN_ALIASES.paymentMethod) || 'Pix')
    };
  },

  /**
   * Lê arquivo .xls legado via SheetJS e mapeia para ImportedTransaction[].
   */
  async _parseXlsLegacy(file: File): Promise<ImportedTransaction[]> {
    try {
      const allRows = await readXlsFile(file);
      if (!allRows.length) throw new Error('A planilha está vazia.');

      const headerRowIndex = findHeaderRowIndex(allRows);
      const headers: string[] = (allRows[headerRowIndex] ?? []).map((c: any) => String(c ?? '').trim());

      if (headers.length === 0) {
        throw new Error('Não foi possível identificar o cabeçalho da planilha.');
      }

      const rows: Record<string, unknown>[] = allRows
        .slice(headerRowIndex + 1)
        .map((rawRow) => {
          const rowData: Record<string, unknown> = {};
          let hasData = false;
          headers.forEach((header, colIdx) => {
            const colKey = header || `col_${colIdx + 1}`;
            const val = rawRow[colIdx] ?? null;
            rowData[colKey] = val;
            if (val !== null && val !== '') hasData = true;
          });
          return hasData ? rowData : null;
        })
        .filter(Boolean) as Record<string, unknown>[];

      if (!rows.length) {
        throw new Error('A planilha não possui dados para importar após a linha de cabeçalho.');
      }

      return rows.map((row, index) => 
        this.mapRowToImportedTransaction(row, index, file.name, 'Page 1', index + headerRowIndex + 2)
      );
    } catch (error: any) {
      console.error('[IMPORT XLS ERROR]', error);
      throw new Error(`Erro ao processar planilha .xls: ${error.message}`);
    }
  },

  async parsePDF(file: File): Promise<ImportedTransaction[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/import-report', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao processar PDF via IA');
    }

    const result = await response.json();
    return result.data.map((item: any, index: number) => {
      const gross = item.valorBruto || item.amount || 0;
      const category = standardizeService(item.service || item.categoria || '');
      const net = item.valorLiquido || gross;
      const extractedPlaca = extractVehiclePlate(item.discriminacao || item.description) || item.placa || '';

      return {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        errors: [],
        warnings: [],
        validationMessages: [],
        date: item.date || item.data || '',
        placa: extractedPlaca ? extractedPlaca.toUpperCase().replace(/[^A-Z0-9]/g, '') : '',
        cliente: item.cliente || '',
        service: category,
        category: category,
        grossValue: gross,
        netValue: net,
        sourceFileName: file.name,
        sourceRowNumber: index + 1,
        rawData: item,
        auditLog: [],
        formaPagamento: item.formaPagamento || item.pagamento || 'Pix'
      };
    });
  }
};

