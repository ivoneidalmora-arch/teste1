import { z } from 'zod';

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  placa: z.string().min(7, "Placa deve ter pelo menos 7 caracteres").max(8),
  cliente: z.string().min(1, "Cliente é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  valorBruto: z.number().min(0, "Valor bruto não pode ser negativo"),
  valorLiquido: z.number().min(0, "Valor líquido não pode ser negativo"),
  observacao: z.string().optional().default('IMPORTADO VIA INGESTÃO INTELIGENTE')
});

export const ingestionResultSchema = z.array(transactionSchema);

export type TransactionInput = z.infer<typeof transactionSchema>;
