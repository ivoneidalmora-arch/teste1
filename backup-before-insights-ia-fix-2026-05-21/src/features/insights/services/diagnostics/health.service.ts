import { DiagnosticResult } from '../../types/diagnostics.types';
import { formatBRL } from '@/core/utils/formatters';
import { getGrossAmount, getNetAmount, getExpenseAmount } from '../../utils/financial-normalization';

export const healthDiagnosticService = {
  analyze(context: any): DiagnosticResult {
    const { rawRevenues, rawExpenses, period } = context;

    // Filtrar dados apenas para o período alvo
    let targetRevenues = rawRevenues;
    let targetExpenses = rawExpenses;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
      targetExpenses = rawExpenses.filter((e: any) => e.date >= period.startDate && e.date <= period.endDate);
    }

    const totalRevenueBruto = targetRevenues.reduce((acc: number, curr: any) => acc + getGrossAmount(curr), 0);
    const totalRevenueLiquido = targetRevenues.reduce((acc: number, curr: any) => acc + getNetAmount(curr), 0);
    const totalExpense = targetExpenses.reduce((acc: number, curr: any) => acc + getExpenseAmount(curr), 0);
    const netProfit = totalRevenueLiquido - totalExpense;

    const hasData = totalRevenueBruto > 0 || totalExpense > 0;
    
    if (!hasData) {
      return {
        id: 'health',
        type: 'health',
        title: 'Saúde Financeira Global',
        classification: 'Sem Dados',
        severity: 'info',
        priority: 'low',
        mainMetric: 'R$ 0,00',
        text: 'Ainda não há dados suficientes para gerar este diagnóstico com precisão.',
        hasData: false,
        period: period.label
      };
    }

    const netMargin = totalRevenueLiquido > 0 ? (netProfit / totalRevenueLiquido) * 100 : 0;
    const commitmentRate = totalRevenueLiquido > 0 ? (totalExpense / totalRevenueLiquido) * 100 : (totalExpense > 0 ? 100 : 0);
    
    let classification = '';
    let severity: any = 'info';
    let text = '';
    let recommendation = '';

    if (commitmentRate >= 80 || netProfit < 0) {
      classification = 'Crítica';
      severity = 'critical';
      text = `Sua empresa apresenta um quadro financeiro crítico. As despesas consomem ${commitmentRate.toFixed(1)}% da receita líquida, resultando em um saldo de ${formatBRL(netProfit)}.`;
      recommendation = 'Congele despesas não essenciais imediatamente e inicie um plano rigoroso de reestruturação de custos fixos.';
    } else if (commitmentRate >= 60) {
      classification = 'Atenção';
      severity = 'warning';
      text = `A saúde financeira requer monitoramento. O nível de despesas (${commitmentRate.toFixed(1)}% da receita líquida) está alto, deixando uma margem líquida de apenas ${netMargin.toFixed(1)}%.`;
      recommendation = 'Revise contratos de fornecedores, elimine redundâncias e busque otimizar processos operacionais para aliviar o fluxo de caixa.';
    } else if (commitmentRate >= 30) {
      classification = 'Saudável';
      severity = 'positive';
      text = `Sua saúde financeira está equilibrada. A margem líquida de ${netMargin.toFixed(1)}% indica uma boa capacidade de geração de caixa para manter a operação segura.`;
      recommendation = 'Mantenha o rigor no controle de custos e estude destinar parte do lucro para a criação de um fundo de reserva estratégico.';
    } else {
      classification = 'Excelente';
      severity = 'positive';
      text = `Performance financeira de altíssimo nível. A taxa de comprometimento é de apenas ${commitmentRate.toFixed(1)}% da receita líquida e a margem atinge ${netMargin.toFixed(1)}%.`;
      recommendation = 'Cenário ideal. Utilize a forte geração de caixa para investimentos agressivos em marketing, inovação ou expansão das operações.';
    }

    return {
      id: 'health',
      type: 'health',
      title: 'Saúde Financeira Global',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: formatBRL(netProfit),
      secondaryMetric: `Margem: ${netMargin.toFixed(1)}%`,
      text,
      recommendation,
      hasData: true,
      period: period.label
    };
  }
};
