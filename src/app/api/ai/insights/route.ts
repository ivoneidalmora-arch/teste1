import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/ai/gemini';
import { z } from 'zod';

const MetricsSchema = z.object({
  metrics: z.object({
    period: z.object({
      type: z.string().default('global'),
      label: z.string().default('Tudo (Global)'),
      month: z.number().optional(),
      year: z.number().optional()
    }),
    totalRevenueBruto: z.number().default(0),
    totalRevenueLiquido: z.number().default(0),
    totalExpense: z.number().default(0),
    netProfit: z.number().default(0),
    expensePercentage: z.number().default(0),
    expenseStatus: z.string().default('Normal'),
    topCustomer: z.object({
      name: z.string().default('N/A'),
      value: z.number().default(0),
      count: z.number().default(0)
    }).default({ name: 'N/A', value: 0, count: 0 }),
    expenseDetails: z.object({
      topCategory: z.string().default('Outros'),
      topCategoryValue: z.number().default(0)
    }).default({ topCategory: 'Outros', topCategoryValue: 0 }),
    monthlyVariation: z.number().default(0),
    duplicateGroups: z.array(z.any()).default([])
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = MetricsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Payload inválido para geração de insights.",
        details: result.error.format()
      }, { status: 400 });
    }

    const { metrics } = result.data;

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key não configurada. Use diagnósticos locais." }, { status: 503 });
    }

    const isGlobal = metrics.period.type === 'global';
    const periodLabel = isGlobal ? "HISTÓRICO COMPLETO (ANÁLISE GLOBAL)" : metrics.period.label;

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
      - Melhor Cliente: ${metrics.topCustomer.name} (R$ ${metrics.topCustomer.value.toLocaleString('pt-BR')})
      - Maior Categoria de Custo: ${metrics.expenseDetails.topCategory} (R$ ${metrics.expenseDetails.topCategoryValue.toLocaleString('pt-BR')})
      - Variação Mensal: ${metrics.monthlyVariation.toFixed(2)}%
      - Auditoria de Duplicidades: ${metrics.duplicateGroups.length} grupos detectados.
      
      Regras de Resposta:
      1. Título curto e impactante em uppercase.
      2. Conteúdo humanizado, direto e executivo.
      3. No modo GLOBAL, deixe claro que os dados referem-se ao acumulado total.
      4. Retorne APENAS um JSON válido no formato:
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
    return NextResponse.json({ error: "Erro interno ao gerar insights da IA." }, { status: 500 });
  }
}
