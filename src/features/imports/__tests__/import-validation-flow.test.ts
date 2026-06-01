import { describe, it, expect } from 'vitest';
import { 
  validateImportedTransaction, 
  detectDuplicateTransactions, 
  getImportIssueSuggestions 
} from '../utils/import-validation.utils';
import { parseBrazilianDate } from '../utils/import-utils';
import { ImportedTransaction } from '../types/import.types';

describe('Fluxo de Validação de Importação e Auditoria', () => {
  
  it('deve invalidar data vazia ou incorreta', () => {
    const rawItem: Partial<ImportedTransaction> = {
      date: '',
      placa: 'AAA1234',
      cliente: 'João',
      service: 'Transferência',
      grossValue: 150
    };
    const validated = validateImportedTransaction(rawItem);
    expect(validated.errors).toContain('DATA_INVALIDA');
    expect(validated.status).toBe('invalid');
  });

  it('deve aceitar datas corretas em formato brasileiro e ISO', () => {
    const d1 = parseBrazilianDate('10/03/2025');
    expect(d1).not.toBeNull();
    expect(d1!.getFullYear()).toBe(2025);
    expect(d1!.getMonth()).toBe(2); // Março (0-indexed)
    expect(d1!.getDate()).toBe(10);

    const d2 = parseBrazilianDate('2025-05-15');
    expect(d2).not.toBeNull();
    expect(d2!.getFullYear()).toBe(2025);
    expect(d2!.getMonth()).toBe(4); // Maio
    expect(d2!.getDate()).toBe(15);
  });

  it('deve converter data serial do Excel (número ou texto) sem inverter fuso horário', () => {
    // 45726 = 10/03/2025
    const dateNum = parseBrazilianDate(45726);
    expect(dateNum).not.toBeNull();
    expect(dateNum!.getFullYear()).toBe(2025);
    expect(dateNum!.getMonth()).toBe(2);
    expect(dateNum!.getDate()).toBe(10);

    const dateStr = parseBrazilianDate('45726');
    expect(dateStr).not.toBeNull();
    expect(dateStr!.getFullYear()).toBe(2025);
    expect(dateStr!.getMonth()).toBe(2);
    expect(dateStr!.getDate()).toBe(10);
  });

  it('deve invalidar valor bruto menor ou igual a zero', () => {
    const itemZero: Partial<ImportedTransaction> = {
      date: '2025-05-15',
      placa: 'AAA1234',
      cliente: 'João',
      service: 'Transferência',
      grossValue: 0
    };
    const validatedZero = validateImportedTransaction(itemZero);
    expect(validatedZero.errors).toContain('VALOR_BRUTO_INVALIDO');

    const itemNeg: Partial<ImportedTransaction> = {
      ...itemZero,
      grossValue: -50
    };
    const validatedNeg = validateImportedTransaction(itemNeg);
    expect(validatedNeg.errors).toContain('VALOR_BRUTO_INVALIDO');
  });

  it('deve sugerir e normalizar PARTICULAR SÏ MATEU para PARTICULAR SÃO MATEUS', () => {
    const rawItem: Partial<ImportedTransaction> = {
      id: 'test-1',
      date: '2025-05-15',
      placa: 'AAA1234',
      cliente: 'PARTICULAR SÃO MATEUS', // Já normalizado pelo parser
      service: 'Transferência',
      grossValue: 150,
      rawClient: 'PARTICULAR SÏ MATEU' // original da planilha
    };

    const suggestions = getImportIssueSuggestions(rawItem as ImportedTransaction);
    const clientSug = suggestions.find(s => s.field === 'cliente');
    
    expect(clientSug).toBeDefined();
    expect(clientSug!.original).toBe('PARTICULAR SÏ MATEU');
    expect(clientSug!.suggested).toBe('PARTICULAR SÃO MATEUS');
  });

  it('deve formatar e sugerir placa com hífen', () => {
    const rawItem: Partial<ImportedTransaction> = {
      id: 'test-2',
      date: '2025-05-15',
      placa: 'AAA1234',
      cliente: 'João',
      service: 'Transferência',
      grossValue: 150
    };

    const suggestions = getImportIssueSuggestions(rawItem as ImportedTransaction);
    const placaSug = suggestions.find(s => s.field === 'placa');

    expect(placaSug).toBeDefined();
    expect(placaSug!.original).toBe('AAA1234');
    expect(placaSug!.suggested).toBe('AAA-1234');
  });

  it('deve detectar duplicidades na base importada no intervalo de 30 dias', () => {
    const rawItems: Partial<ImportedTransaction>[] = [
      {
        id: '1',
        date: '2025-05-01',
        placa: 'AAA1234',
        cliente: 'João',
        service: 'Transferência',
        grossValue: 150,
        status: 'valid' as const,
        errors: [],
        warnings: [],
        validationMessages: []
      },
      {
        id: '2',
        date: '2025-05-10', // 9 dias depois
        placa: 'AAA1234',
        cliente: 'João',
        service: 'Transferência',
        grossValue: 150,
        status: 'valid' as const,
        errors: [],
        warnings: [],
        validationMessages: []
      }
    ];
    const items = rawItems.map(validateImportedTransaction);

    const withDuplicates = detectDuplicateTransactions(items);
    
    expect(withDuplicates[0].status).toBe('duplicate');
    expect(withDuplicates[1].status).toBe('duplicate');
    expect(withDuplicates[0].errors).toContain('DUPLICADO');
  });

  it('deve reter o histórico de auditoria (auditLog) e snapshorts de valores originais', () => {
    const rawItem: ImportedTransaction = {
      id: 'test-audit',
      date: '2025-05-15',
      placa: 'AAA1234',
      cliente: 'João',
      service: 'Transferência',
      grossValue: 150,
      status: 'valid',
      errors: [],
      warnings: [],
      validationMessages: [],
      rawData: {
        cliente: 'João Planilha',
        data: '15/05/2025',
        valor: '150,00'
      },
      auditLog: []
    };

    // Simulando uma alteração manual do operador
    const updatedFields: Partial<ImportedTransaction> = {
      cliente: 'João Corrigido',
      grossValue: 180
    };

    // Gerando o diff e gerando log de auditoria simulado (como fazemos no hook)
    const auditLog = [...rawItem.auditLog!];
    const fieldsToLog: (keyof ImportedTransaction)[] = ['cliente', 'grossValue'];
    
    fieldsToLog.forEach(field => {
      const oldValue = String(rawItem[field] ?? '');
      const newValue = String(updatedFields[field] ?? '');

      if (oldValue !== newValue) {
        let originalVal = oldValue;
        if (rawItem.rawData) {
          if (field === 'cliente') originalVal = String(rawItem.rawData.cliente);
          else if (field === 'grossValue') originalVal = String(rawItem.rawData.valor);
        }

        auditLog.push({
          id: 'log-1',
          timestamp: new Date().toISOString(),
          field,
          originalValue: originalVal,
          previousValue: oldValue,
          newValue,
          user: 'Operador',
          reason: 'Correção de valores incorretos',
          previousStatus: rawItem.status,
          newStatus: 'corrected'
        });
      }
    });

    expect(auditLog.length).toBe(2);
    expect(auditLog[0].field).toBe('cliente');
    expect(auditLog[0].originalValue).toBe('João Planilha'); // Preserva dado cru
    expect(auditLog[0].previousValue).toBe('João');          // Valor interpretado anterior
    expect(auditLog[0].newValue).toBe('João Corrigido');

    expect(auditLog[1].field).toBe('grossValue');
    expect(auditLog[1].originalValue).toBe('150,00');
    expect(auditLog[1].newValue).toBe('180');
  });

});
