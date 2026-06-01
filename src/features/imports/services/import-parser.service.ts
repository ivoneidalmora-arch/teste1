import ExcelJS from 'exceljs';
import { ImportedTransaction } from '../types/import.types';
import { 
  getValueByAliases,
  COLUMN_ALIASES,
  parseBrazilianDate, 
  parseCurrencyBR, 
  normalizeClientName,
  standardizeService 
} from '../utils/import-utils';
import { calculateLiquido } from '@/core/utils/finance';
import { getNetValueFor2025, shouldApplyAutoNetValue } from '@/lib/financial-rules';
import { format } from 'date-fns';

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
      if (extension === 'xls') {
         throw new Error('Formato .xls legado não é suportado por segurança. Por favor, salve como .xlsx e tente novamente.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      
      if (extension === 'csv') {
         const text = await file.text();
         // Basic CSV parsing using ExcelJS (might need buffer hack in some environments, but let's try raw parsing or custom)
         // In browsers, it's safer to just do a basic split for CSV if exceljs fails, but let's use the standard xlsx first.
         throw new Error('Para importar CSV, por favor salve como .xlsx no Excel antes de importar.');
      } else {
         await workbook.xlsx.load(arrayBuffer);
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('A planilha está vazia.');
      }

      const rows: Record<string, unknown>[] = [];
      let headerRowIndex = 1;
      let headers: string[] = [];

      // Find header row (up to first 20 rows)
      for (let i = 1; i <= Math.min(20, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const cellValues: string[] = [];
        row.eachCell((cell) => {
          cellValues.push(cell.text || cell.value?.toString() || '');
        });

        const matches = cellValues.filter(cell => {
          const str = String(cell).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          return ['data', 'placa', 'valor', 'cliente', 'servico', 'categoria', 'amount', 'date', 'veiculo'].some(h => str.includes(h));
        });

        if (matches.length >= 2) {
          headerRowIndex = i;
          headers = cellValues;
          break;
        }
      }

      if (headers.length === 0) {
        throw new Error('Não foi possível identificar o cabeçalho da planilha.');
      }

      // Read data rows
      for (let i = headerRowIndex + 1; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const rowData: Record<string, unknown> = {};
        let hasData = false;
        
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1] || `col_${colNumber}`;
          let val: any = cell.value;
          if (val && typeof val === 'object' && val.result !== undefined) {
             val = val.result; // Handle formulas
          } else if (val && typeof val === 'object' && val.text !== undefined) {
             val = val.text; // Handle rich text
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

      return rows.map((row, index) => {
        const rawValorBrutoStr = String(getValueByAliases(row, COLUMN_ALIASES.valorBruto) || '');
        const rawDateStr = String(getValueByAliases(row, COLUMN_ALIASES.data) || '');
        const rawClientStr = String(getValueByAliases(row, COLUMN_ALIASES.cliente) || '');
        const rawValorLiquidoStr = String(getValueByAliases(row, COLUMN_ALIASES.valorLiquido) || '');
        
        let amount = parseCurrencyBR(rawValorBrutoStr);
        const parsedRawLiquido = parseCurrencyBR(rawValorLiquidoStr);
        
        // Tratar valores numéricos puros (ExcelJS retorna números reais, não precisa de parseCurrencyBR)
        if (amount === null || amount === 0) {
           const val = getValueByAliases(row, COLUMN_ALIASES.valorBruto);
           if (typeof val === 'number') amount = val;
        }

        let dateObj = parseBrazilianDate(rawDateStr);
        // Tratar datas nativas do ExcelJS
        const rawDateVal = getValueByAliases(row, COLUMN_ALIASES.data);
        if (rawDateVal instanceof Date) {
           dateObj = rawDateVal;
        }

        const descriptionStr = String(getValueByAliases(row, COLUMN_ALIASES.description) || 
                                      getValueByAliases(row, COLUMN_ALIASES.servico) || '').trim();
                                      
        const rawCategory = String(getValueByAliases(row, COLUMN_ALIASES.servico) || 'Transferência');
                                   
        const category = standardizeService(rawCategory);

        const clienteStr = normalizeClientName(rawClientStr || 'AVULSO');
        
        const rawPlaca = String(getValueByAliases(row, COLUMN_ALIASES.placa) || '');

        let netValue = category === 'Vistoria Cautelar' ? (amount ?? 0) : calculateLiquido(amount ?? 0);
        
        if (category !== 'Vistoria Cautelar' && amount !== null) {
          const autoNetValue = dateObj ? getNetValueFor2025(amount, dateObj) : null;
          if (autoNetValue !== null) {
            if (parsedRawLiquido !== null && parsedRawLiquido > 0 && !shouldApplyAutoNetValue(parsedRawLiquido, amount)) {
              netValue = parsedRawLiquido;
            } else {
              netValue = autoNetValue;
            }
          } else if (parsedRawLiquido !== null && parsedRawLiquido > 0) {
            netValue = parsedRawLiquido;
          }
        }

        return {
          id: `row-${index}-${Math.random().toString(36).substr(2, 5)}`,
          date: dateObj ? format(dateObj, 'yyyy-MM-dd') : '',
          placa: rawPlaca.toUpperCase().replace(/[^A-Z0-9]/g, ''),
          cliente: clienteStr,
          service: category,
          category: category,
          grossValue: amount ?? 0,
          netValue,
          status: 'pending',
          errors: [],
          warnings: [],
          validationMessages: [],
          description: descriptionStr,
          rawDate: rawDateVal instanceof Date ? format(rawDateVal, 'dd/MM/yyyy') : rawDateStr,
          rawValorBruto: rawValorBrutoStr || String(amount || ''),
          rawValorLiquido: rawValorLiquidoStr || String(parsedRawLiquido || ''),
          rawClient: rawClientStr,
          sourceFileName: file.name,
          sourceSheetName: worksheet.name,
          sourceRowNumber: index + headerRowIndex + 1,
          rawData: row,
          auditLog: [],
          formaPagamento: String(getValueByAliases(row, COLUMN_ALIASES.paymentMethod) || 'Pix')
        };
      });
    } catch (error: any) {
      console.error('[IMPORT ERROR]', error);
      throw new Error(`Erro ao processar planilha: ${error.message}`);
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
      const dateObj = parseBrazilianDate(item.date || item.data || '');
      const category = standardizeService(item.service || item.categoria || '');
      
      let net = item.valorLiquido || item.netAmount || 0;
      if (category !== 'Vistoria Cautelar' && gross > 0) {
        const autoNetValue = dateObj ? getNetValueFor2025(gross, dateObj) : null;
        if (autoNetValue !== null) {
          if (net > 0 && !shouldApplyAutoNetValue(net, gross)) {
            // manter valor manual
          } else {
            net = autoNetValue;
          }
        } else if (!net || net === gross) {
          net = calculateLiquido(gross);
        }
      } else if (category === 'Vistoria Cautelar') {
        net = gross;
      }

      return {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        errors: [],
        warnings: [],
        validationMessages: [],
        date: item.date || item.data || '',
        placa: item.placa || '',
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
