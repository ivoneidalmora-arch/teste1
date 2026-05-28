import { useState, useMemo } from 'react';
import { ImportedTransaction, ImportSummary, ValidationStatus } from '../types/import.types';
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

  const handleEdit = (id: string, updatedItem: Partial<ImportedTransaction>) => {
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          // Merge updates, reset status so it's revalidated properly
          // If the user fixes fields, we want to revalidate.
          const merged = { ...item, ...updatedItem };
          
          // Re-validate. Temporarily set status to corrected to force new check, 
          // wait, validateImportedTransaction handles 'corrected' as an input.
          if (merged.status !== "manual_approved" && merged.status !== "ignored") {
             merged.status = "corrected";
          }

          return validateImportedTransaction(merged);
        }
        return item;
      });

      // Re-detect duplicates because the edited item might now be a duplicate or might no longer be one
      return detectDuplicateTransactions(newItems);
    });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleApproveManually = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: "manual_approved",
          approvedManually: true,
          validationMessages: [...item.validationMessages.filter(m => !m.includes("Aprovado manualmente")), "Aprovado manualmente pelo usuário"]
        };
      }
      return item;
    }));
  };

  const handleIgnore = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: "ignored",
          ignored: true,
          validationMessages: [...item.validationMessages.filter(m => !m.includes("Ignorado pelo usuário")), "Ignorado pelo usuário"]
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
