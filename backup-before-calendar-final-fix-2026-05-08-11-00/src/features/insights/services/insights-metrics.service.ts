import { supabase } from '@/services/supabase';
import { FinancialMetrics } from '../types/insights.types';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const insightsMetricsService = {
  async calculateMetrics(userId: string): Promise<FinancialMetrics> {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const startPrev = startOfMonth(subMonths(now, 1));
    const endPrev = endOfMonth(subMonths(now, 1));

    // 1. Fetch current month data
    const [resRec, resDes] = await Promise.all([
      supabase.from('Receitas').select('*').eq('app_user_id', userId).gte('data', start.toISOString()).lte('data', end.toISOString()),
      supabase.from('Despesas').select('*').eq('app_user_id', userId).gte('data', start.toISOString()).lte('data', end.toISOString()),
    ]);

    // 2. Fetch previous month data for trends
    const [resRecPrev, resDesPrev] = await Promise.all([
      supabase.from('Receitas').select('*').eq('app_user_id', userId).gte('data', startPrev.toISOString()).lte('data', endPrev.toISOString()),
      supabase.from('Despesas').select('*').eq('app_user_id', userId).gte('data', startPrev.toISOString()).lte('data', endPrev.toISOString()),
    ]);

    const currentRevenue = (resRec.data || []).reduce((acc, curr) => acc + (curr.valor_liquido || curr.valor_bruto || 0), 0);
    const currentExpense = (resDes.data || []).reduce((acc, curr) => acc + (curr.valor || 0), 0);
    
    const prevRevenue = (resRecPrev.data || []).reduce((acc, curr) => acc + (curr.valor_liquido || curr.valor_bruto || 0), 0);
    const prevExpense = (resDesPrev.data || []).reduce((acc, curr) => acc + (curr.valor || 0), 0);

    // Calculate top customer
    const customers: Record<string, number> = {};
    (resRec.data || []).forEach(r => {
      const name = r.cliente || 'Desconhecido';
      customers[name] = (customers[name] || 0) + (r.valor_liquido || r.valor_bruto || 0);
    });
    
    const topCustomerName = Object.keys(customers).sort((a, b) => customers[b] - customers[a])[0] || 'Nenhum';
    const topCustomerValue = customers[topCustomerName] || 0;

    // Detect duplicates (Placas)
    const plates: Record<string, number> = {};
    (resRec.data || []).forEach(r => {
      if (r.placa) plates[r.placa] = (plates[r.placa] || 0) + 1;
    });
    const duplicatePlates = Object.keys(plates).filter(p => plates[p] > 1);

    return {
      totalRevenue: currentRevenue,
      totalExpense: currentExpense,
      netProfit: currentRevenue - currentExpense,
      topCustomer: { name: topCustomerName, value: topCustomerValue },
      mostFrequentPlate: Object.keys(plates).sort((a, b) => plates[b] - plates[a])[0] || 'Nenhuma',
      monthlyVariation: prevRevenue === 0 ? 0 : ((currentRevenue - prevRevenue) / prevRevenue) * 100,
      duplicatePlates,
      trends: {
        revenueGrowth: prevRevenue === 0 ? 0 : ((currentRevenue - prevRevenue) / prevRevenue) * 100,
        expenseGrowth: prevExpense === 0 ? 0 : ((currentExpense - prevExpense) / prevExpense) * 100,
      }
    };
  }
};
