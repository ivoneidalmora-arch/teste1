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
    duplicateGroups,
    expenseDetails,
    monthlyVariation
  } = metrics;

  const isGlobal = metrics.period.type === 'global';

  // 1. Summary Insight
  insights.push({
    id: 'summary-' + Date.now(),
    type: 'summary',
    severity: 'info',
    title: isGlobal ? 'Resumo Histórico Global' : 'Resumo do Período',
    content: isGlobal 
      ? `Considerando todo o histórico do sistema, sua empresa acumulou uma receita líquida de ${formatBRL(totalRevenueLiquido)} e despesas totais de ${formatBRL(totalExpense)}, com um saldo acumulado de ${formatBRL(netProfit)}. A taxa média de comprometimento é de ${expensePercentage.toFixed(1)}%.`
      : `No período analisado, sua empresa obteve uma receita líquida de ${formatBRL(totalRevenueLiquido)} e despesas de ${formatBRL(totalExpense)}, resultando em um saldo final de ${formatBRL(netProfit)}. As despesas representam ${expensePercentage.toFixed(1)}% da receita bruta, indicando um cenário ${expenseStatus.toLowerCase()}.`,
    created_at: new Date().toISOString()
  });

  // 2. Alert/Critical Insight
  if (expenseStatus === 'Crítico' || expenseStatus === 'Atenção') {
    insights.push({
      id: 'alert-expense-' + Date.now(),
      type: 'alert',
      severity: expenseStatus === 'Crítico' ? 'critical' : 'warning',
      title: isGlobal ? 'Gestão de Custos Acumulados' : 'Alerta de Custos',
      content: isGlobal
        ? `Historicamente, seus custos representam ${expensePercentage.toFixed(1)}% da receita bruta. A categoria "${expenseDetails.topCategory}" é o maior ralo financeiro acumulado (${formatBRL(expenseDetails.topCategoryValue)}). Recomendamos uma auditoria em contratos fixos.`
        : `Atenção: seus custos estão em nível ${expenseStatus.toLowerCase()} (${expensePercentage.toFixed(1)}%). A categoria "${expenseDetails.topCategory}" é a que mais impacta seu caixa atualmente, totalizando ${formatBRL(expenseDetails.topCategoryValue)}. Recomendamos revisar despesas recorrentes imediatamente.`,
      created_at: new Date().toISOString()
    });
  } else if (duplicateGroups.filter(g => g.status === 'pending_review').length > 0) {
    const pendingCount = duplicateGroups.filter(g => g.status === 'pending_review').length;
    insights.push({
      id: 'alert-duplicates-' + Date.now(),
      type: 'alert',
      severity: 'warning',
      title: isGlobal ? 'Auditoria Pendente' : 'Possíveis Duplicidades',
      content: `Existem ${pendingCount} possíveis duplicidades pendentes de revisão. Registros duplicados podem inflar sua receita líquida artificialmente. Recomendamos validar estes lançamentos na Central de Auditoria.`,
      created_at: new Date().toISOString()
    });
  } else if (duplicateGroups.filter(g => g.status === 'confirmed_duplicate').length > 0) {
    insights.push({
      id: 'alert-confirmed-' + Date.now(),
      type: 'alert',
      severity: 'info',
      title: 'Duplicidades Identificadas',
      content: `Você possui ${duplicateGroups.filter(g => g.status === 'confirmed_duplicate').length} duplicidades confirmadas no sistema. Considere excluir os registros excedentes para manter a precisão do lucro líquido.`,
      created_at: new Date().toISOString()
    });
  } else {
    insights.push({
      id: 'alert-variation-' + Date.now(),
      type: 'alert',
      severity: monthlyVariation < 0 ? 'warning' : 'info',
      title: isGlobal ? 'Tendência de Crescimento' : 'Desempenho Mensal',
      content: isGlobal
        ? `A variação entre os últimos dois meses com dados foi de ${monthlyVariation.toFixed(1)}%. ${monthlyVariation < 0 ? 'Houve uma desaceleração recente que precisa de atenção.' : 'O negócio mantém uma tendência de alta no fechamento histórico.'}`
        : (monthlyVariation < 0 
          ? `Houve uma queda de ${Math.abs(monthlyVariation).toFixed(1)}% na receita líquida em relação ao mês anterior. Monitore a entrada de novos serviços para evitar quebra de fluxo.`
          : `Sua receita cresceu ${monthlyVariation.toFixed(1)}% este mês. Excelente sinal de expansão das atividades!`),
      created_at: new Date().toISOString()
    });
  }

  // 3. Recommendation Insight
  insights.push({
    id: 'rec-' + Date.now(),
    type: 'recommendation',
    severity: 'info',
    title: isGlobal ? 'Estratégia de Longo Prazo' : 'Dica de Gestão',
    content: isGlobal
      ? `Seu maior cliente histórico é "${topCustomer.name}", com ${formatBRL(topCustomer.value)} gerados. Em uma visão global, ele representa uma fatia vital do seu faturamento. Considere planos de fidelização para grandes volumes.`
      : `O cliente "${topCustomer.name}" é seu maior parceiro, gerando ${formatBRL(topCustomer.value)} (${topCustomer.count} serviços). Recomendamos fortalecer este relacionamento e, ao mesmo tempo, buscar diversificar sua carteira para reduzir a dependência de um único cliente principal.`,
    created_at: new Date().toISOString()
  });

  return insights;
}
