import { FinancialMetrics, IAInsight } from "../types/insights.types";

export const geminiInsightsService = {
  async generateInsights(metrics: FinancialMetrics): Promise<IAInsight[]> {
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      });

      if (!response.ok) throw new Error('Falha ao gerar insights');

      const insights = await response.json();
      
      return insights.map((i: any) => ({
        ...i,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Insights Service Error:", error);
      throw error;
    }
  }
};
