import { FinancialMetrics, IAInsight } from "../types/insights.types";
import { formatBRL } from "@/core/utils/formatters";

export function generateLocalAnalysis(metrics: FinancialMetrics): IAInsight[] {
  const insights: IAInsight[] = [];
  const {
    totalRevenueLiquido,
    totalExpense,
    netProfit,
    expensePercentage,
    expenseStatus,
    topCustomer,
    duplicatePlates,
    expenseDetails,
    monthlyVariation
  } = metrics;

  // 1. Summary Insight
  insights.push({
    id: 'summary-' + Date.now(),
    type: 'summary',
    severity: 'info',
    title: 'Resumo do Período',
    content: `No período analisado, sua empresa obteve uma receita líquida de ${formatBRL(totalRevenueLiquido)} e despesas de ${formatBRL(totalExpense)}, resultando em um saldo final de ${formatBRL(netProfit)}. As despesas representam ${expensePercentage.toFixed(1)}% da receita bruta, indicando um cenário ${expenseStatus.toLowerCase()}.`,
    created_at: new Date().toISOString()
  });

  // 2. Alert/Critical Insight
  if (expenseStatus === 'Crítico' || expenseStatus === 'Atenção') {
    insights.push({
      id: 'alert-expense-' + Date.now(),
      type: 'alert',
      severity: expenseStatus === 'Crítico' ? 'critical' : 'warning',
      title: 'Alerta de Custos',
      content: `Atenção: seus custos estão em nível ${expenseStatus.toLowerCase()} (${expensePercentage.toFixed(1)}%). A categoria "${expenseDetails.topCategory}" é a que mais impacta seu caixa atualmente, totalizando ${formatBRL(expenseDetails.topCategoryValue)}. Recomendamos revisar despesas recorrentes imediatamente.`,
      created_at: new Date().toISOString()
    });
  } else if (duplicatePlates.length > 0) {
    insights.push({
      id: 'alert-duplicates-' + Date.now(),
      type: 'alert',
      severity: 'warning',
      title: 'Possíveis Duplicidades',
      content: `Foram detectadas ${duplicatePlates.length} placas com múltiplos lançamentos no mesmo período. Isso pode indicar erros de digitação ou cobranças duplicadas que precisam de revisão manual.`,
      created_at: new Date().toISOString()
    });
  } else {
    insights.push({
      id: 'alert-variation-' + Date.now(),
      type: 'alert',
      severity: monthlyVariation < 0 ? 'warning' : 'info',
      title: 'Desempenho Mensal',
      content: monthlyVariation < 0 
        ? `Houve uma queda de ${Math.abs(monthlyVariation).toFixed(1)}% na receita líquida em relação ao mês anterior. Monitore a entrada de novos serviços para evitar quebra de fluxo.`
        : `Sua receita cresceu ${monthlyVariation.toFixed(1)}% este mês. Excelente sinal de expansão das atividades!`,
      created_at: new Date().toISOString()
    });
  }

  // 3. Recommendation Insight
  insights.push({
    id: 'rec-' + Date.now(),
    type: 'recommendation',
    severity: 'info',
    title: 'Dica de Gestão',
    content: `O cliente "${topCustomer.name}" é seu maior parceiro, gerando ${formatBRL(topCustomer.value)} (${topCustomer.count} serviços). Recomendamos fortalecer este relacionamento e, ao mesmo tempo, buscar diversificar sua carteira para reduzir a dependência de um único cliente principal.`,
    created_at: new Date().toISOString()
  });

  return insights;
}
