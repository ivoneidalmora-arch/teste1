export interface FinancialMetrics {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  topCustomer: { name: string; value: number };
  mostFrequentPlate: string;
  monthlyVariation: number;
  duplicatePlates: string[];
  trends: {
    revenueGrowth: number;
    expenseGrowth: number;
  };
}

export interface IAInsight {
  id: string;
  type: 'summary' | 'alert' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  content: string;
  created_at: string;
}
