import { GoogleGenerativeAI } from "@google/generative-ai";
import { FinancialMetrics, IAInsight } from "../types/insights.types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const geminiInsightsService = {
  async generateInsights(metrics: FinancialMetrics): Promise<IAInsight[]> {
    const prompt = `
      Atue como um analista financeiro sênior. Analise as seguintes métricas financeiras de um sistema de vistoria veicular e forneça 3 insights acionáveis (Resumo, Alerta, Recomendação).
      
      Métricas do Mês Atual:
      - Receita Total: R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}
      - Despesa Total: R$ ${metrics.totalExpense.toLocaleString('pt-BR')}
      - Lucro Líquido: R$ ${metrics.netProfit.toLocaleString('pt-BR')}
      - Melhor Cliente: ${metrics.topCustomer.name} (R$ ${metrics.topCustomer.value.toLocaleString('pt-BR')})
      - Variação Mensal de Receita: ${metrics.monthlyVariation.toFixed(2)}%
      - Placas Duplicadas detectadas: ${metrics.duplicatePlates.length} (${metrics.duplicatePlates.join(', ')})
      
      Regras:
      1. Seja direto, profissional e executivo.
      2. Use linguagem natural e humana.
      3. Retorne APENAS um JSON válido no seguinte formato:
      [
        { "type": "summary", "severity": "info", "title": "...", "content": "..." },
        { "type": "alert", "severity": "warning/critical", "title": "...", "content": "..." },
        { "type": "recommendation", "severity": "info", "title": "...", "content": "..." }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Basic cleanup for JSON extraction
      const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      const insights = JSON.parse(jsonStr);
      
      return insights.map((i: any) => ({
        ...i,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Falha ao gerar insights com IA.");
    }
  }
};
