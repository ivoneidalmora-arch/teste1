import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const { metrics } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key não configurada" }, { status: 503 });
    }

    const prompt = `
      Atue como um analista financeiro sênior especializado em empresas de vistoria automotiva. 
      Analise as métricas financeiras abaixo e forneça 3 insights acionáveis de alto impacto.

      Contexto do Período (${metrics.period.month}/${metrics.period.year}):
      - Receita Bruta: R$ ${metrics.totalRevenueBruto.toLocaleString('pt-BR')}
      - Receita Líquida: R$ ${metrics.totalRevenueLiquido.toLocaleString('pt-BR')}
      - Despesas Totais: R$ ${metrics.totalExpense.toLocaleString('pt-BR')}
      - Saldo Final (Lucro): R$ ${metrics.netProfit.toLocaleString('pt-BR')}
      - Comprometimento da Receita (Despesas %): ${metrics.expensePercentage.toFixed(2)}%
      - Status das Despesas: ${metrics.expenseStatus}
      
      Destaques:
      - Melhor Cliente: ${metrics.topCustomer.name} (R$ ${metrics.topCustomer.value.toLocaleString('pt-BR')} em ${metrics.topCustomer.count} serviços)
      - Maior Categoria de Custo: ${metrics.expenseDetails.topCategory} (R$ ${metrics.expenseDetails.topCategoryValue.toLocaleString('pt-BR')})
      - Maior Despesa Única: ${metrics.expenseDetails.highestExpense.description} (R$ ${metrics.expenseDetails.highestExpense.value.toLocaleString('pt-BR')})
      - Variação Mensal (Receita): ${metrics.monthlyVariation.toFixed(2)}%
      - Possíveis Duplicidades: ${metrics.duplicatePlates.length} registros suspeitos
      
      Regras de Resposta:
      1. Título curto e impactante em uppercase.
      2. Conteúdo humanizado, direto e executivo.
      3. Forneça estratégias para reduzir a categoria de custo dominante ou aumentar a retenção do melhor cliente.
      4. Retorne APENAS um JSON válido (sem markdown, sem blocos de código):
      [
        { "type": "summary", "severity": "info", "title": "RESUMO EXECUTIVO", "content": "..." },
        { "type": "alert", "severity": "warning", "title": "ALERTA DE CUSTOS", "content": "..." },
        { "type": "recommendation", "severity": "info", "title": "RECOMENDAÇÃO ESTRATÉGICA", "content": "..." }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Limpeza rigorosa do JSON para evitar falhas do Gemini
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("Resposta da IA não contém JSON válido");
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    const insights = JSON.parse(jsonStr);

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
