import { supabase } from '@/lib/supabase/client';
import { PeriodFilter } from '../../types/insights.types';
import { DiagnosticResult } from '../../types/diagnostics.types';

import { healthDiagnosticService } from './health.service';
import { growthDiagnosticService } from './growth.service';
import { expenseDiagnosticService } from './expense.service';
import { clientDiagnosticService } from './client.service';
import { serviceDiagnosticService } from './service.service';
import { riskDiagnosticService } from './risk.service';
import { inconsistencyDiagnosticService } from './inconsistency.service';
import { TransactionMapper } from '@/features/finance/mappers/transaction.mapper';

export const diagnosticGeneratorService = {
  async generateDiagnostics(userId: string, period: PeriodFilter): Promise<{
    diagnostics: DiagnosticResult[],
    inconsistencies: any[] // detalhamento para o modal
  }> {
    
    // 1. Buscar todas as receitas e despesas relevantes
    let queryRec = supabase.from('Receitas').select('*').eq('app_user_id', userId);
    let queryDes = supabase.from('Despesas').select('*').eq('app_user_id', userId);

    // Se for um mês específico, precisamos buscar o mês atual e os 2 meses anteriores para análise de crescimento
    const startDate = period.type === 'month' ? period.startDate : undefined;
    const endDate = period.type === 'month' ? period.endDate : undefined;
    let threeMonthsAgo = '';

    if (period.type === 'month') {
      const targetDate = new Date(period.year, period.month - 1, 1);
      const startObj = new Date(targetDate.getFullYear(), targetDate.getMonth() - 2, 1); // 2 meses antes do atual = 3 meses de janela
      threeMonthsAgo = startObj.toISOString().split('T')[0];
      
      queryRec = queryRec.gte('date', threeMonthsAgo).lte('date', period.endDate);
      queryDes = queryDes.gte('date', threeMonthsAgo).lte('date', period.endDate);
    }

    const [resRec, resDes] = await Promise.all([queryRec, queryDes]);

    if (resRec.error) throw new Error(`Erro ao buscar receitas: ${resRec.error.message}`);
    if (resDes.error) throw new Error(`Erro ao buscar despesas: ${resDes.error.message}`);

    const rawRevenues = resRec.data || [];
    const rawExpenses = resDes.data || [];

    // Buscar reviews de duplicidade e inconsistências auditadas
    const { getDuplicateReviewsAction } = await import('../../actions/duplicate.actions');
    const { getAuditIssuesAction } = await import('../../actions/audit.actions');
    
    const [existingReviews, auditIssues] = await Promise.all([
      getDuplicateReviewsAction(userId),
      getAuditIssuesAction(userId)
    ]);

    // Mapear dados para o formato padronizado Transaction
    const revenues = rawRevenues.map(r => TransactionMapper.toIncome(r));
    const expenses = rawExpenses.map(e => TransactionMapper.toExpense(e));

    // Contexto de dados para os serviços
    const context = {
      rawRevenues: revenues,
      rawExpenses: expenses,
      existingReviews,
      auditIssues,
      period,
      userId
    };

    // 2. Executar cada serviço de diagnóstico
    const health = healthDiagnosticService.analyze(context);
    const growth = growthDiagnosticService.analyze(context);
    const expense = expenseDiagnosticService.analyze(context);
    const client = clientDiagnosticService.analyze(context);
    const service = serviceDiagnosticService.analyze(context);
    const risk = riskDiagnosticService.analyze({ health, growth, expense, client, service, context });
    
    const inconsistencyData = inconsistencyDiagnosticService.analyze(context);
    const inconsistencyDiag = inconsistencyData.diagnostic;

    const diagnostics = [health, growth, expense, client, service, risk, inconsistencyDiag];

    return {
      diagnostics,
      inconsistencies: inconsistencyData.records
    };
  }
};
