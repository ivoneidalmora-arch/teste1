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
    const keys = Object.keys(row);
    const getVal = (keywords: string[]) => {
      const foundKey = keys.find(k => {
        const lowerK = k.toLowerCase();
        return keywords.some(kw => lowerK.includes(kw.toLowerCase()));
      });
      return foundKey ? row[foundKey] : null;
    };

    // Tenta encontrar campos por palavras-chave
    const rawPlaca = getVal(['placa', 'veiculo', 'veículo']) || '';
    const rawData = getVal(['data', 'vistoria', 'periodo', 'período']) || '';
    const rawCliente = getVal(['cliente', 'proprietario', 'proprietário', 'nome', 'solicitante']) || '';
    const rawServico = getVal(['categoria', 'servico', 'serviço', 'tipo']) || 'Transferência';
    
    // Para o valor, tentamos ser mais específicos para evitar pegar campos errados
    const rawValor = getVal(['valorbruto', 'valor_bruto', 'valor total', 'total']) 
                  || getVal(['valor', 'preço', 'preco', 'amount']) 
                  || 0;

    return {
      data: normalizeDate(rawData),
      placa: normalizePlaca(String(rawPlaca)),
      cliente: capitalizeName(String(rawCliente)),
      categoria: String(rawServico),
      valorBruto: typeof rawValor === 'number' ? rawValor : parseFloat(String(rawValor).replace(/[R$\s]/g, '').replace(',', '.')),
      valorLiquido: 0,
      observacao: 'IMPORTADO VIA INGESTÃO INTELIGENTE'
    };
  }
};
