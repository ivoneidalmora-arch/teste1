export type ImportStatus = 'pending' | 'processing' | 'validated' | 'error' | 'completed';

export type ValidationStatus = 
  | "pending"
  | "valido"
  | "valid"
  | "erro"
  | "invalid"
  | "duplicado"
  | "duplicate"
  | "corrigido"
  | "corrected"
  | "aprovado"
  | "manual_approved"
  | "ignorado"
  | "ignored"
  | "deleted";

export type ImportValidationError =
  | 'DATA_INVALIDA'
  | 'PLACA_AUSENTE'
  | 'PLACA_INVALIDA'
  | 'CLIENTE_AUSENTE'
  | 'SERVICO_AUSENTE'
  | 'VALOR_BRUTO_AUSENTE'
  | 'VALOR_BRUTO_INVALIDO'
  | 'VALOR_LIQUIDO_AUSENTE'
  | 'VALOR_LIQUIDO_INVALIDO'
  | 'DUPLICADO'
  | 'INCONSISTENTE';

export interface ImportAuditLog {
  id: string;
  timestamp: string;
  field: string;
  originalValue: string;
  previousValue: string;
  newValue: string;
  user: string;
  reason?: string;
  previousStatus: string;
  newStatus: string;
}

export interface ImportedTransaction {
  id: string;
  date: string;
  placa: string;
  cliente: string;
  service: string;
  category?: string;
  grossValue: number;
  netValue?: number;
  status: ValidationStatus;
  
  errors: ImportValidationError[];
  warnings: string[];
  
  // Backwards compatibility for generic string arrays from old versions
  validationMessages: string[];
  
  approvedManually?: boolean;
  ignored?: boolean;
  deleted?: boolean;
  description?: string;
  
  // Auditing fields
  rawDate?: string;
  rawValorBruto?: string;
  rawValorLiquido?: string;
  rawClient?: string;

  // Novos campos de controle e metadados
  sourceFileName?: string;
  sourceSheetName?: string;
  sourceRowNumber?: number;
  rawData?: Record<string, any>;
  auditLog?: ImportAuditLog[];
  motivoCorrecao?: string;
  formaPagamento?: string;
}

export interface ImportSummary {
  totalItems: number;
  readyToSave: number;
  invalidItems: number;
  duplicateItems: number;
  ignoredItems: number;
  grossTotal: number;
  netTotal: number;
}

export interface ImportLog {
  id: string;
  app_user_id: string;
  filename: string;
  total_items: number;
  processed_items: number;
  status: ImportStatus;
  created_at: string;
}
