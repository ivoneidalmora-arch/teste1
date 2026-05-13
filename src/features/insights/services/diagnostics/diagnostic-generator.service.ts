import { supabase } from '@/lib/supabase/client';
import { PeriodFilter } from '../../types/insights.types';
import { DiagnosticResult } from '../../types/diagnostics.types';

import { healthDiagnosticService } from './health.service';
import { growthDiagnosticService } from './growth.service';
import { expenseDiagnosticService } from './expense.service';
import { clientDiagnosticService } from './client.service';
import { serviceDiagnosticService } from './service.service';
import { riskDiagnosticService } from './risk.service';
import { inconsistencyService } from './inconsistency.service';
import { localAiService } from '../local-ai.service';
import { TransactionMapper } from '@/features/finance/mappers/transaction.mapper';

export const diagnosticGeneratorService = {
  async generateDiagnostics(userId: string, period: PeriodFilter): Promise<{
    diagnostics: DiagnosticResult[],
    inconsistencies: any[],
    summary: {
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
      inconsistenciesCount: number;
      riskLevel: string;
      riskSeverity: 'baixo' | 'medio' | 'alto' | 'critico';
    }
  }> {
    
    try {
      // 1. Buscar todas as receitas e despesas relevantes
      let queryRec = supabase.from('Receitas').select('*').eq('app_user_id', userId).is('deleted_at', null);
      let queryDes = supabase.from('Despesas').select('*').eq('app_user_id', userId).is('deleted_at', null);

      if (period.type === 'month') {
        const targetDate = new Date(period.year, period.month - 1, 1);
        const startObj = new Date(targetDate.getFullYear(), targetDate.getMonth() - 2, 1);
        const threeMonthsAgo = startObj.toISOString().split('T')[0];
        
        queryRec = queryRec.gte('date', threeMonthsAgo).lte('date', period.endDate);
        queryDes = queryDes.gte('date', threeMonthsAgo).lte('date', period.endDate);
      }

      const [resRec, resDes] = await Promise.all([queryRec, queryDes]);

      if (resRec.error) throw new Error(`Erro ao buscar receitas: ${resRec.error.message}`);
      if (resDes.error) throw new Error(`Erro ao buscar despesas: ${resDes.error.message}`);

      const rawRevenues = resRec.data || [];
      const rawExpenses = resDes.data || [];

      // Buscar reviews e inconsistências (Dynamic Import para evitar dependência de servidor direta)
      const { getDuplicateReviewsAction } = await import('../../actions/duplicate.actions');
      const { getAuditIssuesAction } = await import('../../actions/audit.actions');
      
      const [existingReviews, auditIssues] = await Promise.all([
        getDuplicateReviewsAction(userId).catch(() => []),
        getAuditIssuesAction(userId).catch(() => [])
      ]);

      const revenues = rawRevenues.map(r => TransactionMapper.toIncome(r));
      const expenses = rawExpenses.map(e => TransactionMapper.toExpense(e));

      const context = {
        rawRevenues: revenues,
        rawExpenses: expenses,
        existingReviews,
        auditIssues,
        period,
        userId
      };

      // 2. Executar serviços de diagnóstico
      const health = healthDiagnosticService.analyze(context);
      const growth = growthDiagnosticService.analyze(context);
      const expense = expenseDiagnosticService.analyze(context);
      const client = clientDiagnosticService.analyze(context);
      const service = serviceDiagnosticService.analyze(context);
      
      // Inteligência Local para Risco
      const localRisk = localAiService.generateRiskAnalysis({ health, growth, expense, client, service });
      
      const risk = riskDiagnosticService.analyze({ health, growth, expense, client, service, context });
      
      // Sobrescrever com inteligência local se necessário ou complementar
      if (!risk.text || risk.text.includes('indisponível')) {
        risk.title = localRisk.title;
        risk.text = localRisk.factor;
        risk.recommendation = localRisk.recommendation;
        risk.severity = localRisk.severity === 'baixo' ? 'positive' : (localRisk.severity === 'medio' ? 'warning' : 'critical');
      }

      const inconsistencyData = inconsistencyService.analyze(context);
      const diagnostics = [health, growth, expense, client, service, risk, inconsistencyData.diagnostic];

      // Calcular Resumo para os Cards
      const currentRevenues = period.type === 'month' 
        ? revenues.filter(r => r.date >= period.startDate! && r.date <= period.endDate!)
        : revenues;
      const currentExpenses = period.type === 'month'
        ? expenses.filter(e => e.date >= period.startDate! && e.date <= period.endDate!)
        : expenses;

      const totalIncome = currentRevenues.reduce((acc, r) => acc + (Number(r.netAmount) || 0), 0);
      const totalExpense = currentExpenses.filter(e => e.status === 'paid').reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      return {
        diagnostics,
        inconsistencies: inconsistencyData.records,
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          inconsistenciesCount: inconsistencyData.records.length,
          riskLevel: localRisk.title,
          riskSeverity: localRisk.severity
        }
      };
    } catch (error: any) {
      console.error("[diagnosticGeneratorService] Erro fatal:", error);
      throw error;
    }
  }
};
