import { supabase } from '@/lib/supabase/client';
import { FinancialMetrics } from '../types/insights.types';
import { startOfMonth, endOfMonth, subMonths, setMonth, setYear } from 'date-fns';

export const insightsMetricsService = {
  async calculateMetrics(userId: string, month: number, year: number): Promise<FinancialMetrics> {
    const targetDate = setYear(setMonth(new Date(), month - 1), year);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);
    
    const prevMonthDate = subMonths(targetDate, 1);
    const startPrev = startOfMonth(prevMonthDate);
    const endPrev = endOfMonth(prevMonthDate);

    // 1. Fetch current period data
    const [resRec, resDes] = await Promise.all([
      supabase.from('Receitas').select('*').eq('app_user_id', userId).gte('date', start.toISOString()).lte('date', end.toISOString()),
      supabase.from('Despesas').select('*').eq('app_user_id', userId).gte('date', start.toISOString()).lte('date', end.toISOString()),
    ]);

    if (resRec.error) throw new Error(`Erro ao buscar receitas: ${resRec.error.message}`);
    if (resDes.error) throw new Error(`Erro ao buscar despesas: ${resDes.error.message}`);

    // 2. Fetch previous period data for trends
    const [resRecPrev, resDesPrev] = await Promise.all([
      supabase.from('Receitas').select('*').eq('app_user_id', userId).gte('date', startPrev.toISOString()).lte('date', endPrev.toISOString()),
      supabase.from('Despesas').select('*').eq('app_user_id', userId).gte('date', startPrev.toISOString()).lte('date', endPrev.toISOString()),
    ]);

    // Current totals
    const currentRevenueBruto = (resRec.data || []).reduce((acc, curr) => acc + (Number(curr.amountBruto) || Number(curr.amount) || 0), 0);
    const currentRevenueLiquido = (resRec.data || []).reduce((acc, curr) => acc + (Number(curr.amountLiquido) || Number(curr.amount) || 0), 0);
    const currentExpense = (resDes.data || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    // Previous totals
    const prevRevenueLiquido = (resRecPrev.data || []).reduce((acc, curr) => acc + (Number(curr.amountLiquido) || Number(curr.amount) || 0), 0);
    const prevExpense = (resDesPrev.data || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Calculate top customer
    const customers: Record<string, { value: number, count: number }> = {};
    (resRec.data || []).forEach(r => {
      const name = r.cliente || 'Desconhecido';
      if (!customers[name]) customers[name] = { value: 0, count: 0 };
      customers[name].value += (Number(r.amountLiquido) || Number(r.amount) || 0);
      customers[name].count += 1;
    });
    
    const topCustomerName = Object.keys(customers).sort((a, b) => customers[b].value - customers[a].value)[0] || 'Nenhum';
    const topCustomer = { 
      name: topCustomerName, 
      value: customers[topCustomerName]?.value || 0,
      count: customers[topCustomerName]?.count || 0
    };

    // Expense details & categories
    const categoriesMap: Record<string, number> = {};
    let highestExp = { description: 'Nenhuma', value: 0 };

    (resDes.data || []).forEach(d => {
      const cat = d.category || 'Outros';
      const val = Number(d.amount) || 0;
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
      if (val > highestExp.value) {
        highestExp = { description: d.description || cat, value: val };
      }
    });

    const categories = Object.entries(categoriesMap).map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
    const topCategory = categories[0] || { category: 'Nenhuma', value: 0 };

    // Detect duplicates (Plate + Service + Month rule)
    const duplicatesMap: Record<string, any[]> = {};
    (resRec.data || []).forEach(r => {
      if (r.placa) {
        const key = `${r.placa}-${r.servico || ''}`;
        if (!duplicatesMap[key]) duplicatesMap[key] = [];
        duplicatesMap[key].push(r);
      }
    });
    const duplicatePlates = Object.keys(duplicatesMap).filter(k => duplicatesMap[k].length > 1);

    // Final calculations
    const netProfit = currentRevenueLiquido - currentExpense;
    const expensePercentage = currentRevenueBruto > 0 ? (currentExpense / currentRevenueBruto) * 100 : 0;
    
    let expenseStatus: 'Saudável' | 'Atenção' | 'Crítico' = 'Saudável';
    if (expensePercentage >= 70) expenseStatus = 'Crítico';
    else if (expensePercentage >= 40) expenseStatus = 'Atenção';

    return {
      totalRevenueBruto: currentRevenueBruto,
      totalRevenueLiquido: currentRevenueLiquido,
      totalExpense: currentExpense,
      netProfit: netProfit,
      saldoFinal: netProfit,
      expensePercentage,
      expenseStatus,
      topCustomer,
      mostFrequentPlate: Object.keys(duplicatesMap).sort((a, b) => duplicatesMap[b].length - duplicatesMap[a].length)[0] || 'Nenhuma',
      monthlyVariation: prevRevenueLiquido === 0 ? 0 : ((currentRevenueLiquido - prevRevenueLiquido) / prevRevenueLiquido) * 100,
      duplicatePlates,
      expenseDetails: {
        topCategory: topCategory.category,
        topCategoryValue: topCategory.value,
        highestExpense: highestExp,
        categories
      },
      trends: {
        revenueGrowth: prevRevenueLiquido === 0 ? 0 : ((currentRevenueLiquido - prevRevenueLiquido) / prevRevenueLiquido) * 100,
        expenseGrowth: prevExpense === 0 ? 0 : ((currentExpense - prevExpense) / prevExpense) * 100,
      },
      period: { month, year }
    };
  }
};
