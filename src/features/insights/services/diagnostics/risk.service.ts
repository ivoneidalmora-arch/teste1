import { DiagnosticResult } from '../../types/diagnostics.types';
import { getGrossAmount, getNetAmount, getExpenseAmount } from '../../utils/financial-normalization';

export const riskDiagnosticService = {
  analyze(inputs: { 
    health: DiagnosticResult, 
    growth: DiagnosticResult, 
    expense: DiagnosticResult, 
    client: DiagnosticResult, 
    service: DiagnosticResult, 
    context: any 
  }): DiagnosticResult {
    const { health, growth, client, context } = inputs;
    const { rawRevenues, rawExpenses, period } = context;

    if (!health.hasData || rawRevenues.length === 0) {
      return {
        id: 'risk',
        type: 'risk',
        title: 'Diagnóstico de Risco Financeiro',
        classification: 'Sem Dados',
        severity: 'info',
        priority: 'low',
        mainMetric: '-',
        text: 'Não é possível mensurar o risco financeiro sem dados suficientes no período.',
        hasData: false,
        period: period.label
      };
    }

    const factors: string[] = [];
    let riskPoints = 0;

    // 1. Filtrar dados do período selecionado
    const periodRevenues = period.type === 'month' 
      ? rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate)
      : rawRevenues;
    const periodExpenses = period.type === 'month' 
      ? rawExpenses.filter((e: any) => e.date >= period.startDate && e.date <= period.endDate)
      : rawExpenses;

    // 2. Análise de Inconsistências Críticas
    const zeroedRevenues = periodRevenues.filter((r: any) => getNetAmount(r) <= 0);
    if (zeroedRevenues.length > 0) {
      factors.push(`${zeroedRevenues.length} ${zeroedRevenues.length === 1 ? 'receita está' : 'receitas estão'} com valor zerado ou negativo.`);
      riskPoints += 2;
    }

    const uncategorizedExpenses = periodExpenses.filter((e: any) => !e.category || e.category.trim() === '' || e.category.toUpperCase() === 'OUTROS');
    if (uncategorizedExpenses.length > 0) {
      factors.push(`${uncategorizedExpenses.length} ${uncategorizedExpenses.length === 1 ? 'despesa está' : 'despesas estão'} sem categoria definida.`);
      riskPoints += 1;
    }

    const incompleteRevenues = periodRevenues.filter((r: any) => !r.cliente || !r.category);
    if (incompleteRevenues.length > 0) {
      factors.push(`Existem lançamentos de receita incompletos (sem cliente ou serviço).`);
      riskPoints += 1;
    }

    // 3. Análise de Rentabilidade e Caixa
    const totalGrossRevenue = periodRevenues.reduce((acc: number, r: any) => acc + getGrossAmount(r), 0);
    const totalNetRevenue = periodRevenues.reduce((acc: number, r: any) => acc + getNetAmount(r), 0);
    const totalExpenses = periodExpenses.reduce((acc: number, e: any) => acc + getExpenseAmount(e), 0);
    const netBalance = totalNetRevenue - totalExpenses;
    const netMargin = totalNetRevenue > 0 ? (netBalance / totalNetRevenue) * 100 : 0;

    if (netBalance < 0) {
      factors.push(`O saldo líquido está negativo no período (${(netBalance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`);
      riskPoints += 4;
    } else if (netMargin < 30 && totalNetRevenue > 0) {
      factors.push(`A margem líquida está abaixo do ideal (${netMargin.toFixed(1)}%).`);
      riskPoints += 2;
    }

    if (totalNetRevenue > 0 && (netBalance / totalGrossRevenue) < 0.15) {
      factors.push(`O lucro líquido está muito baixo em relação ao faturamento bruto.`);
      riskPoints += 2;
    }

    // 4. Concentração de Receita
    if (client.severity === 'critical') {
      factors.push(`Há uma concentração excessiva de receita em um único cliente.`);
      riskPoints += 3;
    }

    // 5. Tendências (Growth)
    if (growth.classification === 'Crescimento de Risco') {
      factors.push(`As despesas cresceram acima das receitas no período.`);
      riskPoints += 2;
    }

    // Determinar Nível de Risco
    let classification: "Baixo" | "Moderado" | "Alto" | "Crítico" = "Baixo";
    let severity: any = 'positive';
    let impact = '';
    let strategicAction = '';

    if (riskPoints >= 7 || netBalance < -1000) {
      classification = "Crítico";
      severity = 'critical';
      impact = "Inconsistências graves e saldo negativo ameaçam a continuidade saudável da operação.";
      strategicAction = "Corte despesas não essenciais imediatamente e revise todos os lançamentos zerados.";
    } else if (riskPoints >= 4 || netBalance < 0) {
      classification = "Alto";
      severity = 'critical';
      impact = "Múltiplos fatores de risco detectados que podem comprometer o lucro do mês.";
      strategicAction = "Execute um plano de contenção de custos e regularize os cadastros incompletos.";
    } else if (riskPoints >= 2) {
      classification = "Moderado";
      severity = 'warning';
      impact = "Existem falhas de classificação ou margens apertadas que exigem atenção da gestão.";
      strategicAction = "Corrija os lançamentos inválidos e revise as despesas antes de fechar o relatório.";
    } else {
      classification = "Baixo";
      severity = 'positive';
      impact = "A operação demonstra saúde financeira e os dados estão bem classificados.";
      strategicAction = "Mantenha o rigor no registro dos dados para garantir análises precisas.";
    }

    return {
      id: 'risk',
      type: 'risk',
      title: 'Diagnóstico de Risco Financeiro',
      classification: `Risco ${classification}`,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: classification,
      secondaryMetric: `Fatores encontrados: ${factors.length}`,
      text: impact,
      recommendation: strategicAction,
      factors: factors.length > 0 ? factors : ["Nenhum fator de risco relevante detectado."],
      hasData: true,
      period: period.label
    };
  }
};
