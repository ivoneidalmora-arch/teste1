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
    
    IMPORTANTE: A data de hoje é ${todayStr}. Se você vir essa data no topo do documento como "Data de Emissão" ou "Data do Relatório", ignore-a. NÃO use ${todayStr} para as vistorias a menos que ela esteja escrita especificamente na linha de cada vistoria.
    
    ESTRUTURA DO DOCUMENTO (REFERÊNCIA):
    O documento é uma tabela com as seguintes colunas principais:
    - Coluna 2: Data (ex: 01/10/2025) -> USE ESTA DATA.
    - Coluna 7: Placa (ex: RTK0A39)
    - Coluna 8: Cliente (ex: CANGOA)
    - Coluna 9: Serviço (ex: SIMPLIFICADA MÉDIO)
    - Coluna 14: Preço (ex: R$ 108,50)
    
    REGRAS CRÍTICAS:
    1. EXAUSTIVIDADE: Extraia as 48 vistorias (ou quantas houver).
    2. DATA FIEL: Use EXATAMENTE o formato DD/MM/YYYY que você vê no documento. NÃO inverta dia e mês. Se no documento está 01/10/2025, retorne 01/10/2025.
    3. MAPEAMENTO DE SERVIÇO: 
       - Se contiver "COMPLETA" -> Use "Transferência"
       - Se contiver "SIMPLIFICADA" -> Use "Vistoria de Entrada"
       - Se contiver "RETORNO" -> Use "Vistoria de Retorno"
       - Se contiver "CAUTELAR" -> Use "Vistoria Cautelar"
    4. FORMATO CSV: data;placa;cliente;serviço;preço
    5. NENHUM TEXTO ADICIONAL.
    
    EXEMPLO DE SAÍDA:
    01/10/2025;RTK0A39;CANGOA;Vistoria de Entrada;108.50
    02/10/2025;RTN9E95;CANGOA;Vistoria de Entrada;108.50
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
        addLog(`Linha ${i+1}: Data extraída = "${dateStr}", Placa = "${placa}"`);

        // Clean and parse price string robustly
        let sPrice = String(preco || '0').replace(/[^\d.,-]/g, '');
        const lastDot = sPrice.lastIndexOf('.');
        const lastComma = sPrice.lastIndexOf(',');
        if (lastDot > -1 && lastComma > -1) {
          if (lastDot > lastComma) sPrice = sPrice.replace(/,/g, '');
          else sPrice = sPrice.replace(/\./g, '').replace(',', '.');
        } else if (lastComma > -1) {
          sPrice = sPrice.replace(',', '.');
        }
        const parsedPrice = parseFloat(sPrice);

        const isCautelar = servico?.toUpperCase().includes('CAUTELAR');
        const valorLiquido = isCautelar ? (isNaN(parsedPrice) ? 0 : parsedPrice) : Math.max(0, (isNaN(parsedPrice) ? 0 : parsedPrice) - 50.72);

        const normalized: any = {
          data: normalizeDate(dateStr),
          placa: placa.toUpperCase(),
          cliente: cliente || 'DESCONHECIDO',
          categoria: servico || 'Transferência',
          valorBruto: isNaN(parsedPrice) ? 0 : parsedPrice,
          valorLiquido: valorLiquido
        };

        // Mapeamento de categorias
        const catUpper = normalized.categoria.toUpperCase();
        if (catUpper.includes('COMPLETA MÓVEL') || catUpper.includes('COMPLETA MOVEL')) normalized.categoria = 'Transferência';
        else if (catUpper.includes('COMPLETA')) normalized.categoria = 'Transferência';
        else if (catUpper.includes('SIMPLIFICADA')) normalized.categoria = 'Vistoria de Entrada';
        else if (catUpper.includes('CAUTELAR')) normalized.categoria = 'Vistoria Cautelar';
        else if (catUpper.includes('SAÍDA') || catUpper.includes('SAIDA')) normalized.categoria = 'Vistoria de Saída';
        else if (catUpper.includes('RETORNO')) normalized.categoria = 'Vistoria de Retorno';
        
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
