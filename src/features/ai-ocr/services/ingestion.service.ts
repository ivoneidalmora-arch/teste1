import * as XLSX from 'xlsx';
import { normalizePlaca, normalizeDate, capitalizeName } from '../utils/normalization';

export interface IngestionResult {
  data: string;
  placa: string;
  cliente: string;
  categoria: string;
  valorBruto: number;
  valorLiquido: number;
  observacao?: string;
}

export const ingestionService = {
  /**
   * Processa o documento identificando o formato automaticamente.
   */
  async processDocument(file: File): Promise<IngestionResult[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return this.parseExcel(file);
    } else if (extension === 'pdf') {
      return this.parsePDF(file);
    }

    throw new Error(`Formato .${extension} não suportado para ingestão inteligente.`);
  },

  /**
   * Parsing para Excel e CSV usando a biblioteca xlsx.
   */
  async parseExcel(file: File): Promise<IngestionResult[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Converte para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          // Mapeia para o formato padrão
          const normalized = jsonData.map(row => this.mapToStandard(row));
          resolve(normalized.filter(item => !!item.placa));
        } catch (err) {
          reject(new Error('Falha ao ler o arquivo Excel/CSV.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Parsing para PDF usando o fluxo de IA existente.
   */
  async parsePDF(file: File): Promise<IngestionResult[]> {
    const formData = new FormData();
    formData.append('file', file);

    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    const headers: Record<string, string> = {};
    if (savedKey) headers['x-api-key'] = savedKey;

    const response = await fetch('/api/import-report', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha no processamento da IA');
    }

    const data = await response.json();
    
    // Normaliza os dados vindos da IA também (Mapper Central)
    return data.map((item: any) => this.mapToStandard(item));
  },

  /**
   * Mapper Central: Normaliza qualquer objeto para o formato IngestionResult.
   */
  mapToStandard(row: any): IngestionResult {
    // Tenta encontrar campos por nomes comuns em planilhas
    const rawPlaca = row.placa || row.Placa || row.VEICULO || row.Veículo || '';
    const rawData = row.data || row.Data || row.VISTORIA || row.DATA || '';
    const rawCliente = row.cliente || row.Cliente || row.PROPRIETARIO || row.Proprietário || '';
    const rawServico = row.categoria || row.servico || row.Serviço || row.TIPO || 'Transferência';
    const rawValor = row.valorBruto || row.valor || row.VALOR || row.Preço || row.preco || 0;

    return {
      data: normalizeDate(rawData),
      placa: normalizePlaca(rawPlaca),
      cliente: capitalizeName(rawCliente),
      categoria: rawServico,
      valorBruto: typeof rawValor === 'number' ? rawValor : parseFloat(String(rawValor).replace(',', '.')),
      valorLiquido: 0, // Será calculado no salvamento ou via utilitário se necessário
      observacao: 'IMPORTADO VIA INGESTÃO INTELIGENTE'
    };
  }
};
