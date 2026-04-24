import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

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
    addLog('Base64 gerado.');

    const prompt = `Você é um robô de extração de dados especializado em "Relatórios de Conta Mensal" de vistorias veiculares.
    
    INSTRUÇÕES CRÍTICAS:
    1. Analise a TABELA do documento. Procure por colunas como "Placa", "Serviço", "Cliente", "Data" e "Preço".
    2. Extraia APENAS dados REAIS que estão no documento. 
    3. SE NÃO ENCONTRAR NENHUMA LINHA COM PLACA, RETORNE UM ARRAY VAZIO: [].
    4. JAMAIS invente nomes como "João da Silva" ou "José Ferreira" se eles não estiverem no papel.
    
    MAPEAMENTO DE CATEGORIAS:
    - Se o serviço for "COMPLETA FIXA" ou "COMPLETA", use: "Transferência"
    - Se o serviço for "SIMPLIFICADA", use: "Vistoria de Entrada"
    - Para outros, use o nome que estiver no campo serviço.
    
    FORMATO DE SAÍDA:
    Retorne APENAS um array JSON de objetos com estes campos:
    - data (YYYY-MM-DD)
    - placa
    - cliente
    - categoria
    - valorBruto (número)
    - valorLiquido (número)
    
    NÃO inclua nenhuma explicação, apenas o array JSON.`;

    let responseText = '';
    let openRouterError = '';

    // --- TENTATIVA 1: OPENROUTER ---
    if (openRouterKey) {
      try {
        addLog('Tentando OpenRouter (Claude 3 Haiku)...');
        const response = await fetch(`${openRouterUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://teste1-woad-ten.vercel.app',
            'X-Title': 'Sistema de Vistorias',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { image_url: { url: `data:${file.type};base64,${base64Data}` } }
              ]
            }]
          })
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          responseText = data.choices[0].message.content;
          addLog('Sucesso via OpenRouter.');
        } else {
          openRouterError = data.error?.message || JSON.stringify(data.error) || response.statusText;
          addLog(`OpenRouter falhou: ${openRouterError}`);
        }
      } catch (err: any) {
        openRouterError = err.message;
        addLog(`OpenRouter erro de rede: ${err.message}`);
      }
    }

    // --- TENTATIVA 2: GOOGLE AI STUDIO (FALLBACK) ---
    if (!responseText && geminiKey) {
      try {
        addLog('Tentando Google AI Studio (Gemini 1.5 Flash - v1beta)...');
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        
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
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
          addLog('Sucesso via Google (v1beta).');
        } else {
          const googleErr = data.error?.message || JSON.stringify(data.error) || response.statusText;
          addLog(`Google falhou: ${googleErr}`);
          throw new Error(googleErr);
        }
      } catch (err: any) {
        addLog(`Google erro: ${err.message}`);
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
