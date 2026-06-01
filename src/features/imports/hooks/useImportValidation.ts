import { useState, useMemo } from 'react';
import { ImportedTransaction, ImportSummary, ValidationStatus, ImportAuditLog } from '../types/import.types';
import { 
  validateImportedTransaction, 
  detectDuplicateTransactions, 
  calculateImportSummary 
} from '../utils/import-validation.utils';

export type FilterStatus = "all" | ValidationStatus;

export function useImportValidation() {
  const [items, setItems] = useState<ImportedTransaction[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const processImportedData = (rawItems: ImportedTransaction[]) => {
    // 1. Initial Validation
    const validated = rawItems.map(validateImportedTransaction);
    // 2. Detect Duplicates
    const withDuplicates = detectDuplicateTransactions(validated);
    setItems(withDuplicates);
  };

  const clearData = () => {
    setItems([]);
    setFilter("all");
    setSearchQuery("");
  };

  const handleEdit = (
    id: string, 
    updatedItem: Partial<ImportedTransaction>,
    reason: string = 'Correção manual de inconsistência',
    previousStatus?: string
  ) => {
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const auditLog: ImportAuditLog[] = [...(item.auditLog || [])];
          const fieldsToLog: (keyof ImportedTransaction)[] = [
            'date', 'placa', 'cliente', 'service', 'category', 'grossValue', 'netValue', 'description', 'formaPagamento'
          ];

          fieldsToLog.forEach(field => {
            const oldValue = String(item[field] ?? '');
            const newValue = String(updatedItem[field] ?? '');

            if (updatedItem[field] !== undefined && oldValue !== newValue) {
              // Localizar o valor mais cru na planilha se possível
              let originalVal = oldValue;
              if (item.rawData) {
                if (field === 'cliente') originalVal = String(item.rawData.cliente || item.rawData.Cliente || item.rawData.rawClient || oldValue);
                else if (field === 'date') originalVal = String(item.rawData.data || item.rawData.Data || item.rawData.rawDate || oldValue);
                else if (field === 'grossValue') originalVal = String(item.rawData.valor || item.rawData.Valor || item.rawData.rawValorBruto || oldValue);
                else if (field === 'netValue') originalVal = String(item.rawData.liquido || item.rawData.rawValorLiquido || oldValue);
              }

              auditLog.push({
                id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                field,
                originalValue: originalVal,
                previousValue: oldValue,
                newValue,
                user: 'Operador',
                reason,
                previousStatus: previousStatus || item.status,
                newStatus: 'corrected'
              });
            }
          });

          const merged = { 
            ...item, 
            ...updatedItem,
            auditLog
          };
          
          if (merged.status !== "manual_approved" && merged.status !== "ignored") {
             merged.status = "corrected";
          }

          return validateImportedTransaction(merged);
        }
        return item;
      });

      return detectDuplicateTransactions(newItems);
    });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleApproveManually = (id: string, reason: string = 'Aprovado manualmente pelo usuário') => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const auditLog: ImportAuditLog[] = [...(item.auditLog || [])];

        auditLog.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toISOString(),
          field: 'status',
          originalValue: item.status,
          previousValue: item.status,
          newValue: 'manual_approved',
          user: 'Operador',
          reason,
          previousStatus: item.status,
          newStatus: 'manual_approved'
        });

        return {
          ...item,
          status: "manual_approved" as ValidationStatus,
          approvedManually: true,
          motivoCorrecao: reason,
          auditLog,
          validationMessages: [...item.validationMessages.filter(m => !m.includes("Aprovado manualmente")), `Aprovado manualmente: ${reason}`]
        };
      }
      return item;
    }));
  };

  const handleIgnore = (id: string, reason: string = 'Ignorado pelo usuário') => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const auditLog: ImportAuditLog[] = [...(item.auditLog || [])];

        auditLog.push({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date().toISOString(),
          field: 'status',
          originalValue: item.status,
          previousValue: item.status,
          newValue: 'ignored',
          user: 'Operador',
          reason,
          previousStatus: item.status,
          newStatus: 'ignored'
        });

        return {
          ...item,
          status: "ignored" as ValidationStatus,
          ignored: true,
          auditLog,
          validationMessages: [...item.validationMessages.filter(m => !m.includes("Ignorado")), reason]
        };
      }
      return item;
    }));
  };

  const handleRevalidate = (id: string) => {
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
           // Reset status to force revalidation without preservation
           const toRevalidate = { ...item, status: "pending" as ValidationStatus };
           return validateImportedTransaction(toRevalidate);
        }
        return item;
      });
      return detectDuplicateTransactions(newItems);
    });
  };

  const summary = useMemo(() => calculateImportSummary(items), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status Filter
      if (filter !== "all" && item.status !== filter) return false;

      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesPlaca = item.placa?.toLowerCase().includes(query);
        const matchesCliente = item.cliente?.toLowerCase().includes(query);
        const matchesService = item.service?.toLowerCase().includes(query);
        const matchesDate = item.date?.includes(query);
        const matchesValue = item.grossValue?.toString().includes(query);
        
        return matchesPlaca || matchesCliente || matchesService || matchesDate || matchesValue;
      }

      return true;
    });
  }, [items, filter, searchQuery]);

  return {
    items,
    filteredItems,
    summary,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    processImportedData,
    clearData,
    handleEdit,
    handleDelete,
    handleApproveManually,
    handleIgnore,
    handleRevalidate
  };
}
