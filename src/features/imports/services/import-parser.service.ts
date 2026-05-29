import * as XLSX from 'xlsx';
import { ImportedTransaction } from '../types/import.types';
import { 
  normalizeRowKeys, 
  normalizeDate, 
  normalizeCurrency, 
  normalizeTransactionType, 
  standardizeService 
} from '../utils/import-utils';
import { calculateLiquido } from '@/core/utils/finance';
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
      
      // Verifica se o arquivo é na verdade um texto (HTML ou CSV) disfarçado de XLS
      // Arquivos binários reais (XLS/XLSX) têm muitos bytes nulos no início.
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

      // Step 1: Detect the actual header row by scanning the first 20 rows
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
          // If we find at least 2 recognizable columns, we assume this is the header row
          if (matches.length >= 2) {
            headerRowIndex = i;
            break;
          }
        }
      }

      // Step 2: Parse data using the detected header row
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        range: headerRowIndex,
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        throw new Error('A planilha não possui dados para importar após a linha de cabeçalho.');
      }

      // DEBUG: Enviar a primeira linha pro servidor para inspecionar
      try {
        fetch('/api/debug', {
          method: 'POST',
          body: JSON.stringify({
            headerRowIndex,
            firstRow: rows[0],
            rawRowSample: rawRows[headerRowIndex],
          })
        }).catch(() => {});
      } catch (e) {}

      return rows.map((row, index) => {
        const normalized = normalizeRowKeys(row);
        
        let amount = normalizeCurrency(normalized.amount);
        
        // Se a coluna não foi encontrada, varre todas as colunas da linha buscando algo com "R$"
        if (!amount) {
          for (const val of Object.values(row)) {
            if (typeof val === 'string' && (val.includes('R$') || /^\d+[.,]\d{2}$/.test(val.trim()))) {
              const testAmount = normalizeCurrency(val);
              if (testAmount) {
                amount = testAmount;
                break;
              }
            }
          }
        }
        
        const date = normalizeDate(normalized.date);
        const description = String(normalized.description || normalized.service || normalized.category || '').trim();
        const category = standardizeService(normalized.category || normalized.service || 'Transferência');

        let clienteStr = String(normalized.client || 'AVULSO').toUpperCase();
        // Corrige erro crasso de exportação do sistema origem (Windows-1252 com falha dupla ou erro de digitação do perito)
        clienteStr = clienteStr.replace(/S[Ïï]\s*MATEU[S]?/ig, 'SÃO MATEUS').replace(/S[Ïï]/ig, 'SÃO');

        return {
          id: `row-${index}-${Math.random().toString(36).substr(2, 5)}`,
          date: date ? format(date, 'yyyy-MM-dd') : '',
          placa: (normalized.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
          cliente: clienteStr,
          service: category,
          category: category,
          grossValue: amount || 0,
          netValue: category === 'Vistoria Cautelar' ? (amount || 0) : calculateLiquido(amount || 0),
          status: 'pending',
          validationMessages: [],
          description: description
        };
      });
    } catch (error: any) {
      console.error('[IMPORT ERROR]', error);
      throw new Error(`Erro ao processar planilha: ${error.message}`);
    }
  },

  async parsePDF(file: File): Promise<ImportedTransaction[]> {
    // Reuse existing AI-OCR logic for PDF
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
    return result.data.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      validationMessages: [],
      date: item.date || item.data || '',
      placa: item.placa || '',
      cliente: item.cliente || '',
      service: item.service || item.categoria || '',
      category: item.categoria || item.service || '',
      grossValue: item.valorBruto || item.amount || 0,
      netValue: item.valorLiquido || item.netAmount || 0,
    }));
  }
};
