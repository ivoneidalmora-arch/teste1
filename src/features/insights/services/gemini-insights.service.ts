import { FinancialMetrics, IAInsight } from "../types/insights.types";
import { generateLocalAnalysis } from "../utils/local-analysis";

export const geminiInsightsService = {
  async generateInsights(metrics: FinancialMetrics): Promise<IAInsight[]> {
    try {
      // Tentar usar a API externa (se configurada)
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      });

      if (!response.ok) {
        throw new Error('API Indisponível');
      }

      const insights = await response.json();
      
      // Se a API retornar erro ou array vazio, fallback
      if (!Array.isArray(insights) || insights.length === 0) {
        return generateLocalAnalysis(metrics);
      }

      return insights.map((i: any) => ({
        ...i,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.warn("Usando análise local devido a erro na IA externa:", error);
      // Fallback para análise baseada em regras locais
      return generateLocalAnalysis(metrics);
    }
  }
};
