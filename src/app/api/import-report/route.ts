import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do Gemini
export async function POST(req: NextRequest) {
  try {
    // Chave definitiva com acesso a modelos de próxima geração
    const apiKey = 'AIzaSyBprvxTiWQQp8Yjcq5Au4WMVA8IReeiWCc';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // Utilizando o motor 1.5 Flash que possui cota gratuita liberada para PDF
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
