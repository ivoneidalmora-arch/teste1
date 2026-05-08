import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const { metrics } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key não configurada" }, { status: 503 });
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
      - Variação Mensal (Receita): ${metrics.monthlyVariation.toFixed(2)}%
      
      Regras de Resposta:
      1. Título curto e impactante em uppercase.
      2. Conteúdo humanizado, direto e executivo.
      3. Retorne APENAS um JSON válido:
      [
        { "type": "summary", "severity": "info", "title": "RESUMO EXECUTIVO", "content": "..." },
        { "type": "alert", "severity": "warning", "title": "ALERTA DE CUSTOS", "content": "..." },
        { "type": "recommendation", "severity": "info", "title": "RECOMENDAÇÃO ESTRATÉGICA", "content": "..." }
      ]
    `;

    const text = await GeminiService.generateContent(prompt);
    const insights = GeminiService.parseJsonResponse(text);

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("[API AI Insights] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
