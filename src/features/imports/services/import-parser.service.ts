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
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellDates: true,
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        throw new Error('A planilha não possui dados para importar.');
      }

      return rows.map((row, index) => {
        const normalized = normalizeRowKeys(row);
        
        const date = normalizeDate(normalized.date);
        const amount = normalizeCurrency(normalized.amount);
        const description = String(normalized.description || normalized.service || normalized.category || '').trim();
        const category = standardizeService(normalized.category || normalized.service || 'Transferência');

        return {
          id: `row-${index}-${Math.random().toString(36).substr(2, 5)}`,
          date: date ? format(date, 'yyyy-MM-dd') : '',
          placa: (normalized.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
          cliente: String(normalized.client || 'AVULSO').toUpperCase(),
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
