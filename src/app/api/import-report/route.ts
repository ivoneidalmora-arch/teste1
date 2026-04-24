import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const openRouterKey = process.env.OPENAI_API_KEY;
    const openRouterUrl = process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
    const geminiKey = req.headers.get('x-api-key') || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!openRouterKey && !geminiKey) {
      return NextResponse.json({ error: 'MISSING_KEY' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const prompt = `
      Você é um especialista em extração de dados de relatórios financeiros de vistorias automotivas.
      Analise o arquivo do "Relatório de Conta Mensal" e extraia todos os veículos realizados na tabela.
      
      Regras de extração:
      1. Extraia APENAS as linhas que possuem placa e serviço.
      2. Mapeie o campo "Serviço" para uma das seguintes categorias: "Transferência", "Vistoria de Entrada", "Vistoria de Retorno" ou "Vistoria Cautelar".
         - Se o serviço for "COMPLETA FIXA", mapeie obrigatoriamente para "Transferência".
         - Se o serviço for "SIMPLIFICADA", mapeie obrigatoriamente para "Vistoria de Entrada".
      3. Extraia o campo "Data" no formato YYYY-MM-DD.
      4. Extraia o campo "Preço" (que é o valor bruto) como um número decimal. Ignore o "Preço Sugerido".
      5. Extraia a "Placa" e o "Cliente".
      
      Retorne APENAS um array JSON puro, sem formatação markdown, seguindo este exemplo:
      [
        { "data": "2025-11-04", "placa": "ABC1234", "cliente": "ORVEL", "categoria": "Transferência", "valorBruto": 198.13 }
      ]
    `;

    let responseText = '';

    let openRouterError = '';

    // --- TENTATIVA 1: OPENROUTER ---
    if (openRouterKey) {
      try {
        console.log('[IA] Tentando OpenRouter com anthropic/claude-3-haiku...');
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
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { 
                    type: 'image_url', 
                    image_url: { url: `data:${file.type};base64,${base64Data}` } 
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          responseText = data.choices[0].message.content;
          console.log('[IA] Sucesso via OpenRouter!');
        } else {
          openRouterError = data.error?.message || JSON.stringify(data.error) || response.statusText;
          console.warn('[OpenRouter] Falhou:', openRouterError);
        }
      } catch (err: any) {
        openRouterError = `Erro de rede: ${err.message}`;
        console.warn('[OpenRouter] Erro de rede:', err.message);
      }
    }

    // --- TENTATIVA 2: GOOGLE AI STUDIO (FALLBACK VIA FETCH DIRETO) ---
    if (!responseText && geminiKey) {
      try {
        console.log('[IA] Tentando Google AI Studio via API direta (v1)...');
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
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
          console.log('[IA] Sucesso via Google API Direta!');
        } else {
          const googleErr = data.error?.message || JSON.stringify(data.error) || response.statusText;
          throw new Error(googleErr);
        }
      } catch (err: any) {
        console.error('[IA] Fallback também falhou:', err.message);
        throw new Error(`Ambos falharam. \nOpenRouter: ${openRouterError} \nGoogle: ${err.message}`);
      }
    }

    if (!responseText) throw new Error('A IA não retornou nenhum dado.');

    try {
      const cleanText = responseText.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
      
      let data = JSON.parse(jsonString);
      
      if (!Array.isArray(data) && typeof data === 'object') {
        const potentialArray = Object.values(data).find(val => Array.isArray(val));
        if (potentialArray) {
          data = potentialArray;
        } else {
          data = [data];
        }
      }

      if (!Array.isArray(data)) throw new Error('O formato extraído não é um array.');

      return NextResponse.json(data);
    } catch (e: any) {
      console.error('Erro ao converter JSON da IA:', responseText);
      return NextResponse.json({ 
        error: 'A IA gerou um formato de dados inválido.', 
        details: responseText, // Envia o texto completo para o front depurar
        parseError: e.message,
        length: responseText.length
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro no processamento IA:', error);
    return NextResponse.json({ error: error.message || 'Falha ao processar com IA' }, { status: 500 });
  }
}
