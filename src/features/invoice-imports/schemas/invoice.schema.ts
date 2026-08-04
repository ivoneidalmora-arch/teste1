import { z } from 'zod';
import { parse } from 'date-fns';

export const invoiceImportSchema = z.object({
  id: z.string(),
  date: z.string().min(10, 'Data inválida'),
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  placa: z.string().min(1, 'Placa é obrigatória')
    .refine(val => {
      if (val === 'PLACA NÃO IDENTIFICADA') return true; // validaremos como manual review required
      return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(val);
    }, 'Placa em formato inválido'),
  statusNota: z.string().min(1, 'Situação da nota é obrigatória'),
  grossValue: z.number().min(0.01, 'Valor deve ser maior que zero'),
  status: z.enum(['pending', 'valid', 'invalid', 'corrected', 'manual_approved', 'duplicate', 'error', 'ignored']),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  description: z.string(),
  sourceRowNumber: z.number()
});

export type InvoiceImportData = z.infer<typeof invoiceImportSchema>;

export const validateInvoiceData = (data: Partial<InvoiceImportData>): { isValid: boolean; errors: string[] } => {
  const result = invoiceImportSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map(e => e.message)
    };
  }
  
  if (data.placa === 'PLACA NÃO IDENTIFICADA') {
    return {
      isValid: false,
      errors: ['Placa não encontrada. Preencha manualmente.']
    };
  }

  return { isValid: true, errors: [] };
};
