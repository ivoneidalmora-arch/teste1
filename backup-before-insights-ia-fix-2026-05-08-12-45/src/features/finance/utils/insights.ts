import { Transaction } from '@/core/types/finance';
import { calculateFinancialMetrics, calculatePercentageChange, filterByMonth } from '@/core/utils/finance';
import { formatBRL } from '@/core/utils/formatters';
import { subMonths } from 'date-fns';
import { DuplicateGroup } from './duplicate-check';

export type InsightType = 'success' | 'warning' | 'danger' | 'info';

export interface FinancialInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
}

export function generatePeriodInsights(
  currentTransactions: Transaction[],
  allTransactions: Transaction[],
  selectedPeriod: string,
  duplicateGroups: DuplicateGroup[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  
  const currentMetrics = calculateFinancialMetrics(currentTransactions);
  
  // 1. Insight de Saldo
  if (currentMetrics.saldoDisponivel > 0) {
    insights.push({
      id: 'balance-pos',
      type: 'success',
      title: 'Saldo Positivo',
      description: `O saldo líquido do período está positivo em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMetrics.saldoDisponivel)}.`
    });
  } else if (currentMetrics.saldoDisponivel < 0) {
    insights.push({
      id: 'balance-neg',
      type: 'danger',
      title: 'Atenção ao Saldo',
      description: `O período apresenta um déficit de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(currentMetrics.saldoDisponivel))}.`
    });
  }

  // 2. Comparativo com mês anterior (se não for global)
  if (selectedPeriod !== 'global') {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    const prevDate = subMonths(currentDate, 1);
    
    const prevTransactions = filterByMonth(allTransactions, prevDate);
    const prevMetrics = calculateFinancialMetrics(prevTransactions);
    
    const variation = calculatePercentageChange(currentMetrics.receitaLiquida, prevMetrics.receitaLiquida);
    
    if (variation !== null && Math.abs(variation) > 0) {
      insights.push({
        id: 'variation-net',
        type: variation > 0 ? 'success' : 'warning',
        title: variation > 0 ? 'Crescimento em Receita' : 'Queda em Receita',
        description: `A receita líquida ${variation > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(variation).toFixed(1)}% em relação ao mês anterior.`
      });
    }

    // 2.1 Comparativo de Despesas com mês anterior
    const expVariation = calculatePercentageChange(currentMetrics.despesasTotal, prevMetrics.despesasTotal);
    if (expVariation !== null && Math.abs(expVariation) > 0) {
      const isReduction = expVariation < 0;
      insights.push({
        id: 'variation-expenses',
        type: isReduction ? 'success' : 'warning',
        title: isReduction ? 'Redução de Despesas' : 'Despesas em Alta',
        description: `As despesas ${isReduction ? 'caíram' : 'aumentaram'} ${Math.abs(expVariation).toFixed(1)}% em relação ao mês anterior, ${isReduction ? 'melhorando' : 'impactando'} o resultado.`
      });
    }
  }

  // 3. Insight de Duplicados
  if (duplicateGroups.length > 0) {
    const totalDupes = duplicateGroups.reduce((acc, g) => acc + g.transactions.length, 0);
    insights.push({
      id: 'duplicates-found',
      type: 'warning',
      title: 'Possíveis Duplicados',
      description: `Detectamos ${totalDupes} lançamentos suspeitos de duplicidade que precisam de revisão.`
    });
  }

  // 4. Recordistas (Serviço e Placa)
  const incomes = currentTransactions.filter(t => t.type === 'income');
  if (incomes.length > 0) {
    // Serviço mais comum
    const serviceCounts: Record<string, number> = {};
    incomes.forEach(t => {
      const cat = t.category || 'Outros';
      serviceCounts[cat] = (serviceCounts[cat] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
    
    if (topService) {
      insights.push({
        id: 'top-service',
        type: 'info',
        title: 'Serviço Recorrente',
        description: `O serviço "${topService[0]}" foi o mais realizado no período (${topService[1]} vezes).`
      });
    }

    // Placa mais comum
    const plateCounts: Record<string, number> = {};
    incomes.forEach(t => {
      const p = t.metadata?.placa;
      if (p) plateCounts[p] = (plateCounts[p] || 0) + 1;
    });
    const topPlate = Object.entries(plateCounts).sort((a, b) => b[1] - a[1])[0];
    
    if (topPlate && topPlate[1] > 1) {
      insights.push({
        id: 'top-plate',
        type: 'info',
        title: 'Veículo Frequente',
        description: `A placa ${topPlate[0]} teve o maior volume de lançamentos (${topPlate[1]}).`
      });
    }
  }

  // 5. Insight Detalhado de Despesas e Impacto
  const expenses = currentTransactions.filter(t => t.type === 'expense');
  if (expenses.length > 0) {
    const totalExpenses = currentMetrics.despesasTotal;
    const impactPercent = currentMetrics.receitaLiquida > 0 
      ? (totalExpenses / currentMetrics.receitaLiquida) * 100 
      : null;

    // Maior categoria de despesa
    const expenseCats: Record<string, number> = {};
    expenses.forEach(t => {
      const cat = t.category || 'Outros';
      expenseCats[cat] = (expenseCats[cat] || 0) + t.amount;
    });
    const topExpenseCat = Object.entries(expenseCats).sort((a, b) => b[1] - a[1])[0];

    let type: InsightType = 'info';
    let title = 'Despesas do Período';
    let description = `As despesas somam ${formatBRL(totalExpenses)}.`;

    if (impactPercent !== null) {
      if (impactPercent > 70) {
        type = 'danger';
        title = 'Atenção às Despesas';
        description = `As despesas chegaram a ${formatBRL(totalExpenses)}, consumindo ${impactPercent.toFixed(1)}% da receita líquida. Revise os custos para proteger o saldo.`;
      } else if (impactPercent > 40) {
        type = 'warning';
        title = 'Alerta de Custos';
        description = `As despesas do período representam ${impactPercent.toFixed(1)}% da receita líquida. A maior concentração está em "${topExpenseCat?.[0]}".`;
      } else {
        type = 'success';
        title = 'Despesas Controladas';
        description = `As despesas somam ${formatBRL(totalExpenses)} e representam ${impactPercent.toFixed(1)}% da receita líquida. O saldo permanece saudável.`;
      }
    } else {
       description = `As despesas do período somam ${formatBRL(totalExpenses)}. Registre suas receitas para analisar o impacto no saldo.`;
    }

    insights.push({
      id: 'expenses-analysis',
      type,
      title,
      description
    });
  }

  return insights;
}
