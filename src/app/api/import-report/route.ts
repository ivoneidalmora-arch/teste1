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

    // --- TENTATIVA 1: OPENROUTER ---
    if (openRouterKey) {
      try {
        console.log('[IA] Tentando OpenRouter...');
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
          const errMsg = data.error?.message || JSON.stringify(data.error) || response.statusText;
          console.warn('[OpenRouter] Falhou:', errMsg);
          // Se for erro de saldo ou algo do tipo, guardamos para mostrar se o fallback também falhar
          console.log('[OpenRouter Error Context]:', errMsg);
        }
      } catch (err: any) {
        console.warn('[OpenRouter] Erro de rede:', err.message);
      }
    }

    // --- TENTATIVA 2: GOOGLE AI STUDIO (FALLBACK) ---
    if (!responseText && geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Usando o nome mais estável para o Flash
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 

        console.log('[IA] Tentando Google AI Studio (Fallback)...');
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          }
        ]);
        responseText = result.response.text();
        console.log('[IA] Sucesso via Fallback!');
      } catch (err: any) {
        console.error('[IA] Fallback também falhou:', err.message);
        throw new Error(`Ambos os provedores falharam. Erro Fallback: ${err.message}`);
      }
    }

    if (!responseText) throw new Error('A IA não retornou nenhum dado.');

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();
    
    try {
      const data = JSON.parse(jsonString);
      return NextResponse.json(data);
    } catch (e) {
      console.error('Erro ao converter JSON da IA:', responseText);
      return NextResponse.json({ error: 'A IA gerou um formato de dados inválido.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro no processamento IA:', error);
    return NextResponse.json({ error: error.message || 'Falha ao processar com IA' }, { status: 500 });
  }
}
