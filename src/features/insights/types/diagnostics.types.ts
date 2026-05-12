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
}

// Interfaces específicas para inconsistências
export type InconsistencyType = 
  | 'duplicate' 
  | 'no_client' 
  | 'no_service' 
  | 'no_category' 
  | 'invalid_value';

export interface InconsistencyRecord {
  id: string;
  type: InconsistencyType;
  transactionId: string;
  transactionType: 'income' | 'expense';
  date: string;
  description: string;
  value: number;
  details: string; // Ex: "Mesma placa ABC-1234 em intervalo de 5 dias", ou "Receita sem cliente"
  groupId?: string; // Para agrupar duplicidades
  groupRecords?: any[]; // Array de records originais caso seja duplicidade
}
