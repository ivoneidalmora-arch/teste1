import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const { metrics } = await req.json();

    const prompt = `
      Atue como um analista financeiro sênior. Analise as seguintes métricas financeiras de um sistema de vistoria veicular e forneça 3 insights acionáveis (Resumo, Alerta, Recomendação).
      
      Métricas do Mês Atual:
      - Receita Total: R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}
      - Despesa Total: R$ ${metrics.totalExpense.toLocaleString('pt-BR')}
      - Lucro Líquido: R$ ${metrics.netProfit.toLocaleString('pt-BR')}
      - Melhor Cliente: ${metrics.topCustomer.name} (R$ ${metrics.topCustomer.value.toLocaleString('pt-BR')})
      - Variação Mensal de Receita: ${metrics.monthlyVariation.toFixed(2)}%
      - Placas Duplicadas detectadas: ${metrics.duplicatePlates.length}
      
      Regras:
      1. Seja direto, profissional e executivo.
      2. Use linguagem natural e humana.
      3. Retorne APENAS um JSON válido no seguinte formato:
      [
        { "type": "summary", "severity": "info", "title": "...", "content": "..." },
        { "type": "alert", "severity": "warning", "title": "...", "content": "..." },
        { "type": "recommendation", "severity": "info", "title": "...", "content": "..." }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
    const insights = JSON.parse(jsonStr);

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
