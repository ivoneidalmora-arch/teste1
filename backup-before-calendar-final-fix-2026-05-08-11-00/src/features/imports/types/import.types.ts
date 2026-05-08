export type ImportStatus = 'pending' | 'processing' | 'validated' | 'error' | 'completed';

export interface ImportItem {
  id: string;
  data: string;
  placa: string;
  cliente: string;
  categoria: string;
  valorBruto: number;
  valorLiquido: number;
  status: 'valid' | 'duplicate' | 'error';
  error_message?: string;
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
