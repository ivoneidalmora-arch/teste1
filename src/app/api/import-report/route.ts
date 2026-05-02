import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { normalizeDate } from '@/features/ai-ocr/utils/normalization';

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
    const todayStr = new Date().toLocaleDateString('pt-BR'); // ex: 30/04/2026

    const prompt = `Você é um robô de extração de dados de ALTA PRECISÃO, EXAUSTIVIDADE e RIGOR.
    Seu objetivo é extrair TODAS as vistorias individuais listadas no documento.
    
    ESTRUTURA DO DOCUMENTO (REFERÊNCIA):
    O documento é uma tabela com as seguintes colunas principais (os nomes podem variar levemente):
    - Data (ex: 01/10/2025)
    - Placa (ex: RTK0A39)
    - Cliente (ex: CANGOA)
    - Serviço/Tipo de Vistoria (ex: SIMPLIFICADA MÉDIO, CAUTELAR, TRANSFERÊNCIA)
    - Preço/Valor (ex: R$ 108,50)
    
    REGRAS CRÍTICAS:
    1. EXAUSTIVIDADE: Extraia TODAS as vistorias presentes no documento sem pular nenhuma.
    2. DATA FIEL: Use EXATAMENTE o formato DD/MM/YYYY que você vê no documento. NÃO inverta dia e mês. 
    3. SERVIÇO DINÂMICO: Capture o texto EXATO da coluna de serviço. Não use valores genéricos se o texto original estiver disponível.
    4. PREÇO PRECISO: Capture o valor numérico completo. Se houver "R$", ignore-o e retorne apenas o número com ponto decimal.
    5. FORMATO CSV: data;placa;cliente;serviço;preço
    
    AVISO: Se o documento for de um mês específico (ex: Outubro), garanta que todas as datas reflitam esse mês corretamente.
    
    EXEMPLO DE SAÍDA:
    01/10/2025;RTK0A39;CANGOA;SIMPLIFICADA MÉDIO;108.50
    02/10/2025;RTN9E95;CANGOA;Vistoria Cautelar;150.00
    30/10/2025;SKJ0E91;CANGOA;Transferência;169.83`;

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
            const match = errMsg.match(/Please retry in ([\d.]+)s/);
            if (match) {
              const s = parseFloat(match[1]);
              retryMessage = s < 60 
                ? `Tente novamente em ${Math.ceil(s)} segundos`
                : `Tente novamente em ${Math.floor(s / 60)} min e ${Math.ceil(s % 60)} seg`;
            } else {
              retryMessage = errMsg;
            }
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
            const match = data15.error.message.match(/Please retry in ([\d.]+)s/);
            if (match) {
              const s = parseFloat(match[1]);
              retryMessage = s < 60 
                ? `Tente novamente em ${Math.ceil(s)} segundos`
                : `Tente novamente em ${Math.floor(s / 60)} min e ${Math.ceil(s % 60)} seg`;
            }
          }
        }
      } catch (err: any) {
        addLog(`Google erro: ${err.message}`);
      }
    }

    // --- TENTATIVA 2: OPENROUTER (Multi-Model Fallback) ---
    if (!responseText && openRouterKey) {
      const models = [
        'google/gemini-2.0-flash-lite-preview:free',
        'mistralai/pixtral-12b',
        'google/gemini-flash-1.5'
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
      const isQuota = !!retryMessage;
      const finalMsg = retryMessage 
        ? `COTAS ESGOTADAS. ${retryMessage}`
        : 'Todas as tentativas de IA falharam (Cotas ou Indisponibilidade).';
      
      return NextResponse.json({ 
        error: finalMsg,
        isQuota,
        retryAfter: retryMessage ? parseInt(retryMessage.match(/\d+/)?.[0] || '10') : 0,
        logs: logs 
      }, { status: isQuota ? 429 : 500 });
    }



    try {
      addLog('Iniciando parsing do formato compactado (CSV)...');
      addLog(`IA respondeu com ${responseText.length} caracteres.`);
      if (responseText.length < 500) {
        addLog(`Resposta RAW: ${responseText}`);
      } else {
        addLog(`Início da Resposta RAW: ${responseText.substring(0, 500)}...`);
      }
      
      const lines = responseText
        .replace(/```csv|```/g, '')
        .trim()
        .split('\n')
        .filter(line => line.includes(';'));

      const parsedItems = lines.map((line, i) => {
        const [rawData, placa, cliente, servico, preco] = line.split(';').map(s => s?.trim());
        
        // Se a linha estiver incompleta (provável corte de token), o map filtrará depois
        if (!placa || !rawData) return null;

        const dateStr = rawData;
        
        // Clean and parse price string robustly
        let sPrice = String(preco || '0').replace(/[^\d.,-]/g, '');
        const lastDot = sPrice.lastIndexOf('.');
        const lastComma = sPrice.lastIndexOf(',');
        
        if (lastDot > -1 && lastComma > -1) {
          if (lastDot > lastComma) sPrice = sPrice.replace(/,/g, '');
          else sPrice = sPrice.replace(/\./g, '').replace(',', '.');
        } else if (lastComma > -1) {
          sPrice = sPrice.replace(',', '.');
        } else if (lastDot > -1) {
          // Se só tem ponto, pode ser decimal (US) ou milhar (BR). 
          // Geralmente IA retorna decimal com ponto. Mas se for algo como "1.000", tratamos como milhar se não houver decimais
          const parts = sPrice.split('.');
          if (parts.length === 2 && parts[1].length === 3 && parseInt(parts[0]) < 100) {
            // Provavelmente milhar, ex: 1.250 -> 1250
            // Mas se for 1.250,00 já caiu no caso acima. 
            // Se for apenas 1.250, é ambíguo. Vamos assumir decimal se for IA.
          }
        }
        
        const parsedPrice = parseFloat(sPrice);
        addLog(`Linha ${i+1}: Data="${dateStr}", Placa="${placa}", Serviço="${servico}", Valor="${parsedPrice}"`);

        const isCautelar = servico?.toUpperCase().includes('CAUTELAR');
        const valorLiquido = isCautelar ? (isNaN(parsedPrice) ? 0 : parsedPrice) : Math.max(0, (isNaN(parsedPrice) ? 0 : parsedPrice) - 50.72);

        // Capitalize servico for better display
        const displayServico = servico ? servico.charAt(0).toUpperCase() + servico.slice(1).toLowerCase() : 'Transferência';

        const normalized: any = {
          data: normalizeDate(dateStr),
          placa: placa.toUpperCase(),
          cliente: cliente || 'DESCONHECIDO',
          categoria: displayServico,
          valorBruto: isNaN(parsedPrice) ? 0 : parsedPrice,
          valorLiquido: valorLiquido
        };

        // Mapeamento Sugerido (Apenas normaliza nomes conhecidos, mas mantém o original se for algo novo)
        const catUpper = normalized.categoria.toUpperCase();
        if (catUpper.includes('SIMPLIFICADA')) normalized.categoria = 'Vistoria de Entrada';
        else if (catUpper.includes('CAUTELAR')) normalized.categoria = 'Vistoria Cautelar';
        else if (catUpper.includes('SAÍDA') || catUpper.includes('SAIDA')) normalized.categoria = 'Vistoria de Saída';
        else if (catUpper.includes('RETORNO')) normalized.categoria = 'Vistoria de Retorno';
        else if (catUpper.includes('COMPLETA') || catUpper.includes('TRANSFERENCIA')) normalized.categoria = 'Transferência';
        
        return normalized;
      }).filter(item => item !== null);

      addLog(`Parsing concluído. ${parsedItems.length} itens extraídos.`);
      return NextResponse.json({ 
        success: true, 
        data: parsedItems,
        rawResponse: responseText,
        logs: logs 
      });
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
