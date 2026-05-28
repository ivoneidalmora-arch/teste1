import { ImportedTransaction, ValidationStatus, ImportSummary } from '../types/import.types';
import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Validates a single transaction.
 */
export function validateImportedTransaction(
  item: Partial<ImportedTransaction>
): ImportedTransaction {
  const messages: string[] = [];
  let status: ValidationStatus = item.status || "pending" as any;

  // We should not override manual_approved, ignored, or deleted if we're just re-validating
  const preserveStatus = ["manual_approved", "ignored", "deleted"].includes(status);

  // Field: Date
  if (!item.date) {
    messages.push("Data vazia");
  } else {
    // Basic date regex or parsing check
    const d = parseISO(item.date);
    if (!isValid(d)) {
      messages.push("Data inválida");
    }
  }

  // Field: Gross Value
  if (item.grossValue === undefined || item.grossValue === null) {
    messages.push("Valor bruto vazio");
  } else if (typeof item.grossValue !== 'number' || isNaN(item.grossValue)) {
    messages.push("Valor bruto inválido");
  } else if (item.grossValue === 0) {
    messages.push("Valor bruto zerado");
  } else if (item.grossValue < 0) {
    messages.push("Valores negativos indevidos");
  }

  // Field: Net Value (optional, but if exists must be valid)
  if (item.netValue !== undefined && item.netValue !== null) {
    if (typeof item.netValue !== 'number' || isNaN(item.netValue) || item.netValue < 0) {
      messages.push("Valor líquido inválido");
    }
  }

  // Field: Plate
  if (!item.placa || item.placa.trim() === '') {
    messages.push("Placa vazia");
  } else if (item.placa.replace(/[^A-Z0-9]/gi, '').length < 7) {
    messages.push("Placa com formato incorreto");
  }

  // Field: Client
  if (!item.cliente || item.cliente.trim() === '') {
    messages.push("Cliente vazio");
  }

  // Field: Service
  if (!item.service || item.service.trim() === '') {
    messages.push("Serviço vazio");
  } else if (item.service.trim().toLowerCase() === 'transferência' || item.service.trim().toLowerCase() === 'desconhecido') {
    // Assuming 'Transferência' as unrecognized service or missing category just as an example rule if needed
    // messages.push("Serviço não reconhecido");
  }

  if (!item.category || item.category.trim() === '') {
    messages.push("Categoria ausente");
  }

  // Determine final status if not preserving
  if (!preserveStatus) {
    if (messages.length > 0) {
      status = "invalid";
    } else {
      // If it was corrected previously, we can keep it as corrected or turn it to valid
      status = item.status === "corrected" ? "corrected" : "valid";
    }
  }

  // If valid, clear some messages, otherwise append the summary
  if (status === "valid") {
    messages.push("Lançamento válido para importação");
  } else if (status === "corrected") {
    messages.push("Lançamento corrigido e revalidado");
  } else if (status === "manual_approved") {
    messages.push("Aprovado manualmente pelo usuário");
  } else if (status === "ignored") {
    messages.push("Ignorado pelo usuário");
  } else if (status === "deleted") {
    messages.push("Excluído pelo usuário");
  } else if (status === "invalid" && messages.length === 0) {
    // Fallback if marked invalid but no messages
    messages.push("Inconsistente");
  }

  return {
    ...item,
    id: item.id || Math.random().toString(36).substr(2, 9),
    date: item.date || '',
    placa: item.placa || '',
    cliente: item.cliente || '',
    service: item.service || '',
    category: item.category || '',
    grossValue: item.grossValue || 0,
    netValue: item.netValue,
    status,
    validationMessages: messages,
    description: item.description || ''
  };
}

/**
 * Detects duplicates within a batch based on plate, service, and < 30 days interval.
 */
export function detectDuplicateTransactions(
  transactions: ImportedTransaction[]
): ImportedTransaction[] {
  // Sort by date to make interval checks easier
  const sorted = [...transactions].sort((a, b) => {
    return (parseISO(a.date).getTime() || 0) - (parseISO(b.date).getTime() || 0);
  });

  const processed = sorted.map((t, i) => {
    // Don't flag if it's already manually approved, ignored or deleted
    if (["manual_approved", "ignored", "deleted"].includes(t.status)) return t;

    // Check against others in the batch
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
          // If both dates are invalid, consider duplicate if other fields match perfectly
          return true;
        }
      }
      return false;
    });

    if (isDuplicate) {
      // Remove other duplicate messages to avoid stacking
      const filteredMessages = t.validationMessages.filter(m => !m.includes("Possível duplicidade"));
      return {
        ...t,
        status: "duplicate" as ValidationStatus,
        validationMessages: [
          ...filteredMessages,
          "Possível duplicidade: mesma placa e serviço em intervalo menor que 30 dias."
        ]
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
  // Don't count "deleted" items in total? Or count them? Usually deleted are completely removed.
  const activeItems = transactions.filter(t => t.status !== "deleted");

  let readyToSave = 0;
  let invalidItems = 0;
  let duplicateItems = 0;
  let ignoredItems = 0;
  let grossTotal = 0;
  let netTotal = 0;

  activeItems.forEach(t => {
    if (t.status === "valid" || t.status === "corrected" || t.status === "manual_approved") {
      readyToSave++;
      grossTotal += t.grossValue || 0;
      netTotal += t.netValue || 0;
    } else if (t.status === "invalid") {
      invalidItems++;
    } else if (t.status === "duplicate") {
      duplicateItems++;
    } else if (t.status === "ignored") {
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
