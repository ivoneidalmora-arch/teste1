import { ImportedTransaction, ValidationStatus, ImportSummary, ImportValidationError } from '../types/import.types';
import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Validates a single transaction.
 */
export function validateImportedTransaction(
  item: Partial<ImportedTransaction>
): ImportedTransaction {
  const errors: ImportValidationError[] = [];
  const warnings: string[] = item.warnings || [];
  let status: ValidationStatus = item.status || "pending";

  const preserveStatus = ["manual_approved", "ignorado", "deleted"].includes(status);

  // Field: Date
  if (!item.date) {
    errors.push('DATA_INVALIDA');
  } else {
    const d = parseISO(item.date);
    if (!isValid(d)) {
      errors.push('DATA_INVALIDA');
    }
  }

  // Field: Gross Value
  // We consider "0" as a valid zero (not missing). null/undefined is missing.
  if (item.grossValue === undefined || item.grossValue === null) {
    errors.push('VALOR_BRUTO_AUSENTE');
  } else if (typeof item.grossValue !== 'number' || isNaN(item.grossValue)) {
    errors.push('VALOR_BRUTO_INVALIDO');
  } else if (item.grossValue < 0) {
    errors.push('VALOR_BRUTO_INVALIDO');
  }

  // Field: Net Value
  if (item.netValue !== undefined && item.netValue !== null) {
    if (typeof item.netValue !== 'number' || isNaN(item.netValue) || item.netValue < 0) {
      errors.push('VALOR_LIQUIDO_INVALIDO');
    }
  }

  // Field: Plate
  if (!item.placa || item.placa.trim() === '') {
    errors.push('PLACA_AUSENTE');
  } else if (item.placa.replace(/[^A-Z0-9]/gi, '').length < 7) {
    errors.push('PLACA_INVALIDA');
  }

  // Field: Client
  if (!item.cliente || item.cliente.trim() === '') {
    errors.push('CLIENTE_AUSENTE');
  }

  // Field: Service
  if (!item.service || item.service.trim() === '') {
    errors.push('SERVICO_AUSENTE');
  }

  // Determine final status if not preserving
  if (!preserveStatus) {
    if (errors.length > 0) {
      status = "erro";
    } else {
      status = item.status === "corrigido" ? "corrigido" : "valido";
    }
  }

  // Build legacy validation messages for backward compatibility
  const messages: string[] = [];
  if (status === "valido") messages.push("Lançamento válido para importação");
  else if (status === "corrigido") messages.push("Lançamento corrigido e revalidado");
  else if (status === "manual_approved") messages.push("Aprovado manualmente");
  else if (status === "ignorado") messages.push("Ignorado");
  else if (status === "deleted") messages.push("Excluído");
  else if (status === "erro") messages.push("Erro na validação da linha");

  return {
    ...item,
    id: item.id || Math.random().toString(36).substr(2, 9),
    date: item.date || '',
    placa: item.placa || '',
    cliente: item.cliente || '',
    service: item.service || '',
    category: item.category || '',
    grossValue: item.grossValue ?? 0,
    netValue: item.netValue,
    status,
    errors,
    warnings,
    validationMessages: messages,
    description: item.description || '',
    rawDate: item.rawDate,
    rawValorBruto: item.rawValorBruto,
    rawValorLiquido: item.rawValorLiquido,
    rawClient: item.rawClient
  };
}

/**
 * Detects duplicates within a batch based on plate, service, and < 30 days interval.
 */
export function detectDuplicateTransactions(
  transactions: ImportedTransaction[]
): ImportedTransaction[] {
  const sorted = [...transactions].sort((a, b) => {
    return (parseISO(a.date).getTime() || 0) - (parseISO(b.date).getTime() || 0);
  });

  const processed = sorted.map((t, i) => {
    if (["manual_approved", "ignorado", "deleted"].includes(t.status)) return t;

    const isDuplicate = sorted.some((other, j) => {
      if (i === j) return false;
      if (
        t.placa && other.placa && 
        t.placa.trim().toUpperCase() === other.placa.trim().toUpperCase() &&
        t.service && other.service &&
        t.service.trim().toUpperCase() === other.service.trim().toUpperCase()
      ) {
        const d1 = parseISO(t.date);
        const d2 = parseISO(other.date);
        if (isValid(d1) && isValid(d2)) {
          const diff = Math.abs(differenceInDays(d1, d2));
          if (diff < 30) {
            return true;
          }
        } else if (!isValid(d1) && !isValid(d2)) {
          return true;
        }
      }
      return false;
    });

    if (isDuplicate) {
      if (!t.errors.includes('DUPLICADO')) {
        t.errors.push('DUPLICADO');
      }
      return {
        ...t,
        status: "duplicado" as ValidationStatus,
        validationMessages: ["Possível duplicidade detectada"]
      };
    }

    return t;
  });

  return processed;
}

/**
 * Calculates the summary metrics for the import batch.
 */
export function calculateImportSummary(
  transactions: ImportedTransaction[]
): ImportSummary {
  const activeItems = transactions.filter(t => t.status !== "deleted");

  let readyToSave = 0;
  let invalidItems = 0;
  let duplicateItems = 0;
  let ignoredItems = 0;
  let grossTotal = 0;
  let netTotal = 0;

  activeItems.forEach(t => {
    if (t.status === "valido" || t.status === "corrigido" || t.status === "manual_approved") {
      readyToSave++;
      grossTotal += t.grossValue || 0;
      netTotal += t.netValue || 0;
    } else if (t.status === "erro" || t.status === "invalid" as any) {
      invalidItems++;
    } else if (t.status === "duplicado" || t.status === "duplicate" as any) {
      duplicateItems++;
    } else if (t.status === "ignorado" || t.status === "ignored" as any) {
      ignoredItems++;
    }
  });

  return {
    totalItems: activeItems.length,
    readyToSave,
    invalidItems,
    duplicateItems,
    ignoredItems,
    grossTotal,
    netTotal
  };
}
