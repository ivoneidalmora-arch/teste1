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

  const preserveStatus = ["manual_approved", "ignored", "ignorado", "deleted"].includes(status);

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
  if (item.grossValue === undefined || item.grossValue === null) {
    errors.push('VALOR_BRUTO_AUSENTE');
  } else if (typeof item.grossValue !== 'number' || isNaN(item.grossValue)) {
    errors.push('VALOR_BRUTO_INVALIDO');
  } else if (item.grossValue <= 0) {
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
      status = "invalid";
    } else {
      status = (item.status === "corrigido" || item.status === "corrected") ? "corrected" : "valid";
    }
  }

  // Build legacy validation messages for backward compatibility
  const messages: string[] = [];
  if (status === "valid" || status === "valido") messages.push("Lançamento válido para importação");
  else if (status === "corrected" || status === "corrigido") messages.push("Lançamento corrigido e revalidado");
  else if (status === "manual_approved" || status === "aprovado") messages.push("Aprovado manualmente");
  else if (status === "ignored" || status === "ignorado") messages.push("Ignorado");
  else if (status === "deleted") messages.push("Excluído");
  else if (status === "invalid" || status === "erro") messages.push("Erro na validação da linha");

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
    rawClient: item.rawClient,
    sourceFileName: item.sourceFileName,
    sourceSheetName: item.sourceSheetName,
    sourceRowNumber: item.sourceRowNumber,
    rawData: item.rawData,
    auditLog: item.auditLog || [],
    formaPagamento: item.formaPagamento || 'Pix'
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
    if (["manual_approved", "ignored", "ignorado", "deleted"].includes(t.status)) return t;

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
        status: "duplicate" as ValidationStatus,
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
    if (t.status === "valid" || t.status === "valido" || t.status === "corrected" || t.status === "corrigido" || t.status === "manual_approved" || t.status === "aprovado") {
      readyToSave++;
      grossTotal += t.grossValue || 0;
      netTotal += t.netValue || 0;
    } else if (t.status === "invalid" || t.status === "erro") {
      invalidItems++;
    } else if (t.status === "duplicate" || t.status === "duplicado") {
      duplicateItems++;
    } else if (t.status === "ignored" || t.status === "ignorado") {
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

export interface CorrectionSuggestion {
  field: string;
  original: string;
  suggested: string;
  confidence: number;
}

export function getImportIssueSuggestions(item: ImportedTransaction): CorrectionSuggestion[] {
  const suggestions: CorrectionSuggestion[] = [];

  // Sugestão de cliente
  if (item.rawClient && item.rawClient.trim() !== "" && item.rawClient.toUpperCase().trim() !== item.cliente.toUpperCase().trim()) {
    suggestions.push({
      field: 'cliente',
      original: item.rawClient,
      suggested: item.cliente,
      confidence: 95
    });
  }

  // Sugestão de placa
  if (item.placa) {
    const rawPlaca = item.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (rawPlaca.length === 7) {
      const formatted = rawPlaca.substring(0, 3) + '-' + rawPlaca.substring(3);
      if (formatted !== item.placa) {
        suggestions.push({
          field: 'placa',
          original: item.placa,
          suggested: formatted,
          confidence: 90
        });
      }
    }
  }

  // Sugestão de serviço
  if (item.rawData) {
    const rawServ = String(item.rawData.servico || item.rawData.Serviço || item.rawData.categoria || '');
    if (rawServ && rawServ.trim() !== "" && rawServ !== item.service) {
      suggestions.push({
        field: 'service',
        original: rawServ,
        suggested: item.service,
        confidence: 85
      });
    }
  }

  return suggestions;
}
