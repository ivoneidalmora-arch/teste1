import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense']);
export const TransactionStatusSchema = z.enum(['paid', 'pending', 'overdue', 'cancelled']);

// Mapeamento de status amigáveis para o sistema legado (Pago/Pendente)
export const LegacyStatusSchema = z.enum(['Pago', 'Pendente']);

export const TransactionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: TransactionTypeSchema,
  amount: z.number().min(0),
  grossAmount: z.number().optional(),
  netAmount: z.number().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  dueDate: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().optional(),
  customer: z.string().optional(),
  status: TransactionStatusSchema,
  source: z.enum(['manual', 'import', 'ocr', 'supabase']).default('manual'),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Schema para criação de novas transações (omite ID e campos automáticos)
export const NewTransactionSchema = TransactionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type NewTransaction = z.infer<typeof NewTransactionSchema>;

// Schema para Ingestão Inteligente (Excel/PDF)
export const IngestionResultSchema = z.object({
  data: z.string(),
  placa: z.string().optional(),
  cliente: z.string(),
  categoria: z.string(),
  valorBruto: z.number(),
  valorLiquido: z.number(),
  observacao: z.string().optional(),
});

export type IngestionResult = z.infer<typeof IngestionResultSchema>;
