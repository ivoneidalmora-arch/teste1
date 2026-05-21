import { DiagnosticResult } from '../../types/diagnostics.types';
import { formatBRL } from '@/core/utils/formatters';

export const clientDiagnosticService = {
  analyze(context: any): DiagnosticResult {
    const { rawRevenues, period } = context;

    let targetRevenues = rawRevenues;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
    }

    if (targetRevenues.length === 0) {
      return {
        id: 'client',
        type: 'client',
        title: 'Diagnóstico de Clientes',
        classification: 'Sem Clientes',
        severity: 'info',
        priority: 'low',
        mainMetric: '-',
        text: 'Não há registros de clientes com receitas válidas neste período.',
        hasData: false
      };
    }

    const totalRevenueLiquido = targetRevenues.reduce((acc: number, curr: any) => acc + (Number(curr.amountLiquido) || Number(curr.amount) || 0), 0);

    // Mapear clientes do período
    const clientsMap: Record<string, { value: number, count: number }> = {};
    targetRevenues.forEach((r: any) => {
      const name = r.cliente && r.cliente.trim() !== '' ? r.cliente : 'Sem Nome';
      const val = Number(r.amountLiquido) || Number(r.amount) || 0;
      if (!clientsMap[name]) clientsMap[name] = { value: 0, count: 0 };
      clientsMap[name].value += val;
      clientsMap[name].count += 1;
    });

    const sortedClients = Object.entries(clientsMap).sort((a, b) => b[1].value - a[1].value);
    
    // Ignorar "Sem Nome" se houver clientes reais para ser o "top client"
    let topClientName = sortedClients[0]?.[0];
    let topClientValue = sortedClients[0]?.[1]?.value || 0;
    let topClientCount = sortedClients[0]?.[1]?.count || 0;

    const realClients = sortedClients.filter(c => c[0].toLowerCase() !== 'sem nome' && c[0].toLowerCase() !== 'sn' && c[0].toLowerCase() !== 's/n');
    if (realClients.length > 0) {
      topClientName = realClients[0][0];
      topClientValue = realClients[0][1].value;
      topClientCount = realClients[0][1].count;
    }

    const topClientPerc = totalRevenueLiquido > 0 ? (topClientValue / totalRevenueLiquido) * 100 : 0;

    let classification = '';
    let severity: any = 'info';
    const text = `O cliente principal no período foi "${topClientName}", responsável por ${formatBRL(topClientValue)} (${topClientCount} serviços), o que representa ${topClientPerc.toFixed(1)}% do faturamento.`;
    let recommendation = '';

    if (topClientPerc > 50 && totalRevenueLiquido > 1000) {
      classification = 'Alta Dependência';
      severity = 'critical';
      recommendation = `Risco altíssimo: um único cliente concentra mais da metade da sua receita. Diversifique imediatamente sua base de clientes para evitar falência em caso de perda deste contrato.`;
    } else if (topClientPerc > 30) {
      classification = 'Concentração Relevante';
      severity = 'warning';
      recommendation = `O cliente possui grande peso no seu negócio. Crie ações de fidelização robustas (programas de vantagens, atendimento VIP) para retê-lo, mas não pare de prospectar.`;
    } else {
      classification = 'Carteira Diversificada';
      severity = 'positive';
      recommendation = `Sua carteira de clientes está bem distribuída. Identifique os clientes que mais crescem e ofereça pacotes de serviços para aumentar o ticket médio.`;
    }

    return {
      id: 'client',
      type: 'client',
      title: 'Diagnóstico de Clientes',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: topClientName,
      secondaryMetric: `Fatia: ${topClientPerc.toFixed(1)}%`,
      text,
      recommendation,
      hasData: true
    };
  }
};
