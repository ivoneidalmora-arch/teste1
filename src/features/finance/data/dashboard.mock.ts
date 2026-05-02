import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  DashboardMetric, 
  RecentTransaction, 
  CashFlowData, 
  FinancialAlert, 
  TopClient, 
  CategoryDistribution, 
  CalendarEvent 
} from '../types/dashboard.types';

export const MOCK_METRICS: DashboardMetric[] = [
  {
    id: '1',
    title: 'Receita Bruta',
    value: 125000.50,
    formattedValue: 'R$ 125.000,50',
    change: 12.5,
    trend: 'up',
    icon: TrendingUp,
    color: 'green',
    sparkline: [30, 45, 35, 50, 48, 60]
  },
  {
    id: '2',
    title: 'Receita Líquida',
    value: 98450.20,
    formattedValue: 'R$ 98.450,20',
    change: 8.2,
    trend: 'up',
    icon: ShieldCheck,
    color: 'blue',
    sparkline: [25, 35, 30, 45, 40, 55]
  },
  {
    id: '3',
    title: 'Despesa Total',
    value: 42300.00,
    formattedValue: 'R$ 42.300,00',
    change: -5.4,
    trend: 'down',
    icon: TrendingDown,
    color: 'red',
    sparkline: [40, 38, 42, 35, 30, 28]
  },
  {
    id: '4',
    title: 'Despesas Pendentes',
    value: 8450.00,
    formattedValue: 'R$ 8.450,00',
    change: 2.1,
    trend: 'up',
    icon: Clock,
    color: 'orange',
    sparkline: [10, 12, 15, 14, 18, 20]
  },
  {
    id: '5',
    title: 'Saldo Atual',
    value: 1283750.90,
    formattedValue: 'R$ 1.283.750,90',
    change: 18.4,
    trend: 'up',
    icon: Wallet,
    color: 'purple',
    sparkline: [60, 65, 70, 75, 80, 85]
  },
  {
    id: '6',
    title: 'Lucro do Mês',
    value: 56150.30,
    formattedValue: 'R$ 56.150,30',
    change: 15.2,
    trend: 'up',
    icon: Target,
    color: 'green',
    sparkline: [20, 25, 30, 35, 45, 50]
  }
];

export const MOCK_CASH_FLOW: CashFlowData[] = [
  { name: 'Jan', entradas: 45000, saidas: 32000, saldo: 13000 },
  { name: 'Fev', entradas: 52000, saidas: 35000, saldo: 17000 },
  { name: 'Mar', entradas: 48000, saidas: 41000, saldo: 7000 },
  { name: 'Abr', entradas: 61000, saidas: 38000, saldo: 23000 },
  { name: 'Mai', entradas: 55000, saidas: 33000, saldo: 22000 },
  { name: 'Jun', entradas: 67000, saidas: 39000, saldo: 28000 },
];

export const MOCK_ALERTS: FinancialAlert[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Despesa acima do normal',
    description: 'Gastos com Infraestrutura subiram 24% comparado ao mês anterior.',
    time: '2h atrás',
    icon: AlertCircle
  },
  {
    id: '2',
    type: 'warning',
    title: 'Faturas próximas do vencimento',
    description: '3 despesas pendentes vencem nos próximos 2 dias. Total: R$ 4.250,00.',
    time: '5h atrás',
    icon: Clock
  },
  {
    id: '3',
    type: 'success',
    title: 'Receita recorde detectada',
    description: 'Hoje foi o dia com maior volume de vistorias deste semestre.',
    time: '1 dia atrás',
    icon: Zap
  }
];

export const MOCK_TRANSACTIONS: RecentTransaction[] = [
  {
    id: '1',
    date: '2026-05-02',
    description: 'Vistoria Cautelar - Porsche 911',
    customer: 'Auto Premium',
    category: 'Vistoria',
    amount: 450.00,
    status: 'paid',
    origin: 'ocr',
    type: 'income'
  },
  {
    id: '2',
    date: '2026-05-01',
    description: 'Assinatura AWS Cloud',
    customer: 'Amazon Web Services',
    category: 'Software',
    amount: 1250.80,
    status: 'paid',
    origin: 'supabase',
    type: 'expense'
  },
  {
    id: '3',
    date: '2026-05-01',
    description: 'Aluguel Escritório Central',
    customer: 'Imobiliária São Mateus',
    category: 'Infraestrutura',
    amount: 3500.00,
    status: 'pending',
    origin: 'manual',
    type: 'expense'
  },
  {
    id: '4',
    date: '2026-04-30',
    description: 'Vistoria de Transferência - Hilux',
    customer: 'Particular',
    category: 'Transferência',
    amount: 180.00,
    status: 'paid',
    origin: 'import',
    type: 'income'
  },
  {
    id: '5',
    date: '2026-04-29',
    description: 'Marketing Digital Google Ads',
    customer: 'Google Ireland',
    category: 'Marketing',
    amount: 850.00,
    status: 'paid',
    origin: 'supabase',
    type: 'expense'
  }
];

export const MOCK_TOP_CLIENTS: TopClient[] = [
  { id: '1', name: 'Localiza Rent a Car', amount: 45200.00, percentage: 85 },
  { id: '2', name: 'Auto Premium SP', amount: 32150.50, percentage: 65 },
  { id: '3', name: 'Particular S. Mateus', amount: 18450.00, percentage: 40 },
  { id: '4', name: 'Frotas Corporativas', amount: 12600.00, percentage: 25 },
];

export const MOCK_CATEGORIES: CategoryDistribution[] = [
  { name: 'Pessoal', value: 12500, color: '#8b5cf6' },
  { name: 'Marketing', value: 4200, color: '#3b82f6' },
  { name: 'Infraestrutura', value: 8500, color: '#f43f5e' },
  { name: 'Software', value: 3100, color: '#10b981' },
  { name: 'Outros', value: 2400, color: '#f59e0b' },
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', date: '2026-05-05', title: 'Pagamento Salários', amount: 12500, type: 'expense' },
  { id: '2', date: '2026-05-10', title: 'Recebimento Localiza', amount: 8400, type: 'income' },
  { id: '3', date: '2026-05-15', title: 'Vencimento Simples Nac.', amount: 3200, type: 'expense' },
];
