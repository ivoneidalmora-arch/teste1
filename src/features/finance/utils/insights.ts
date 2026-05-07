import { Transaction } from '@/core/types/finance';
import { calculateFinancialMetrics, calculatePercentageChange, filterByMonth } from '@/core/utils/finance';
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

  return insights;
}
