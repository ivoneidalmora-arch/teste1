export type DiagnosticSeverity = 'positive' | 'info' | 'warning' | 'critical';
export type DiagnosticPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DiagnosticResult {
  id: string;
  type: 'health' | 'growth' | 'expense' | 'client' | 'service' | 'risk' | 'inconsistency';
  title: string;
  classification: string;
  severity: DiagnosticSeverity;
  priority: DiagnosticPriority;
  mainMetric: string;
  secondaryMetric?: string;
  variation?: number; // percentual
  text: string;
  recommendation?: string;
  actionLabel?: string;
  actionId?: string; // identificador para a ação do botão
  hasData: boolean; // para exibir a mensagem "dados insuficientes"
  factors?: string[]; // Lista de fatores detalhados para o diagnóstico de risco
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
