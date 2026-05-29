export type ImportStatus = 'pending' | 'processing' | 'validated' | 'error' | 'completed';

export type ValidationStatus = 
  | "pending"
  | "valido"
  | "erro"
  | "duplicado"
  | "corrigido"
  | "aprovado"
  | "ignorado"
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
