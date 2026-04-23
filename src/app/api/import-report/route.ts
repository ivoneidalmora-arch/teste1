import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
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
      Analise a imagem/PDF do "Relatório de Conta Mensal" e extraia todos os veículos realizados na tabela.
      
      Regras de extração:
      1. Extraia APENAS as linhas que possuem placa e serviço.
      2. Mapeie o campo "Serviço" para uma das seguintes categorias: "Transferência", "Vistoria de Entrada", "Vistoria de Retorno" ou "Vistoria Cautelar".
      3. Extraia o campo "Data" no formato YYYY-MM-DD.
      4. Extraia o campo "Preço" (que é o valor bruto) como um número decimal. Ignore o "Preço Sugerido".
      5. Extraia a "Placa" e o "Cliente".
      
      Retorne APENAS um array JSON puro, sem formatação markdown, seguindo este exemplo:
      [
        { "data": "2025-11-04", "placa": "ABC1234", "cliente": "ORVEL", "categoria": "Transferência", "valorBruto": 198.13 },
        ...
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
    // Limpeza básica caso a IA coloque blocos de código markdown
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonString);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro no processamento Gemini:', error);
    return NextResponse.json({ error: error.message || 'Falha ao processar arquivo com IA' }, { status: 500 });
  }
}
