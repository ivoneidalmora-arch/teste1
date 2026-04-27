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
    
    // Função auxiliar para buscar valor por palavras-chave
    const getVal = (keywords: string[]) => {
      const foundKey = keys.find(k => {
        const lowerK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove acentos
        return keywords.some(kw => {
          const lowerKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return lowerK.includes(lowerKw);
        });
      });
      return foundKey ? row[foundKey] : undefined;
    };

    // Tenta encontrar campos por palavras-chave
    const rawPlaca = getVal(['placa', 'veiculo', 'veiculo']) ?? '';
    const rawData = getVal(['data', 'vistoria', 'periodo', 'periodo']) ?? '';
    const rawCliente = getVal(['cliente', 'proprietario', 'proprietario', 'nome', 'solicitante']) ?? '';
    const rawServico = getVal(['categoria', 'servico', 'servico', 'tipo']) ?? 'Transferência';
    
    // Prioridade total para "Preço" ou termos de valor
    let rawValor = getVal(['preco', 'valorbruto', 'valor_bruto', 'valor total', 'total']);
    if (rawValor === undefined) rawValor = getVal(['valor', 'amount']);
    if (rawValor === undefined) rawValor = 0;

    // Log para depuração em caso de valor zero (visível no console do navegador)
    if (Number(rawValor) === 0) {
      console.warn('[Ingestion] Valor extraído como zero. Chaves disponíveis:', keys, 'Linha:', row);
    }

    const parseCurrency = (val: any) => {
      if (typeof val === 'number') return val;
      const s = String(val).trim();
      if (!s) return 0;
      
      // Remove R$, espaços e outros símbolos não numéricos, exceto ponto e vírgula
      const clean = s.replace(/[R$\s]/g, '');
      
      // Se tiver vírgula e ponto, ou apenas vírgula, tratamos como formato BR
      if (clean.includes(',')) {
        return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
      }
      
      // Caso contrário, tenta parse direto (formato US ou simples)
      return parseFloat(clean);
    };

    const valorNumerico = parseCurrency(rawValor);

    return {
      data: normalizeDate(rawData),
      placa: normalizePlaca(String(rawPlaca)),
      cliente: capitalizeName(String(rawCliente)),
      categoria: String(rawServico),
      valorBruto: isNaN(valorNumerico) ? 0 : valorNumerico,
      valorLiquido: 0,
      observacao: 'IMPORTADO VIA INGESTÃO INTELIGENTE'
    };
  }
};
