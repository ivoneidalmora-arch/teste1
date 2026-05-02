import * as XLSX from 'xlsx';
import { normalizePlaca, normalizeDate, capitalizeName } from '../utils/normalization';
import { calculateLiquido } from '@/core/utils/finance';

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
  async parseExcel(file: File): Promise<{ data: IngestionResult[], rawResponse: string, logs: string[] }> {
    return new Promise((resolve, reject) => {
      const logs: string[] = [];
      const addLog = (msg: string) => logs.push(msg);
      
      addLog(`Iniciando leitura de arquivo Excel: ${file.name}`);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          // Lemos SEM cellDates para evitar que a biblioteca inverta dia/mês baseada no locale
          // Lemos SEM raw para deixar o XLSX processar números e datas se possível
          const workbook = XLSX.read(data, { type: 'array', cellNF: true, cellText: true, cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          addLog(`Planilha lida: ${firstSheetName}`);

          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          addLog(`Total de linhas encontradas: ${rows.length}`);
          
          // Log das primeiras 5 linhas para diagnóstico
          rows.slice(0, 5).forEach((row, idx) => {
            addLog(`DEBUG: Linha ${idx + 1} = ${JSON.stringify(row)}`);
          });
          
          let headerIndex = 0;
          let maxMatches = 0;
          const headerKeywords = ['placa', 'data', 'cliente', 'preco', 'valor', 'servico', 'tipo', 'veiculo'];

          const stripHtml = (html: string) => String(html || '').replace(/<[^>]*>?/gm, '');

          for (let i = 0; i < Math.min(rows.length, 50); i++) {
            const row = rows[i];
            if (!row || !Array.isArray(row)) continue;
            const rowStr = row.map(c => stripHtml(String(c)).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")).join('|');
            
            const matches = headerKeywords.filter(kw => rowStr.includes(kw)).length;
            if (matches > maxMatches) {
              maxMatches = matches;
              headerIndex = i;
            }
          }

          addLog(`Header identificado na linha ${headerIndex + 1} com ${maxMatches} correspondências.`);
          addLog(`Conteúdo do Header: ${JSON.stringify(rows[headerIndex])}`);

          const headers = rows[headerIndex].map(h => {
            const s = stripHtml(String(h || '')).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (s.includes('data')) return 'data';
            if (s.includes('placa')) return 'placa';
            if (s.includes('cliente')) return 'cliente';
            if (s.includes('servi') || s.includes('tipo') || s.includes('vistoria') || s.includes('descricao')) return 'servico';
            if (s.includes('valor') || s.includes('pre') || s.includes('total') || s.includes('bruto') || s.includes('r$')) return 'preco';
            return null;
          });

          addLog(`Colunas identificadas: ${headers.filter(h => h).join(', ')}`);
          addLog(`Colunas originais: ${rows[headerIndex].join(' | ')}`);

          const jsonData = rows.slice(headerIndex + 1)
            .filter(row => row.length > 0)
            .map((row, i) => {
               const obj: any = {};
               headers.forEach((header, index) => {
                 if (header) {
                   const val = row[index];
                   addLog(`Linha ${i+1} [${header}]: Bruto = "${val}"`);
                   obj[header] = val;
                 }
               });
               return obj;
            });
          
          const normalized = jsonData.map(row => this.mapToStandard(row));
          const filtered = normalized.filter(item => !!item.placa && item.placa !== 'undefined');
          
          addLog(`Sucesso: ${filtered.length} itens normalizados.`);
          
          resolve({
            data: filtered,
            rawResponse: 'Dados processados localmente (Excel/XLSX)',
            logs: logs
          });
        } catch (err: any) {
          addLog(`ERRO: ${err.message}`);
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
  async parsePDF(file: File): Promise<any> {
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

    const apiData = await response.json();
    
    // Normaliza os dados vindos da IA também (Mapper Central)
    const normalized = apiData.data.map((item: any) => this.mapToStandard(item));
    
    return {
      data: normalized,
      rawResponse: apiData.rawResponse,
      logs: apiData.logs
    } as any;
  },

  /**
   * Mapper Central: Normaliza qualquer objeto para o formato IngestionResult.
   */
  mapToStandard(row: any): IngestionResult {
    const keys = Object.keys(row);
    
    const stripHtml = (html: string) => String(html || '').replace(/<[^>]*>?/gm, '');

    // Função auxiliar para buscar valor por palavras-chave com busca mais agressiva
    const getVal = (keywords: string[]) => {
      const foundKey = keys.find(k => {
        const cleanK = stripHtml(k).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return keywords.some(kw => {
          const cleanKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          return cleanK === cleanKw || cleanK.includes(cleanKw);
        });
      });
      return foundKey ? row[foundKey] : undefined;
    };

    // Tenta encontrar campos por palavras-chave
    const rawPlaca = getVal(['placa', 'veiculo', 'carro']) ?? '';
    const rawData = getVal(['data', 'vistoria', 'dia', 'periodo']) ?? '';
    let rawCliente = getVal(['cliente', 'proprietario', 'nome', 'solicitante']) ?? '';
    
    // Padroniza cliente específico
    if (typeof rawCliente === 'string' && rawCliente.toUpperCase().includes('PARTICULAR S')) {
       rawCliente = 'PARTICULAR';
    }

    let rawServico = getVal(['categoria', 'servi', 'servico', 'tipo', 'item', 'descricao', 'produto', 'laudo', 'vistoria']);
    
    // Fallback para serviço: se não achou a coluna pelo título, procura em todas as colunas de texto da linha
    // as palavras exatas que o usuário pediu ("completo", "simplificada", "retorno")
    if (!rawServico) {
      for (const key of keys) {
        const val = String(row[key] || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (val.includes('completo') || val.includes('simplificada') || val.includes('retorno') || val.includes('transferencia')) {
          rawServico = row[key];
          break;
        }
      }
    }
    
    if (!rawServico) rawServico = ''; // Removido default fixo aqui para pegar do standardizedService

    
    // Padroniza os nomes dos serviços conforme a regra de negócios
    const standardizeService = (raw: string) => {
      const s = String(raw).trim();
      const normalized = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (normalized.includes('completo') || normalized.includes('transferencia')) return 'Transferência';
      if (normalized.includes('simplificada') || normalized.includes('entrada')) return 'Vistoria de Entrada';
      if (normalized.includes('retorno')) return 'Vistoria de Retorno';
      if (normalized.includes('saida')) return 'Vistoria de Saída';
      if (normalized.includes('cautelar')) return 'Vistoria Cautelar';
      
      // Se não bateu com nenhum padrão, retorna o texto original capitalizado
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };

    
    // Busca específica por preço/valor
    let rawValor = getVal(['pre', 'preco', 'preço', 'valorbruto', 'valor_bruto', 'valor', 'total', 'amount', 'r$', 'custo', 'pagamento', 'tarifa', 'receita']);
    
    // Fallback: se não encontrou o valor pela chave, busca a ÚLTIMA coluna que seja um número (geralmente o preço fica no final)
    if (rawValor === undefined || rawValor === null || rawValor === 0) {
      const reverseKeys = [...keys].reverse();
      for (const key of reverseKeys) {
        const val = row[key];
        const strVal = String(val).replace(/[^\d.,]/g, '');
        // Se parece com um número ou moeda, e não é a placa nem a data
        if (strVal && strVal !== '0' && !key.toLowerCase().includes('data') && !key.toLowerCase().includes('placa') && !key.toLowerCase().includes('veiculo')) {
           // Checa se realmente é um número válido e não um ID longo (preços normalmente são menores que 1.000.000)
           const testNum = parseFloat(strVal.replace(',', '.'));
           if (!isNaN(testNum) && testNum > 0 && testNum < 1000000) {
             rawValor = val;
             break;
           }
        }
      }
    }

    if (rawValor === undefined || rawValor === null) {
      rawValor = 0;
    }

    const parseCurrency = (val: any) => {
      if (typeof val === 'number') return val;
      const s = String(val).trim();
      if (!s || s === '0') return 0;
      
      // Remove R$, espaços e símbolos, mantendo apenas dígitos, vírgula e ponto
      const clean = s.replace(/[^\d.,]/g, '');
      
      // Lógica de separador:
      // Caso 1: Tem vírgula e ponto (1.234,56)
      if (clean.includes(',') && clean.includes('.')) {
        return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
      } 
      // Caso 2: Tem apenas vírgula (1234,56 ou 1.250)
      else if (clean.includes(',')) {
        return parseFloat(clean.replace(',', '.'));
      }
      // Caso 3: Tem apenas ponto (1234.56 ou 1.234)
      else if (clean.includes('.')) {
        const parts = clean.split('.');
        // Se a parte após o ponto tem 3 dígitos, provavelmente é separador de milhar (ex: 1.250)
        // A menos que seja algo como 10.50 (que é incomum para IA/Excel sem vírgula)
        if (parts[parts.length - 1].length === 3) {
          return parseFloat(clean.replace(/\./g, ''));
        }
        return parseFloat(clean);
      }
      
      return parseFloat(clean);
    };

    const valorNumerico = parseCurrency(rawValor);

    return {
      data: normalizeDate(rawData),
      placa: normalizePlaca(String(rawPlaca)),
      cliente: capitalizeName(String(rawCliente)),
      categoria: standardizeService(String(rawServico)),
      valorBruto: isNaN(valorNumerico) ? 0 : valorNumerico,
      valorLiquido: (standardizeService(String(rawServico)) === 'Vistoria Cautelar') 
        ? valorNumerico 
        : calculateLiquido(valorNumerico),
      observacao: 'IMPORTADO VIA INGESTÃO INTELIGENTE'
    };
  }
};
