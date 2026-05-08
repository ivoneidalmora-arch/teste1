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

export type DuplicateStatus =
  | "pending_review"
  | "confirmed_duplicate"
  | "not_duplicate"
  | "ignored"
  | "resolved";

export type DuplicateConfidence =
  | "high"
  | "medium"
  | "low";

export type DuplicateRecord = {
  id: string;
  date: string;
  cliente?: string | null;
  placa?: string | null;
  servico?: string | null;
  amountBruto?: number | null;
  amountLiquido?: number | null;
  amount?: number | null; // fallback
};

export type DuplicateGroup = {
  groupKey: string;
  placa: string;
  servico: string;
  cliente?: string | null;
  records: DuplicateRecord[];
  confidence: DuplicateConfidence;
  status: DuplicateStatus;
  daysBetween: number;
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
  duplicatePlates: string[]; // Manter por compatibilidade ou remover se migrar tudo
  duplicateGroups: DuplicateGroup[];
  
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
