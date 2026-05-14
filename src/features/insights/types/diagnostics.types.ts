export type DiagnosticSeverity = 'positive' | 'info' | 'warning' | 'critical';
export type DiagnosticPriority = 'low' | 'medium' | 'high' | 'urgent';

export type InsightCategory = 
  | 'receitas' 
  | 'despesas' 
  | 'fluxo' 
  | 'duplicidades' 
  | 'tendencias' 
  | 'auditoria' 
  | 'geral';

export type InsightStatus = 
  | 'novo' 
  | 'em_analise' 
  | 'aprovado' 
  | 'ignorado' 
  | 'resolvido' 
  | 'corrigido' 
  | 'erro';

export type ImpactLevel = 'baixo' | 'medio' | 'alto' | 'critico';
export type EffortLevel = 'baixo' | 'medio' | 'alto';

export interface DiagnosticResult {
  id: string;
  type: 'health' | 'growth' | 'expense' | 'client' | 'service' | 'risk' | 'inconsistency' | 'trend' | 'opportunity';
  category: InsightCategory;
  title: string;
  classification: string;
  severity: DiagnosticSeverity;
  priority: DiagnosticPriority;
  status: InsightStatus;
  impactLevel: ImpactLevel;
  effortLevel: EffortLevel;
  mainMetric: string;
  secondaryMetric?: string;
  variation?: number; // percentual
  text: string;
  recommendation?: string;
  actionLabel?: string;
  actionId?: string; // identificador para a ação do botão
  hasData: boolean; // para exibir a mensagem "dados insuficientes"
  factors?: string[]; // Lista de fatores detalhados para o diagnóstico de risco
  impactValue?: number; // Valor financeiro estimado do impacto
  period?: string; // Ex: "Maio 2024"
  detectedAt: string; // ISO date
  rawRecord?: any; // Registro original para auditoria/edição
}

export type AuditSeverity = 'critical' | 'alert' | 'info';
export type AuditStatus = 'pending' | 'resolved' | 'approved' | 'ignored' | 'deleted';

export type InconsistencyType = 
  | 'duplicate' 
  | 'no_client' 
  | 'no_service' 
  | 'no_category' 
  | 'invalid_value'
  | 'no_description'
  | 'no_date'
  | 'no_due_date'
  | 'expired_unpaid'
  | 'no_status'
  | 'incomplete_registration'
  | 'invalid_nomenclatura';

export interface InconsistencyRecord {
  id: string; // ID da inconsistência (ex: transactionId-type)
  type: InconsistencyType;
  transactionId: string;
  transactionType: 'income' | 'expense';
  date: string;
  description: string; // Título curto do problema
  value: number;
  details: string; // Descrição longa/técnica
  
  // Novos campos para Auditoria Profissional
  severity: AuditSeverity;
  affectedField?: string;
  currentValue?: string | number;
  expectedRule?: string;
  impact?: string;
  recommendation?: string;
  status: AuditStatus;
  
  groupId?: string; // Para agrupar duplicidades
  groupRecords?: any[]; // Array de records originais caso seja duplicidade
  rawRecord?: any; // Registro original para edição
}

export interface InconsistencyGroup {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  items: InconsistencyRecord[];
}
