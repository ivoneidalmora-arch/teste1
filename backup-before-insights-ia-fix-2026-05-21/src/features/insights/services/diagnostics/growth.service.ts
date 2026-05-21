import { DiagnosticResult } from '../../types/diagnostics.types';
import { formatBRL } from '@/core/utils/formatters';
import { getNetAmount, getExpenseAmount } from '../../utils/financial-normalization';

export const growthDiagnosticService = {
  analyze(context: any): DiagnosticResult {
    const { rawRevenues, rawExpenses, period } = context;

    // Agrupar dados por mês: yyyy-MM
    const monthsMap: Record<string, { rev: number, exp: number, net: number }> = {};
    
    // Processar todas as receitas
    rawRevenues.forEach((r: any) => {
      const date = r.date;
      if (!date) return;
      const monthKey = date.substring(0, 7);
      if (!monthsMap[monthKey]) monthsMap[monthKey] = { rev: 0, exp: 0, net: 0 };
      monthsMap[monthKey].rev += getNetAmount(r);
    });

    // Processar todas as despesas
    rawExpenses.forEach((e: any) => {
      const date = e.date;
      if (!date) return;
      const monthKey = date.substring(0, 7);
      if (!monthsMap[monthKey]) monthsMap[monthKey] = { rev: 0, exp: 0, net: 0 };
      monthsMap[monthKey].exp += getExpenseAmount(e);
    });

    // Calcular saldo de cada mês
    Object.keys(monthsMap).forEach(key => {
      monthsMap[key].net = monthsMap[key].rev - monthsMap[key].exp;
    });

    const sortedMonths = Object.keys(monthsMap).sort().reverse();

    if (sortedMonths.length < 2) {
      return {
        id: 'growth',
        type: 'growth',
        title: 'Diagnóstico de Crescimento',
        classification: 'Sem Dados Suficientes',
        severity: 'info',
        priority: 'low',
        mainMetric: '-',
        text: 'Ainda não há dados de dois períodos distintos para calcular a tendência de crescimento.',
        hasData: false,
        period: period.label
      };
    }

    let currentMonth = '';
    let prevMonth = '';
    let prevPrevMonth = '';

    if (period.type === 'month') {
      currentMonth = `${period.year}-${String(period.month).padStart(2, '0')}`;
      const targetDate = new Date(period.year, period.month - 1, 1);
      
      const p1Date = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
      prevMonth = `${p1Date.getFullYear()}-${String(p1Date.getMonth() + 1).padStart(2, '0')}`;
      
      const p2Date = new Date(targetDate.getFullYear(), targetDate.getMonth() - 2, 1);
      prevPrevMonth = `${p2Date.getFullYear()}-${String(p2Date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // Se for global, pega os últimos 3 meses com dados
      currentMonth = sortedMonths[0];
      prevMonth = sortedMonths[1];
      prevPrevMonth = sortedMonths[2] || '';
    }

    const currentData = monthsMap[currentMonth] || { rev: 0, exp: 0, net: 0 };
    const prevData = monthsMap[prevMonth] || { rev: 0, exp: 0, net: 0 };
    const prevPrevData = monthsMap[prevPrevMonth] || { rev: 0, exp: 0, net: 0 };

    const calcVar = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const revVar = calcVar(currentData.rev, prevData.rev);
    const expVar = calcVar(currentData.exp, prevData.exp);
    const netVar = calcVar(currentData.net, prevData.net);

    const prevRevVar = calcVar(prevData.rev, prevPrevData.rev); // variação do mês anterior em relação ao retrasado

    let classification = '';
    let severity: any = 'info';
    let text = `Em relação ao mês anterior, sua receita variou ${revVar > 0 ? '+' : ''}${revVar.toFixed(1)}%, e as despesas ${expVar > 0 ? '+' : ''}${expVar.toFixed(1)}%.`;
    let recommendation = '';

    if (revVar < 0 && prevRevVar < 0 && prevPrevMonth) {
      classification = 'Queda Contínua';
      severity = 'critical';
      text += ' Atenção: a receita caiu por dois períodos consecutivos.';
      recommendation = 'Investigue imediatamente a causa da queda de faturamento. Avalie retenção de clientes e ajuste o foco comercial.';
    } else if (revVar > 0 && expVar > (revVar * 1.5)) {
      classification = 'Crescimento de Risco';
      severity = 'warning';
      text += ` Atenção: as despesas cresceram muito mais (${expVar.toFixed(1)}%) que a receita (${revVar.toFixed(1)}%).`;
      recommendation = 'O crescimento está custando caro. Revise as novas despesas assumidas neste período para garantir que são escaláveis.';
    } else if (revVar > 0 && netVar > 0) {
      classification = 'Crescimento Saudável';
      severity = 'positive';
      text += ` O saldo final apresentou excelente crescimento de ${netVar.toFixed(1)}%.`;
      recommendation = 'Mantenha a estratégia atual. O crescimento está gerando aumento real de lucratividade.';
    } else if (Math.abs(revVar) < 5) {
      classification = 'Estabilidade';
      severity = 'info';
      text += ' O cenário atual é de estabilidade operacional.';
      recommendation = 'Aproveite a estabilidade para organizar processos internos e planejar o próximo ciclo de expansão.';
    } else if (revVar < 0) {
      classification = 'Queda Pontual';
      severity = 'warning';
      text += ' Houve uma redução no faturamento este mês.';
      recommendation = 'Verifique se a queda é sazonal. Caso contrário, reative contatos comerciais para recuperar o volume.';
    } else {
      classification = 'Crescimento';
      severity = 'positive';
      recommendation = 'Acompanhe se a tendência se mantém nos próximos meses.';
    }

    return {
      id: 'growth',
      type: 'growth',
      title: 'Diagnóstico de Crescimento',
      classification,
      severity,
      priority: severity === 'critical' ? 'urgent' : severity === 'warning' ? 'high' : 'medium',
      mainMetric: `${revVar > 0 ? '+' : ''}${revVar.toFixed(1)}%`,
      secondaryMetric: `Saldo: ${netVar > 0 ? '+' : ''}${netVar.toFixed(1)}%`,
      variation: revVar,
      text,
      recommendation,
      hasData: true,
      period: period.label
    };
  }
};
