import { useState, useMemo } from 'react';
import { InvoiceImportData, validateInvoiceData } from '../schemas/invoice.schema';

export function useInvoiceValidation() {
  const [items, setItems] = useState<InvoiceImportData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid' | 'error' | 'no-plate'>('all');

  const processImportedData = (data: InvoiceImportData[]) => {
    setItems(data);
  };

  const clearData = () => {
    setItems([]);
  };

  const handleEdit = (updatedItem: InvoiceImportData) => {
    const validation = validateInvoiceData(updatedItem);
    
    const finalizedItem = {
      ...updatedItem,
      status: validation.isValid ? 'corrected' : 'error',
      errors: validation.errors
    } as InvoiceImportData;

    setItems(prev => prev.map(item => 
      item.id === finalizedItem.id ? finalizedItem : item
    ));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleIgnore = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'ignored' } : item
    ));
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (filter !== 'all') {
      if (filter === 'valid') {
        result = result.filter(i => i.status === 'valid' || i.status === 'corrected');
      } else if (filter === 'error' || filter === 'invalid') {
        result = result.filter(i => i.status === 'error' || i.status === 'invalid');
      } else if (filter === 'no-plate') {
        result = result.filter(i => i.placa === 'PLACA NÃO IDENTIFICADA');
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.placa?.toLowerCase().includes(q) ||
        i.cliente?.toLowerCase().includes(q) ||
        i.statusNota?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, filter, searchQuery]);

  const summary = useMemo(() => {
    const totalItems = items.length;
    const validItems = items.filter(i => i.status === 'valid' || i.status === 'corrected').length;
    const errorItems = items.filter(i => i.status === 'error' || i.status === 'invalid').length;
    const noPlateItems = items.filter(i => i.placa === 'PLACA NÃO IDENTIFICADA').length;
    
    const totalValue = items
      .filter(i => i.status !== 'ignored')
      .reduce((acc, curr) => acc + curr.grossValue, 0);

    return {
      totalItems,
      validItems,
      errorItems,
      noPlateItems,
      totalValue,
      readyToSave: validItems
    };
  }, [items]);

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
    handleIgnore
  };
}
