import { DiagnosticResult, InsightCategory, InsightStatus, ImpactLevel, EffortLevel } from '../types/diagnostics.types';

export function standardizeInsight(insight: any): DiagnosticResult {
  // Mapeamento de categoria baseado no tipo original
  let category: InsightCategory = 'geral';
  if (insight.type === 'expense') category = 'despesas';
  if (insight.type === 'growth' || insight.type === 'health') category = 'receitas';
  if (insight.type === 'client') category = 'receitas';
  if (insight.type === 'service') category = 'receitas';
  if (insight.type === 'risk') category = 'auditoria';
  if (insight.type === 'inconsistency') category = 'duplicidades';
  if (insight.type === 'trend') category = 'tendencias';
  if (insight.type === 'opportunity') category = 'geral';

  // Mapeamento de Impacto
  let impactLevel: ImpactLevel = 'medio';
  if (insight.severity === 'critical') impactLevel = 'critico';
  else if (insight.severity === 'warning') impactLevel = 'alto';
  else if (insight.severity === 'positive') impactLevel = 'baixo';
  else if (insight.severity === 'info') impactLevel = 'baixo';

  // Esforço estimado (regra baseada no tipo)
  let effortLevel: EffortLevel = 'medio';
  if (insight.type === 'health') effortLevel = 'baixo';
  if (insight.type === 'inconsistency') effortLevel = 'baixo';
  if (insight.type === 'opportunity') effortLevel = 'baixo';
  if (insight.type === 'growth') effortLevel = 'medio';
  if (insight.type === 'expense') effortLevel = 'medio';
  if (insight.type === 'client') effortLevel = 'alto';
  if (insight.type === 'service') effortLevel = 'alto';
  if (insight.type === 'risk') effortLevel = 'alto';

  return {
    ...insight,
    category: insight.category || category,
    status: insight.status || 'novo',
    impactLevel: insight.impactLevel || impactLevel,
    effortLevel: insight.effortLevel || effortLevel,
    detectedAt: insight.detectedAt || new Date().toISOString(),
    period: insight.period || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase()),
    impactValue: insight.impactValue || 0,
  };
}

export function standardizeInsights(insights: any[]): DiagnosticResult[] {
  return insights.map(standardizeInsight);
}
