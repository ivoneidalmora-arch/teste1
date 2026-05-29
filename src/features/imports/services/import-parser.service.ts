import * as XLSX from 'xlsx';
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
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      
      let isText = true;
      for (let i = 0; i < Math.min(1024, uint8.length); i++) {
        if (uint8[i] === 0) {
          isText = false;
          break;
        }
      }

      let workbook: XLSX.WorkBook;
      
      if (isText) {
        let text = '';
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer);
        } catch (e) {
          text = new TextDecoder('windows-1252').decode(arrayBuffer);
        }
        workbook = XLSX.read(text, { type: 'string', cellDates: true, raw: true });
      } else {
        workbook = XLSX.read(arrayBuffer, {
          type: 'array',
          cellDates: true,
          codepage: 1252
        });
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
      let headerRowIndex = 0;
      
      for (let i = 0; i < Math.min(20, rawRows.length); i++) {
        const row = rawRows[i];
        if (Array.isArray(row)) {
          const matches = row.filter(cell => {
            if (!cell) return false;
            const str = String(cell).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            return ['data', 'placa', 'valor', 'cliente', 'servico', 'categoria', 'amount', 'date', 'veiculo'].some(h => str.includes(h));
          });
          if (matches.length >= 2) {
            headerRowIndex = i;
            break;
          }
        }
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        range: headerRowIndex,
        defval: "",
        raw: false,
      });

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
        
        if (amount === null || amount === 0) {
          for (const val of Object.values(row)) {
            if (typeof val === 'string' && (val.includes('R$') || /^\d+[.,]\d{2}$/.test(val.trim()))) {
              const testAmount = parseCurrencyBR(val);
              if (testAmount !== null && testAmount !== 0) {
                amount = testAmount;
                break;
              }
            } else if (typeof val === 'number') {
              // Nível hard: Se o excel ler o valor como número nativo e não for uma data serial (40k-50k = anos 2009 a 2036)
              if (val > 0 && (val < 40000 || val > 50000)) {
                amount = val;
                break;
              }
            }
          }
        }
        
        const dateObj = parseBrazilianDate(rawDateStr);
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
          rawDate: rawDateStr,
          rawValorBruto: rawValorBrutoStr,
          rawValorLiquido: rawValorLiquidoStr,
          rawClient: rawClientStr
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
    return result.data.map((item: any) => {
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
      };
    });
  }
};
