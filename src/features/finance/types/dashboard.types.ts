import { LucideIcon } from 'lucide-react';

export type MetricTrend = "up" | "down" | "neutral";

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  change: number;
  trend: MetricTrend;
  icon: LucideIcon;
  color: "green" | "blue" | "red" | "orange" | "purple" | "slate";
  sparkline?: number[];
}

export type TransactionStatus = "paid" | "pending" | "overdue" | "cancelled";
export type TransactionType = "income" | "expense";

export interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  customer: string;
  category: string;
  amount: number;
  status: TransactionStatus;
  origin: "manual" | "import" | "ocr" | "supabase";
  type: TransactionType;
}

export interface CashFlowData {
  name: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface FinancialAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
}

export interface TopClient {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  avatar?: string;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}
