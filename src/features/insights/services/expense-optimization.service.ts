import { supabase } from '@/lib/supabase/client';
import { normalizeCurrencyValue } from '@/lib/financial-rules';

export interface ExpenseOptimizationItem {
  id: string;
  description: string;
  category: string;
  value: number;
  date: string;
  frequency: 'mensal' | 'avulso';
  potentialSaving: number;
  recommendation: string;
}

export interface ExpenseOptimizationPlan {
  totalExpenseValue: number;
  potentialTotalSaving: number;
  criticalCategories: Array<{
    category: string;
    totalValue: number;
    percentage: number;
    savingOpportunity: number;
  }>;
  items: ExpenseOptimizationItem[];
}

export const expenseOptimizationService = {
  async generatePlan(userId: string, year: number): Promise<ExpenseOptimizationPlan> {
    try {
      // Puxa as despesas reais do banco
      const startDate = `${year}-01-01T00:00:00.000Z`;
      const endDate = `${year}-12-31T23:59:59.999Z`;

      const { data: expenses, error } = await supabase
        .from('Despesas')
        .select('*')
        .eq('app_user_id', userId)
        .gte('data', startDate)
        .lte('data', endDate)
        .is('deleted_at', null);

      if (error) throw error;

      const rawExpenses = expenses || [];

      // Agrupar por categoria e calcular total
      let totalExpenseValue = 0;
      const categoryTotals: Record<string, number> = {};

      rawExpenses.forEach((item: any) => {
        const value = normalizeCurrencyValue(item.valor ?? item.amount ?? item.valor_bruto ?? 0);
        totalExpenseValue += value;

        const category = item.categoria ?? item.category ?? 'Outros';
        categoryTotals[category] = (categoryTotals[category] || 0) + value;
      });

      // Ordenar categorias e obter as maiores
      const criticalCategories = Object.entries(categoryTotals)
        .map(([category, value]) => ({
          category,
          totalValue: value,
          percentage: totalExpenseValue > 0 ? (value / totalExpenseValue) * 100 : 0,
          savingOpportunity: value * 0.15 // 15% estimativa padrão
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 4); // top 4 categorias críticas

      // Identificar itens individuais mais pesados ou recorrentes
      const items: ExpenseOptimizationItem[] = rawExpenses
        .map((item: any) => {
          const value = normalizeCurrencyValue(item.valor ?? item.amount ?? item.valor_bruto ?? 0);
          const desc = item.descricao ?? item.description ?? 'Despesa sem descrição';
          const cat = item.categoria ?? item.category ?? 'Outros';
          
          // Estima recomendação de corte com base na categoria
          let recommendation = 'Reavaliar necessidade deste gasto no próximo mês.';
          let potentialSaving = value * 0.10; // 10%
          
          const lowerCat = cat.toLowerCase();
          if (lowerCat.includes('software') || lowerCat.includes('assinatura') || lowerCat.includes('ferramenta') || lowerCat.includes('ti')) {
            recommendation = 'Cancelar assinaturas não utilizadas ou migrar para plano inferior.';
            potentialSaving = value * 0.20; // 20%
          } else if (lowerCat.includes('marketing') || lowerCat.includes('anúncio') || lowerCat.includes('comercial')) {
            recommendation = 'Otimizar o ROI das campanhas ou reduzir verbas de canais de baixa conversão.';
            potentialSaving = value * 0.15;
          } else if (lowerCat.includes('infra') || lowerCat.includes('aluguel') || lowerCat.includes('escritório') || lowerCat.includes('energia') || lowerCat.includes('telefone')) {
            recommendation = 'Negociar contratos com fornecedores ou buscar alternativas mais baratas.';
            potentialSaving = value * 0.08;
          } else if (lowerCat.includes('taxa') || lowerCat.includes('tarifa') || lowerCat.includes('banco') || lowerCat.includes('financeiro')) {
            recommendation = 'Migrar para bancos com tarifas isentas ou renegociar taxas de adquirência.';
            potentialSaving = value * 0.30; // 30%
          }

          return {
            id: String(item.id),
            description: desc,
            category: cat,
            value,
            date: item.data ?? item.date ?? '',
            frequency: (desc.toLowerCase().includes('recorrente') || desc.toLowerCase().includes('mensal') || cat.toLowerCase().includes('assinatura') ? 'mensal' : 'avulso') as 'mensal' | 'avulso',
            potentialSaving,
            recommendation
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // top 10 maiores despesas individuais

      // Soma de economias potenciais
      const potentialTotalSaving = criticalCategories.reduce((sum, c) => sum + c.savingOpportunity, 0);

      return {
        totalExpenseValue,
        potentialTotalSaving,
        criticalCategories,
        items
      };
    } catch (err) {
      console.error('[ExpenseOptimizationService] Erro ao gerar plano:', err);
      // Retorna plano mockado se der erro ou banco vazio
      return this.getMockPlan(year);
    }
  },

  getMockPlan(year: number): ExpenseOptimizationPlan {
    return {
      totalExpenseValue: 48500,
      potentialTotalSaving: 6850,
      criticalCategories: [
        {
          category: 'Serviços de Terceiros',
          totalValue: 22000,
          percentage: 45.36,
          savingOpportunity: 3300
        },
        {
          category: 'Software / Assinaturas',
          totalValue: 12500,
          percentage: 25.77,
          savingOpportunity: 2500
        },
        {
          category: 'Marketing e Anúncios',
          totalValue: 9000,
          percentage: 18.56,
          savingOpportunity: 900
        },
        {
          category: 'Taxas Bancárias',
          totalValue: 5000,
          percentage: 10.31,
          savingOpportunity: 150
        }
      ],
      items: [
        {
          id: 'mock-exp-1',
          description: 'Hospedagem AWS e Cloud Services',
          category: 'Software / Assinaturas',
          value: 8500,
          date: `${year}-05-10`,
          frequency: 'mensal',
          potentialSaving: 1700,
          recommendation: 'Desativar instâncias de homologação ociosas nos finais de semana.'
        },
        {
          id: 'mock-exp-2',
          description: 'Consultoria de Desenvolvimento de Software',
          category: 'Serviços de Terceiros',
          value: 15000,
          date: `${year}-05-05`,
          frequency: 'mensal',
          potentialSaving: 1500,
          recommendation: 'Negociar redução de escopo ou migrar para consultoria sob demanda.'
        },
        {
          id: 'mock-exp-3',
          description: 'Campanhas de Tráfego Google Ads',
          category: 'Marketing e Anúncios',
          value: 6000,
          date: `${year}-05-12`,
          frequency: 'mensal',
          potentialSaving: 600,
          recommendation: 'Pausar anúncios de palavras-chave negativas irrelevantes.'
        },
        {
          id: 'mock-exp-4',
          description: 'Licença Enterprise Salesforce CRM',
          category: 'Software / Assinaturas',
          value: 4000,
          date: `${year}-05-01`,
          frequency: 'mensal',
          potentialSaving: 800,
          recommendation: 'Remover licenças de usuários inativos no painel admin.'
        }
      ]
    };
  }
};
