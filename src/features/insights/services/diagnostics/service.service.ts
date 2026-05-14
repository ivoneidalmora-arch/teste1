import { DiagnosticResult } from '../../types/diagnostics.types';
import { formatBRL } from '@/core/utils/formatters';
import { getNetAmount } from '../../utils/financial-normalization';

export const serviceDiagnosticService = {
  analyze(context: any): DiagnosticResult {
    const { rawRevenues, period } = context;

    let targetRevenues = rawRevenues;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
    }

    if (targetRevenues.length === 0) {
      return {
        id: 'service',
        type: 'service',
        title: 'Diagnóstico de Serviços',
        classification: 'Sem Serviços',
        severity: 'info',
        priority: 'low',
        mainMetric: '-',
        text: 'Não há registros de serviços prestados neste período.',
        hasData: false
      };
    }

    // Normalizar nomes de serviços
    const normalizeService = (cat: string) => {
      if (!cat) return 'Sem Serviço';
      const c = cat.toLowerCase();
      if (c.includes('completa') || c.includes('fixa') || c.includes('transferencia') || c.includes('transferência')) return 'Vistoria de Transferência';
      if (c.includes('simplificada') || c.includes('entrada')) return 'Vistoria de Entrada';
      if (c.includes('retorno')) return 'Vistoria de Retorno';
      if (c.includes('cautelar')) return 'Vistoria Cautelar';
      return 'Outros';
    };

    const servicesMap: Record<string, { count: number, value: number }> = {};
    
    targetRevenues.forEach((r: any) => {
      const s = normalizeService(r.category);
      const val = getNetAmount(r);
      if (!servicesMap[s]) servicesMap[s] = { count: 0, value: 0 };
      servicesMap[s].count += 1;
      servicesMap[s].value += val;
    });

    const sortedByValue = Object.entries(servicesMap).sort((a, b) => b[1].value - a[1].value);
    const sortedByCount = Object.entries(servicesMap).sort((a, b) => b[1].count - a[1].count);

    const mostValuableService = sortedByValue[0]?.[0] || 'Nenhum';
    const mostValuableTotal = sortedByValue[0]?.[1]?.value || 0;
    
    const mostSoldService = sortedByCount[0]?.[0] || 'Nenhum';
    const mostSoldTotal = sortedByCount[0]?.[1]?.count || 0;

    let classification = '';
    let severity: any = 'info';
    let text = `O serviço mais vendido é "${mostSoldService}" (${mostSoldTotal} un.), mas o que mais gera faturamento é "${mostValuableService}" (${formatBRL(mostValuableTotal)}).`;
    let recommendation = '';

    if (mostValuableService === 'Outros' || mostValuableService === 'Sem Serviço') {
      classification = 'Cadastro Incompleto';
      severity = 'warning';
      text = `A maior parte do faturamento vem de serviços não categorizados corretamente (${formatBRL(mostValuableTotal)}).`;
      recommendation = 'Padronize a classificação dos seus serviços no momento do lançamento para uma análise de rentabilidade precisa.';
    } else if (mostValuableService === mostSoldService) {
      classification = 'Carro-Chefe Forte';
      severity = 'positive';
      text = `"${mostValuableService}" é indiscutivelmente o motor do seu negócio, liderando em volume e faturamento.`;
      recommendation = 'Otimize a operação técnica deste serviço para reduzir tempo de execução e aumentar sua margem de lucro por unidade.';
    } else {
      classification = 'Mix Equilibrado';
      severity = 'positive';
      recommendation = `Você atrai clientes por volume com "${mostSoldService}", mas ganha no ticket com "${mostValuableService}". Tente fazer upsell do serviço mais rentável para os clientes de volume.`;
    }

    return {
      id: 'service',
      type: 'service',
      title: 'Diagnóstico de Serviços',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: mostValuableService,
      secondaryMetric: `Rendimento: ${formatBRL(mostValuableTotal)}`,
      text,
      recommendation,
      hasData: true
    };
  }
};
