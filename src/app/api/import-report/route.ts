import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const logs: string[] = [];
    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      logs.push(`[${time}] ${msg}`);
      console.log(`[IA-LOG] ${msg}`);
    };

    addLog('Iniciando processamento...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      addLog('ERRO: Arquivo não enviado.');
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }

    addLog(`Arquivo: ${file.name} (${file.size} bytes)`);

    const openRouterKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const openRouterUrl = process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');
    addLog('Base64 gerado com Buffer.');

    const prompt = `Você é um robô de extração de dados de ALTA PRECISÃO e EXAUSTIVIDADE.
    Sua missão é extrair ABSOLUTAMENTE TODAS as vistorias do "Relatório de Conta Mensal - Veículos Realizados".
    
    REGRAS CRÍTICAS (NÃO NEGOCIÁVEIS):
    1. EXAUSTIVIDADE TOTAL: Se o relatório tiver 100, 200 ou 500 vistorias, você deve extrair TODAS. 
    2. NÃO PULE NENHUMA LINHA. Não resuma. Não pare na metade.
    3. Percorra TODAS as páginas do documento.
    4. Ignore cabeçalhos, mas leia todas as linhas numeradas da tabela.
    
    MAPEAMENTO:
    - Data: Coluna "Data" (converter para YYYY-MM-DD).
    - Placa: Coluna "Placa".
    - Cliente: Coluna "Cliente".
    - Serviço: Coluna "Serviço".
    - Preço: Coluna "Preço" (valor numérico).
    
    RETORNO:
    - Retorne APENAS o array JSON. 
    - Sem textos explicativos. 
    - Formato: [{"data":"...","placa":"...","cliente":"...","categoria":"...","valorBruto":0.0}]`;

    let responseText = '';
    let openRouterError = '';

    // --- DIAGNÓSTICO: LISTAR MODELOS DISPONÍVEIS (GOOGLE) ---
    if (geminiKey) {
      try {
        addLog('Consultando permissões da chave Google (ListModels)...');
        const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();
        const availableModels = listData.models?.map((m: any) => m.name.split('/').pop()) || [];
        addLog(`Modelos disponíveis na sua chave: ${availableModels.join(', ') || 'NENHUM'}`);
      } catch (e) {
        addLog('Falha ao listar modelos do Google.');
      }
    }

    // --- TENTATIVA 1: OPENROUTER ---
    if (openRouterKey) {
      try {
        addLog('Tentando OpenRouter (Gemini 2.0 Flash)...');
        const response = await fetch(`${openRouterUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://teste1-woad-ten.vercel.app',
            'X-Title': 'Sistema de Vistorias',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            max_tokens: 8192,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url', 
                  image_url: { url: `data:${file.type};base64,${base64Data}` } 
                }
              ]
            }]
          })
        });

        const data = await response.json();
        addLog(`OpenRouter Status: ${response.status}`);
        if (response.ok && data.choices?.[0]?.message?.content) {
          responseText = data.choices[0].message.content;
          addLog('Sucesso via OpenRouter!');
        } else {
          openRouterError = data.error?.message || JSON.stringify(data.error) || response.statusText;
          addLog(`OpenRouter falhou: ${openRouterError}`);
        }
      } catch (err: any) {
        openRouterError = err.message;
        addLog(`OpenRouter erro de rede: ${err.message}`);
      }
    }

    // --- TENTATIVA 2: GOOGLE AI STUDIO ---
    if (!responseText && geminiKey) {
      try {
        addLog('Tentando Google AI Studio (Gemini 2.0 Flash)...');
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${geminiKey}`;
        
        const response = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.1
            }
          })
        });

        const data = await response.json();
        addLog(`Google Status: ${response.status}`);
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
          addLog('Sucesso via Google!');
        } else {
          const googleErr = data.error?.message || JSON.stringify(data.error) || response.statusText;
          addLog(`Google falhou: ${googleErr}`);
          throw new Error(googleErr);
        }
      } catch (err: any) {
        addLog(`Erro final: ${err.message}`);
        throw new Error(`[RASTREAMENTO]\n${logs.join('\n')}\n\nErro Final: ${err.message}`);
      }
    }

    if (!responseText) {
      addLog('ERRO: Nenhum provedor disponível.');
      throw new Error(`[RASTREAMENTO]\n${logs.join('\n')}\n\nNenhum provedor disponível.`);
    }

    try {
      addLog('Iniciando parsing do JSON...');
      let cleanText = responseText.replace(/```json|```/g, '').trim();
      
      // Remove possíveis reticências se a resposta foi truncada
      cleanText = cleanText.replace(/\.\.\.\s*$/, '').trim();
      if (cleanText.endsWith(',') || cleanText.endsWith(',]')) {
        cleanText = cleanText.replace(/,\]?$/, ']');
      }
      if (!cleanText.endsWith(']')) cleanText += ']';

      const jsonMatch = cleanText.match(/(\[[\s\S]*\])/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
      
      let rawData = JSON.parse(jsonString);
      if (!Array.isArray(rawData)) rawData = [rawData];

      // NORMALIZAÇÃO DE CAMPOS (IA às vezes capitaliza ou muda nomes)
      const data = rawData.map((item: any) => {
        const normalized: any = {
          data: item.data || item.Data || new Date().toISOString().split('T')[0],
          placa: item.placa || item.Placa || '',
          cliente: item.cliente || item.Cliente || '',
          categoria: item.categoria || item.Categoria || item.serviço || item.Serviço || 'Transferência',
          valorBruto: parseFloat(String(item.valorBruto || item.ValorBruto || item.preço || item.Preço || '0').replace(',', '.')),
          valorLiquido: parseFloat(String(item.valorLiquido || item.ValorLiquido || '0').replace(',', '.'))
        };

        // Mapeamento extra de categorias com base no serviço lido
        if (normalized.categoria.toUpperCase().includes('COMPLETA')) normalized.categoria = 'Transferência';
        if (normalized.categoria.toUpperCase().includes('SIMPLIFICADA')) normalized.categoria = 'Vistoria de Entrada';
        
        return normalized;
      });

      addLog(`Parsing concluído. ${data.length} itens normalizados.`);
      return NextResponse.json(data);
    } catch (e: any) {
      addLog(`ERRO no parsing: ${e.message}`);
      return NextResponse.json({ 
        error: 'Erro ao processar JSON da IA.', 
        details: responseText,
        logs: logs,
        parseError: e.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro no processamento IA:', error);
    return NextResponse.json({ error: error.message || 'Falha ao processar com IA' }, { status: 500 });
  }
}
