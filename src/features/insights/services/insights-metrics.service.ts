import { supabase } from '@/lib/supabase/client';
import { FinancialMetrics, PeriodFilter } from '../types/insights.types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const insightsMetricsService = {
  async calculateMetrics(userId: string, period: PeriodFilter): Promise<FinancialMetrics> {
    const isGlobal = period.type === 'global';
    
    // 1. Fetch current period data
    let queryRec = supabase.from('Receitas').select('*').eq('app_user_id', userId);
    let queryDes = supabase.from('Despesas').select('*').eq('app_user_id', userId);

    if (period.type === 'month') {
      queryRec = queryRec.gte('date', period.startDate).lte('date', period.endDate);
      queryDes = queryDes.gte('date', period.startDate).lte('date', period.endDate);
    }

    const [resRec, resDes] = await Promise.all([queryRec, queryDes]);

    if (resRec.error) throw new Error(`Erro ao buscar receitas: ${resRec.error.message}`);
    if (resDes.error) throw new Error(`Erro ao buscar despesas: ${resDes.error.message}`);

    // 2. Fetch previous period data for trends (only if monthly)
    let prevRevenueLiquido = 0;
    let prevExpense = 0;

    if (period.type === 'month') {
      const targetDate = new Date(period.year, period.month - 1, 1);
      const prevMonthDate = subMonths(targetDate, 1);
      const startPrev = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd');
      const endPrev = format(endOfMonth(prevMonthDate), 'yyyy-MM-dd');

      const [resRecPrev, resDesPrev] = await Promise.all([
        supabase.from('Receitas').select('*').eq('app_user_id', userId).gte('date', startPrev).lte('date', endPrev),
        supabase.from('Despesas').select('*').eq('app_user_id', userId).gte('date', startPrev).lte('date', endPrev),
      ]);

      prevRevenueLiquido = (resRecPrev.data || []).reduce((acc, curr) => acc + (Number(curr.amountLiquido) || Number(curr.amount) || 0), 0);
      prevExpense = (resDesPrev.data || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    }

    // Current totals
    const currentRevenueBruto = (resRec.data || []).reduce((acc, curr) => acc + (Number(curr.amountBruto) || Number(curr.amount) || 0), 0);
    const currentRevenueLiquido = (resRec.data || []).reduce((acc, curr) => acc + (Number(curr.amountLiquido) || Number(curr.amount) || 0), 0);
    const currentExpense = (resDes.data || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    // Calculate top customer
    const customers: Record<string, { value: number, count: number }> = {};
    (resRec.data || []).forEach(r => {
      const name = r.cliente || 'Desconhecido';
      if (!customers[name]) customers[name] = { value: 0, count: 0 };
      customers[name].value += (Number(r.amountLiquido) || Number(r.amount) || 0);
      customers[name].count += 1;
    });
    
    const topCustomerEntries = Object.entries(customers).sort((a, b) => b[1].value - a[1].value);
    const topCustomerName = topCustomerEntries[0]?.[0] || 'Nenhum';
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

    // Fetch existing reviews via Server Action (ignora RLS)
    const { getDuplicateReviewsAction } = await import('../actions/duplicate.actions');
    const existingReviews = await getDuplicateReviewsAction(userId);
    
    const reviewsMap: Record<string, any> = {};
    (existingReviews || []).forEach(r => {
      reviewsMap[r.duplicate_group_key] = r;
    });

    // Detect duplicates (Plate + Service + 30-day window)
    const rawGroups: Record<string, any[]> = {};
    (resRec.data || []).forEach(r => {
      if (r.placa) {
        const key = `${r.placa}-${r.servico || ''}`;
        if (!rawGroups[key]) rawGroups[key] = [];
        rawGroups[key].push(r);
      }
    });
    
    const duplicateGroups: any[] = [];
    const duplicatePlates: string[] = [];

    Object.entries(rawGroups).forEach(([key, items]) => {
      if (items.length > 1) {
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        for (let i = 0; i < items.length - 1; i++) {
          const d1 = new Date(items[i].date);
          const d2 = new Date(items[i+1].date);
          const diffDays = Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
          
          if (diffDays <= 30) {
            const records = items.map(it => ({
              id: it.id,
              date: it.date,
              cliente: it.cliente,
              placa: it.placa,
              servico: it.servico,
              amountBruto: it.amountBruto,
              amountLiquido: it.amountLiquido,
              amount: it.amount
            }));

            const ids = records.map(r => r.id).sort();
            const groupKey = `${items[0].placa}-${items[0].servico}-${ids.join('-')}`;
            const existingReview = reviewsMap[groupKey];
            const status = existingReview?.status || 'pending_review';

            // Calculate Confidence
            let confidence: 'high' | 'medium' | 'low' = 'low';
            const r1 = records[0];
            const r2 = records[1];
            
            const sameValue = r1.amountBruto === r2.amountBruto;
            const sameCustomer = r1.cliente === r2.cliente;
            const sameService = r1.servico === r2.servico;

            if (sameValue && sameCustomer && sameService) confidence = 'high';
            else if (sameService) confidence = 'medium';
            else confidence = 'low';

            duplicateGroups.push({
              groupKey,
              placa: items[0].placa,
              servico: items[0].servico,
              cliente: items[0].cliente,
              records,
              confidence,
              status,
              daysBetween: Math.round(diffDays)
            });

            const placa = key.split('-')[0];
            // No card principal, apenas as pendentes contam
            if (status === 'pending_review' && !duplicatePlates.includes(placa)) {
              duplicatePlates.push(placa);
            }
            break;
          }
        }
      }
    });

    // Final calculations
    const netProfit = currentRevenueLiquido - currentExpense;
    const expensePercentage = currentRevenueBruto > 0 ? (currentExpense / currentRevenueBruto) * 100 : 0;
    
    let expenseStatus: 'Saudável' | 'Atenção' | 'Crítico' = 'Saudável';
    if (expensePercentage >= 70) expenseStatus = 'Crítico';
    else if (expensePercentage >= 40) expenseStatus = 'Atenção';

    // Monthly Variation logic for Global mode: compare last month vs previous month
    let monthlyVariation = 0;
    if (period.type === 'global' && resRec.data && resRec.data.length > 0) {
      // Agrupar por mês e pegar os dois últimos
      const monthsMap: Record<string, number> = {};
      resRec.data.forEach(r => {
        const d = new Date(r.date);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthsMap[k] = (monthsMap[k] || 0) + (Number(r.amountLiquido) || Number(r.amount) || 0);
      });
      const sortedMonths = Object.keys(monthsMap).sort().reverse();
      if (sortedMonths.length >= 2) {
        const lastVal = monthsMap[sortedMonths[0]];
        const prevVal = monthsMap[sortedMonths[1]];
        monthlyVariation = prevVal === 0 ? 0 : ((lastVal - prevVal) / prevVal) * 100;
      }
    } else {
      monthlyVariation = prevRevenueLiquido === 0 ? 0 : ((currentRevenueLiquido - prevRevenueLiquido) / prevRevenueLiquido) * 100;
    }

    return {
      totalRevenueBruto: currentRevenueBruto,
      totalRevenueLiquido: currentRevenueLiquido,
      totalExpense: currentExpense,
      netProfit: netProfit,
      saldoFinal: netProfit,
      expensePercentage,
      expenseStatus,
      topCustomer,
      mostFrequentPlate: Object.keys(rawGroups).sort((a, b) => rawGroups[b].length - rawGroups[a].length)[0] || 'Nenhuma',
      monthlyVariation,
      duplicatePlates,
      duplicateGroups,
      expenseDetails: {
        topCategory: topCategory.category,
        topCategoryValue: topCategory.value,
        highestExpense: highestExp,
        categories
      },
      trends: {
        revenueGrowth: monthlyVariation,
        expenseGrowth: period.type === 'month' ? (prevExpense === 0 ? 0 : ((currentExpense - prevExpense) / prevExpense) * 100) : 0,
      },
      period
    };
  }
};
