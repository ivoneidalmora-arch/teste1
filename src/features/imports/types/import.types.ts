export type ImportStatus = 'pending' | 'processing' | 'validated' | 'error' | 'completed';

export type ValidationStatus = 
  | "pending"
  | "valid"
  | "invalid"
  | "duplicate"
  | "corrected"
  | "manual_approved"
  | "ignored"
  | "deleted";

export interface ImportedTransaction {
  id: string;
  date: string;
  placa: string;
  cliente: string;
  service: string; // The user requested "service", we can map "categoria" to "service" or keep both
  category?: string; // Standardized service/category
  grossValue: number;
  netValue?: number;
  status: ValidationStatus;
  validationMessages: string[];
  approvedManually?: boolean;
  ignored?: boolean;
  deleted?: boolean;
  description?: string; // Adding for completeness since parser uses it
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
