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

    const prompt = `Você é um robô de extração de dados especializado no "Relatório de Conta Mensal - Veículos Realizados".
    
    ESTRUTURA DO DOCUMENTO:
    O documento contém uma tabela com as colunas: Nrº, Data, Modelo, Ano Fab., Cor, Chassi, Placa, Cliente, Serviço, Perito, Digitador, FP, Preço, Preço Sug.
    
    REGRAS DE EXTRAÇÃO (SIGA À RISCA):
    1. Localize a tabela de veículos. Cada linha numerada é uma vistoria.
    2. Coluna "Data": Converta do formato DD/MM/YYYY para YYYY-MM-DD.
    3. Coluna "Placa": Extraia exatamente o texto da coluna Placa (ex: RDL1C32).
    4. Coluna "Cliente": Extraia o nome do cliente (ex: ORVEL).
    5. Coluna "Serviço": Extraia o texto (ex: COMPLETA FIXA MÉDIO).
    6. Coluna "Preço": Extraia o valor numérico antes do "Preço Sug.". Converta vírgula para ponto (ex: 177,79 -> 177.79). Ignore o "R$".
    
    MAPEAMENTO DE CATEGORIAS:
    - Se o Serviço contiver "COMPLETA", use: "Transferência"
    - Se o Serviço contiver "SIMPLIFICADA", use: "Vistoria de Entrada"
    - Para outros, use o nome que estiver no campo serviço.
    
    RETORNO:
    - Retorne APENAS um array JSON de objetos.
    - Se não houver dados reais, retorne [].
    - NUNCA invente dados.`;

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

    // --- TENTATIVA 1: OPENROUTER (Gemini Flash 1.5 - Via OpenRouter) ---
    if (openRouterKey) {
      try {
        addLog('Tentando OpenRouter (google/gemini-flash-1.5)...');
        const response = await fetch(`${openRouterUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://teste1-woad-ten.vercel.app',
            'X-Title': 'Sistema de Vistorias',
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
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

    // --- TENTATIVA 2: GOOGLE AI STUDIO (Direct Fetch) ---
    if (!responseText && geminiKey) {
      try {
        addLog('Tentando Google AI Studio (Direct Fetch)...');
        // Tenta gemini-1.5-flash ou o primeiro disponível se houver erro
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
        const response = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type, data: base64Data } }
              ]
            }]
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
      const cleanText = responseText.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
      
      let data = JSON.parse(jsonString);
      
      if (!Array.isArray(data) && typeof data === 'object') {
        const potentialArray = Object.values(data).find(val => Array.isArray(val));
        data = potentialArray || [data];
      }

      addLog(`Parsing concluído. ${Array.isArray(data) ? data.length : 1} itens encontrados.`);
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
