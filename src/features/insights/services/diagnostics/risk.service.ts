import { DiagnosticResult } from '../../types/diagnostics.types';

export const riskDiagnosticService = {
  analyze(inputs: { health: DiagnosticResult, growth: DiagnosticResult, expense: DiagnosticResult, client: DiagnosticResult, service: DiagnosticResult, context: any }): DiagnosticResult {
    const { health, growth, client, context } = inputs;

    if (!health.hasData) {
      return {
        id: 'risk',
        type: 'risk',
        title: 'Diagnóstico de Risco Financeiro',
        classification: 'Sem Dados',
        severity: 'info',
        priority: 'low',
        mainMetric: '-',
        text: 'Não é possível mensurar o risco financeiro sem dados suficientes.',
        hasData: false
      };
    }

    let riskScore = 0;
    const riskFactors: string[] = [];

    // 1. Dependência de cliente
    if (client.severity === 'critical') {
      riskScore += 4;
      riskFactors.push('Altíssima dependência de um único cliente.');
    } else if (client.severity === 'warning') {
      riskScore += 2;
      riskFactors.push('Carteira de clientes concentrada.');
    }

    // 2. Queda de receita ou aumento desproporcional de despesas
    if (growth.classification === 'Queda Contínua') {
      riskScore += 3;
      riskFactors.push('Receita em queda contínua.');
    } else if (growth.classification === 'Crescimento de Risco') {
      riskScore += 2;
      riskFactors.push('Despesas subindo mais rápido que a receita.');
    }

    // 3. Saúde Financeira
    if (health.classification === 'Crítica') {
      riskScore += 5;
      riskFactors.push('Despesas maiores que a receita líquida ou saldo negativo.');
    } else if (health.classification === 'Atenção') {
      riskScore += 3;
      riskFactors.push('Baixa margem líquida e alto comprometimento da receita.');
    }

    let classification = '';
    let severity: any = 'info';
    let text = '';
    let recommendation = '';

    if (riskScore >= 7) {
      classification = 'Risco Crítico';
      severity = 'critical';
      text = `A empresa apresenta múltiplos alertas vermelhos. Fatores: ${riskFactors.slice(0, 2).join(' ')}`;
      recommendation = 'Convoque uma reunião emergencial de caixa. Interrompa gastos não operacionais e foque exclusivamente na recuperação de margem.';
    } else if (riskScore >= 4) {
      classification = 'Risco Alto';
      severity = 'warning';
      text = `O negócio está exposto a riscos significativos. Fatores: ${riskFactors.slice(0, 2).join(' ')}`;
      recommendation = 'Execute um plano de contenção de riscos: renegocie prazos com fornecedores e diversifique sua entrada de receitas.';
    } else if (riskScore >= 2) {
      classification = 'Risco Moderado';
      severity = 'info';
      text = 'Existem pontos de atenção pontuais, mas a operação não está ameaçada a curto prazo.';
      recommendation = 'Trabalhe para corrigir pequenas ineficiências identificadas nos diagnósticos de despesas e crescimento.';
    } else {
      classification = 'Risco Baixo';
      severity = 'positive';
      text = 'A operação apresenta um perfil sólido, com fluxo de caixa protegido e margens operacionais seguras.';
      recommendation = 'Mantenha as políticas atuais de gestão financeira.';
    }

    return {
      id: 'risk',
      type: 'risk',
      title: 'Diagnóstico de Risco Financeiro',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: classification,
      secondaryMetric: `Fatores: ${riskFactors.length}`,
      text,
      recommendation,
      hasData: true
    };
  }
};
