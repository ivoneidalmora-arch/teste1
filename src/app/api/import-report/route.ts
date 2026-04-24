import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do Gemini
export async function POST(req: NextRequest) {
  try {
    // 1. Tenta pegar do Header (enviada pelo front-end)
    // 2. Tenta pegar da variável de ambiente do Vercel
    const apiKey = req.headers.get('x-api-key') || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'MISSING_KEY' 
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });







    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Converter arquivo para Base64 para o Gemini
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ]);

    const responseText = result.response.text();
    if (!responseText) throw new Error('A IA não retornou nenhum dado. O arquivo pode estar ilegível.');

    // Limpeza rigorosa do JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, '').trim();
    
    try {
      const data = JSON.parse(jsonString);
      return NextResponse.json(data);
    } catch (e) {
      console.error('Erro ao converter JSON da IA:', responseText);
      return NextResponse.json({ error: 'A IA gerou um formato de dados inválido. Tente novamente.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro no processamento Gemini:', error);
    let msg = error.message || 'Falha ao processar arquivo com IA';
    
    if (msg.includes('API key not valid')) msg = 'Sua chave do Gemini (API Key) está inválida ou expirou.';
    
    // Se for erro de modelo não encontrado, tenta listar os modelos disponíveis para ajudar no debug
    if (msg.includes('not found') || msg.includes('404')) {
      try {
        const apiKey = req.headers.get('x-api-key') || process.env.GOOGLE_GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name).join(', ');
        msg = `Modelo não encontrado. Modelos disponíveis para sua chave: ${models || 'nenhum'}`;
      } catch (e) {
        msg = 'Modelo não encontrado e não foi possível listar os modelos disponíveis.';
      }
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
