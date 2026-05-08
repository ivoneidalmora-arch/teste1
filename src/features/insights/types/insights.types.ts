export type PeriodFilter = 
  | { 
      type: 'global'; 
      label: string; 
    }
  | { 
      type: 'month'; 
      label: string; 
      month: number; 
      year: number; 
      startDate: string; 
      endDate: string; 
    };

export interface FinancialMetrics {
  totalRevenueBruto: number;
  totalRevenueLiquido: number;
  totalExpense: number;
  netProfit: number; // receitaLiquida - totalDespesas
  saldoFinal: number; // receitaLiquida - totalDespesas
  expensePercentage: number; // (totalExpense / totalRevenueBruto) * 100
  expenseStatus: 'Saudável' | 'Atenção' | 'Crítico';
  
  topCustomer: { 
    name: string; 
    value: number;
    count?: number;
  };
  
  mostFrequentPlate: string;
  monthlyVariation: number;
  duplicatePlates: string[];
  
  expenseDetails: {
    topCategory: string;
    topCategoryValue: number;
    highestExpense: {
      description: string;
      value: number;
    };
    categories: Array<{ category: string; value: number }>;
  };
  
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
  };
  
  period: PeriodFilter;
}

export interface IAInsight {
  id: string;
  type: 'summary' | 'alert' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  content: string;
  created_at: string;
}
