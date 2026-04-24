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
    Extraia ABSOLUTAMENTE TODAS as vistorias do relatório.
    
    REGRAS:
    1. Retorne os dados no formato CSV usando ponto-e-vírgula (;) como separador.
    2. NÃO inclua cabeçalho. 
    3. NÃO inclua nenhum texto explicativo, apenas as linhas de dados.
    4. Campos por linha: data;placa;cliente;serviço;preço
    
    FORMATO DE CADA LINHA:
    YYYY-MM-DD;PLACA;CLIENTE;SERVIÇO;VALOR
    
    EXEMPLO:
    2025-10-01;SFQ3B51;ORVEL;VISTORIA COMPLETA;113.58
    2025-10-02;RDL1C32;ORVEL;VISTORIA SIMPLIFICADA;89.90`;

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

    let retryMessage = '';

    // --- TENTATIVA 1: GOOGLE AI STUDIO (Gemini 2.0) ---
    if (geminiKey) {
      try {
        addLog('Tentando Google AI Studio (gemini-2.0-flash-001)...');
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
            generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
          })
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
          addLog('Sucesso via Google (2.0)!');
        } else {
          const errMsg = data.error?.message || '';
          if (errMsg.includes('Please retry in')) {
            retryMessage = errMsg.match(/Please retry in [\d.]+s/)?.[0] || errMsg;
          }
          addLog(`Google 2.0 falhou (${response.status}): ${retryMessage || errMsg}`);
          
          // TENTATIVA 1.5: Fallback interno no Google (Gemini 1.5 Flash)
          addLog('Tentando Google AI Studio (gemini-1.5-flash)...');
          const googleUrl15 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
          const resp15 = await fetch(googleUrl15, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: file.type, data: base64Data } }
                ]
              }],
              generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
            })
          });
          const data15 = await resp15.json();
          if (resp15.ok && data15.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = data15.candidates[0].content.parts[0].text;
            addLog('Sucesso via Google (1.5)!');
          } else if (data15.error?.message?.includes('Please retry in')) {
            const m = data15.error.message.match(/Please retry in [\d.]+s/)?.[0];
            if (m) retryMessage = m;
          }
        }
      } catch (err: any) {
        addLog(`Google erro: ${err.message}`);
      }
    }

    // --- TENTATIVA 2: OPENROUTER (Multi-Model Fallback) ---
    if (!responseText && openRouterKey) {
      const models = [
        'google/gemini-2.0-flash-lite-001',
        'mistralai/pixtral-12b',
        'google/gemini-flash-1.5-8b'
      ];

      for (const model of models) {
        if (responseText) break;
        try {
          addLog(`Tentando OpenRouter (${model})...`);
          const response = await fetch(`${openRouterUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://teste1-woad-ten.vercel.app',
              'X-Title': 'Sistema de Vistorias',
            },
            body: JSON.stringify({
              model: model,
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
          if (response.ok && data.choices?.[0]?.message?.content) {
            responseText = data.choices[0].message.content;
            addLog(`Sucesso via OpenRouter (${model})!`);
          } else {
            addLog(`${model} falhou: ${data.error?.message || response.statusText}`);
          }
        } catch (err: any) {
          addLog(`${model} erro: ${err.message}`);
        }
      }
    }

    if (!responseText) {
      const finalMsg = retryMessage 
        ? `COTAS ESGOTADAS. ${retryMessage}. Por favor, aguarde este tempo e tente novamente.`
        : 'Todas as tentativas de IA falharam (Cotas ou Indisponibilidade).';
      throw new Error(`[RASTREAMENTO]\n${logs.join('\n')}\n\nErro Final: ${finalMsg}`);
    }

    if (!responseText) {
      addLog('ERRO: Nenhum provedor disponível.');
      throw new Error(`[RASTREAMENTO]\n${logs.join('\n')}\n\nNenhum provedor disponível.`);
    }

    try {
      addLog('Iniciando parsing do formato compactado (CSV)...');
      
      const lines = responseText
        .replace(/```csv|```/g, '')
        .trim()
        .split('\n')
        .filter(line => line.includes(';'));

      const data = lines.map(line => {
        const [data, placa, cliente, servico, preco] = line.split(';').map(s => s?.trim());
        
        // Se a linha estiver incompleta (provável corte de token), o map filtrará depois
        if (!placa || !data) return null;

        const normalized: any = {
          data: data.match(/^\d{4}-\d{2}-\d{2}$/) ? data : new Date().toISOString().split('T')[0],
          placa: placa.toUpperCase(),
          cliente: cliente || 'DESCONHECIDO',
          categoria: servico || 'Transferência',
          valorBruto: parseFloat(String(preco || '0').replace(',', '.')),
          valorLiquido: 0
        };

        // Mapeamento de categorias
        const catUpper = normalized.categoria.toUpperCase();
        if (catUpper.includes('COMPLETA')) normalized.categoria = 'Transferência';
        if (catUpper.includes('SIMPLIFICADA')) normalized.categoria = 'Vistoria de Entrada';
        if (catUpper.includes('COMPLETA MÓVEL')) normalized.categoria = 'Transferência';
        
        return normalized;
      }).filter(item => item !== null);

      addLog(`Parsing concluído. ${data.length} itens extraídos.`);
      return NextResponse.json(data);
    } catch (e: any) {
      addLog(`ERRO no parsing CSV: ${e.message}`);
      return NextResponse.json({ 
        error: 'Erro ao processar dados da IA.', 
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
