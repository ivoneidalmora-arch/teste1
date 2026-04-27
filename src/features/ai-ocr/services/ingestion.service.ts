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
          
          // Extraímos como array de arrays para encontrar o cabeçalho dinamicamente
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // Encontrar a linha que parece ser o cabeçalho (contém 'placa', 'preco', 'data', etc)
          let headerIndex = -1;
          for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const row = rows[i];
            if (!row || !Array.isArray(row)) continue;
            const rowStr = row.join('|').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (rowStr.includes('placa') || rowStr.includes('preco') || rowStr.includes('valor')) {
              headerIndex = i;
              break;
            }
          }

          if (headerIndex === -1) {
             // Fallback: assume a primeira linha se não encontrar nada óbvio
             headerIndex = 0;
          }

          // Pegamos os nomes das colunas da linha de cabeçalho
          const headers = rows[headerIndex].map(h => String(h || '').trim());
          
          // Processamos o restante das linhas transformando em objetos
          const jsonData = rows.slice(headerIndex + 1)
            .filter(row => row.length > 0)
            .map(row => {
               const obj: any = {};
               headers.forEach((header, index) => {
                 if (header) obj[header] = row[index];
               });
               return obj;
            });
          
          // Mapeia para o formato padrão
          const normalized = jsonData.map(row => this.mapToStandard(row));
          resolve(normalized.filter(item => !!item.placa && item.placa !== 'undefined'));
        } catch (err) {
          console.error(err);
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
    
    // Função auxiliar para buscar valor por palavras-chave com busca mais agressiva
    const getVal = (keywords: string[]) => {
      const foundKey = keys.find(k => {
        const lowerK = k.toLowerCase().trim();
        // Remove acentos manualmente para ser mais robusto
        const cleanK = lowerK.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return keywords.some(kw => {
          const cleanKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return cleanK.includes(cleanKw) || cleanKw.includes(cleanK);
        });
      });
      return foundKey ? row[foundKey] : undefined;
    };

    // Tenta encontrar campos por palavras-chave
    const rawPlaca = getVal(['placa', 'veiculo', 'carro']) ?? '';
    const rawData = getVal(['data', 'vistoria', 'dia', 'periodo']) ?? '';
    const rawCliente = getVal(['cliente', 'proprietario', 'nome', 'solicitante']) ?? '';
    const rawServico = getVal(['categoria', 'servico', 'tipo', 'item']) ?? 'Transferência';
    
    // Busca exaustiva por preço/valor
    let rawValor = getVal(['preco', 'preço', 'valor', 'total', 'bruto', 'montante', 'r$', 'amount']);
    
    // Se ainda não encontrou, tenta pegar qualquer coluna que tenha um número e não seja a placa
    if (rawValor === undefined || rawValor === null || rawValor === 0 || rawValor === '') {
      for (const key of keys) {
        const val = row[key];
        if (typeof val === 'number' && val > 0 && !key.toLowerCase().includes('data') && !key.toLowerCase().includes('placa')) {
          rawValor = val;
          break;
        }
      }
    }

    if (rawValor === undefined) rawValor = 0;

    const parseCurrency = (val: any) => {
      if (typeof val === 'number') return val;
      const s = String(val).trim();
      if (!s || s === '0') return 0;
      
      // Remove R$, espaços e símbolos, mantendo apenas dígitos, vírgula e ponto
      const clean = s.replace(/[^\d.,]/g, '');
      
      if (clean.includes(',') && clean.includes('.')) {
        // Formato 1.234,56
        return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
      } else if (clean.includes(',')) {
        // Formato 1234,56
        return parseFloat(clean.replace(',', '.'));
      }
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
