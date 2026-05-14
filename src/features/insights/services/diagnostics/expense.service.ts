import { DiagnosticResult } from '../../types/diagnostics.types';
import { formatBRL } from '@/core/utils/formatters';
import { getNetAmount, getExpenseAmount } from '../../utils/financial-normalization';

export const expenseDiagnosticService = {
  analyze(context: any): DiagnosticResult {
    const { rawRevenues, rawExpenses, period } = context;

    let targetRevenues = rawRevenues;
    let targetExpenses = rawExpenses;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
      targetExpenses = rawExpenses.filter((e: any) => e.date >= period.startDate && e.date <= period.endDate);
    }

    const totalRevenueLiquido = targetRevenues.reduce((acc: number, curr: any) => acc + getNetAmount(curr), 0);
    const totalExpense = targetExpenses.reduce((acc: number, curr: any) => acc + getExpenseAmount(curr), 0);

    if (totalExpense === 0) {
      return {
        id: 'expense',
        type: 'expense',
        title: 'Diagnóstico de Despesas',
        classification: 'Sem Despesas',
        severity: 'positive',
        priority: 'low',
        mainMetric: 'R$ 0,00',
        text: 'Nenhuma despesa registrada neste período.',
        hasData: false,
        period: period.label
      };
    }

    const commitmentRate = totalRevenueLiquido > 0 ? (totalExpense / totalRevenueLiquido) * 100 : 100;

    // Analisar categorias
    const categoriesMap: Record<string, number> = {};
    let highestExp = { description: 'Nenhuma', value: 0 };
    
    // Identificar recorrentes vs atípicas de forma simples (neste contexto, contas de consumo são geralmente recorrentes, etc. Vamos simular baseando-se na repetição do mesmo nome ou categorias comuns)
    targetExpenses.forEach((e: any) => {
      const cat = e.category || 'Outros';
      const val = Number(e.amount) || 0;
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
      if (val > highestExp.value) {
        highestExp = { description: e.description || cat, value: val };
      }
    });

    const sortedCategories = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0] || 'Nenhuma';
    const topCategoryValue = sortedCategories[0]?.[1] || 0;

    const topCategoryPerc = (topCategoryValue / totalExpense) * 100;

    let classification = '';
    let severity: any = 'info';
    let text = `As despesas somam ${formatBRL(totalExpense)} e consomem ${commitmentRate.toFixed(1)}% da receita líquida. O maior centro de custo é a categoria "${topCategory}", representando ${topCategoryPerc.toFixed(1)}% dos gastos.`;
    let recommendation = '';

    if (commitmentRate >= 70) {
      classification = 'Gastos Críticos';
      severity = 'critical';
      text += ` Uma taxa de consumo de ${commitmentRate.toFixed(1)}% é perigosa.`;
      recommendation = `Corte imediato sugerido na categoria "${topCategory}". Audite as despesas mais caras (como "${highestExp.description}" de ${formatBRL(highestExp.value)}) e elimine o supérfluo.`;
    } else if (commitmentRate >= 50) {
      classification = 'Alerta de Custos';
      severity = 'warning';
      recommendation = `Estabeleça limites para a categoria "${topCategory}". Tente renegociar contratos ou buscar fornecedores mais baratos para o gasto "${highestExp.description}".`;
    } else if (topCategoryPerc > 50 && totalExpense > 1000) {
      classification = 'Gastos Concentrados';
      severity = 'warning';
      recommendation = `Alta concentração na categoria "${topCategory}". Avalie se não há dependência excessiva de um fornecedor ou desperdício neste setor.`;
    } else {
      classification = 'Custos Controlados';
      severity = 'positive';
      recommendation = 'Os gastos estão dentro de limites aceitáveis. Mantenha o acompanhamento para evitar surpresas no fim do mês.';
    }

    return {
      id: 'expense',
      type: 'expense',
      title: 'Diagnóstico de Despesas',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: formatBRL(totalExpense),
      secondaryMetric: `Maior ofensor: ${topCategory}`,
      text,
      recommendation,
      hasData: true,
      period: period.label
    };
  }
};
