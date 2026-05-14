import { DiagnosticResult } from "../types/diagnostics.types";

/**
 * Serviço responsável por gerar textos e análises "inteligentes" baseadas em regras locais.
 * Funciona como o fallback principal quando a API de IA (Gemini/OpenAI) está indisponível.
 */
export const localAiService = {
  /**
   * Gera uma análise de risco baseada nos diagnósticos de saúde, crescimento e despesas.
   */
  generateRiskAnalysis(context: {
    health: DiagnosticResult,
    growth: DiagnosticResult,
    expense: DiagnosticResult,
    client: DiagnosticResult,
    service: DiagnosticResult
  }): { title: string, factor: string, impact: string, recommendation: string, severity: 'baixo' | 'medio' | 'alto' | 'critico' } {
    
    const { health, growth, expense } = context;

    // Lógica de gravidade baseada nos outros diagnósticos
    if (health.severity === 'critical' || expense.severity === 'critical') {
      return {
        title: "Risco Crítico Detectado",
        factor: "Despesas elevadas superando a capacidade de geração de caixa líquido.",
        impact: "Possível insolvência técnica no curto prazo se não houver aporte ou redução drástica de custos.",
        recommendation: "Corte imediato de despesas não essenciais e renegociação de prazos com fornecedores.",
        severity: 'critico'
      };
    }

    if (expense.severity === 'warning' || growth.severity === 'warning') {
      return {
        title: "Atenção: Margem em Declínio",
        factor: "Aumento progressivo das despesas operacionais enquanto a receita permanece estável ou cai.",
        impact: "Redução da margem de lucro líquida, limitando reinvestimentos.",
        recommendation: "Revisar contratos recorrentes e buscar eficiência operacional nos serviços prestados.",
        severity: 'alto'
      };
    }

    if (health.severity === 'positive' && growth.severity === 'positive') {
      return {
        title: "Saúde Financeira Estável",
        factor: "Equilíbrio entre receitas e despesas com tendência de crescimento positivo.",
        impact: "Capacidade de expansão e reserva de emergência saudável.",
        recommendation: "Manter o controle rigoroso e considerar investimentos para escalabilidade.",
        severity: 'baixo'
      };
    }

    return {
      title: "Análise de Risco Moderada",
      factor: "Indicadores financeiros dentro da normalidade operacional.",
      impact: "Baixa previsibilidade de riscos imediatos.",
      recommendation: "Acompanhar a evolução mensal das despesas fixas.",
      severity: 'medio'
    };
  }
};
