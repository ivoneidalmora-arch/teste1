import { z } from 'zod';

export const ImportItemSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  placa: z.string().min(7, "Placa deve ter no mínimo 7 caracteres").max(8).toUpperCase(),
  cliente: z.string().min(2, "Cliente é obrigatório"),
  categoria: z.string().min(2, "Serviço é obrigatório"),
  valorBruto: z.number().min(0, "Valor bruto não pode ser negativo"),
  valorLiquido: z.number().min(0, "Valor líquido não pode ser negativo"),
});

export type ValidatedImportItem = z.infer<typeof ImportItemSchema>;

export const ImportBatchSchema = z.array(ImportItemSchema);
