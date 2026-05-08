import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const { metrics } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key não configurada" }, { status: 503 });
    }

    const isGlobal = metrics.period.type === 'global';
    const periodLabel = isGlobal ? "HISTÓRICO COMPLETO (ANÁLISE GLOBAL)" : `${metrics.period.month}/${metrics.period.year}`;

    const prompt = `
      Atue como um desenvolvedor full-stack sênior e analista financeiro sênior especializado em empresas de vistoria automotiva. 
      Analise as métricas financeiras abaixo e forneça 3 insights acionáveis de alto impacto.

      Contexto do Período: ${periodLabel}
      ${isGlobal ? 'OBSERVAÇÃO: Esta é uma análise de TODO O HISTÓRICO cadastrado no sistema.' : ''}

      Métricas:
      - Receita Bruta: R$ ${metrics.totalRevenueBruto.toLocaleString('pt-BR')}
      - Receita Líquida: R$ ${metrics.totalRevenueLiquido.toLocaleString('pt-BR')}
      - Despesas Totais: R$ ${metrics.totalExpense.toLocaleString('pt-BR')}
      - Saldo Final (Lucro): R$ ${metrics.netProfit.toLocaleString('pt-BR')}
      - Comprometimento da Receita (Despesas %): ${metrics.expensePercentage.toFixed(2)}%
      - Status das Despesas: ${metrics.expenseStatus}
      
      Destaques:
      - Melhor Cliente Histórico: ${metrics.topCustomer.name} (R$ ${metrics.topCustomer.value.toLocaleString('pt-BR')} em ${metrics.topCustomer.count} serviços)
      - Maior Categoria de Custo: ${metrics.expenseDetails.topCategory} (R$ ${metrics.expenseDetails.topCategoryValue.toLocaleString('pt-BR')})
      - Variação (${isGlobal ? 'Último mês vs Anterior' : 'Mensal'}): ${metrics.monthlyVariation.toFixed(2)}%
      - Auditoria de Duplicidades: ${metrics.duplicateGroups.filter((g: any) => g.status === 'pending_review').length} pendentes, ${metrics.duplicateGroups.filter((g: any) => g.status === 'confirmed_duplicate').length} confirmadas.
      
      Regras de Resposta:
      1. Título curto e impactante em uppercase.
      2. Conteúdo humanizado, direto e executivo.
      3. No modo GLOBAL, deixe claro que os dados referem-se ao acumulado total.
      4. Retorne APENAS um JSON válido:
      [
        { "type": "summary", "severity": "info", "title": "...", "content": "..." },
        { "type": "alert", "severity": "warning", "title": "...", "content": "..." },
        { "type": "recommendation", "severity": "info", "title": "...", "content": "..." }
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
