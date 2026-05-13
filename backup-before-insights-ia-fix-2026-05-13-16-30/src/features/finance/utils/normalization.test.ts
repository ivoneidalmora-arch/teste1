import { describe, it, expect } from 'vitest';
import { normalizeRevenueName } from './normalization';

describe('normalizeRevenueName', () => {
  it('deve normalizar "completa" para "Vistoria de Transferência"', () => {
    expect(normalizeRevenueName("completa")).toBe("Vistoria de Transferência");
    expect(normalizeRevenueName("Completa veículo")).toBe("Vistoria de Transferência");
    expect(normalizeRevenueName("COMPLETA transferência")).toBe("Vistoria de Transferência");
    expect(normalizeRevenueName("  completa  ")).toBe("Vistoria de Transferência");
  });

  it('deve normalizar "simplificada" para "Vistoria de Entrada"', () => {
    expect(normalizeRevenueName("simplificada")).toBe("Vistoria de Entrada");
    expect(normalizeRevenueName("Simplificada entrada")).toBe("Vistoria de Entrada");
  });

  it('deve normalizar "fixa" para "Vistoria de Transferência"', () => {
    expect(normalizeRevenueName("fixa")).toBe("Vistoria de Transferência");
    expect(normalizeRevenueName("Fixa transferência")).toBe("Vistoria de Transferência");
  });

  it('deve normalizar "retorno" para "Vistoria de Retorno"', () => {
    expect(normalizeRevenueName("retorno")).toBe("Vistoria de Retorno");
    expect(normalizeRevenueName("Retorno vistoria")).toBe("Vistoria de Retorno");
  });

  it('não deve alterar nomes que contenham as palavras no meio', () => {
    expect(normalizeRevenueName("Taxa completa adicional")).toBe("Taxa completa adicional");
    expect(normalizeRevenueName("Serviço simplificada antigo")).toBe("Serviço simplificada antigo");
    expect(normalizeRevenueName("Pagamento fixa extra")).toBe("Pagamento fixa extra");
    expect(normalizeRevenueName("Agendamento retorno cliente")).toBe("Agendamento retorno cliente");
  });

  it('deve tratar valores nulos ou vazios', () => {
    expect(normalizeRevenueName("")).toBe("");
    expect(normalizeRevenueName(null as any)).toBe("");
  });
});
