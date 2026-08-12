import { describe, it, expect } from 'vitest';
import { 
  parseCurrencyBR, 
  parseBrazilianDate, 
  formatDateBR, 
  normalizeClientName,
  getValueByAliases,
  extractVehiclePlate,
  isValidPlate
} from '../utils/import-utils';

describe('import-utils > Valores Financeiros', () => {
  it('deve formatar valores financeiros corretamente', () => {
    // Entradas do usuário
    expect(parseCurrencyBR('R$ 150,00')).toBe(150);
    expect(parseCurrencyBR('150,00')).toBe(150);
    expect(parseCurrencyBR('150.00')).toBe(150);
    expect(parseCurrencyBR('1.250,50')).toBe(1250.5);
    expect(parseCurrencyBR('1250,50')).toBe(1250.5);
    expect(parseCurrencyBR('R$1.250,50')).toBe(1250.5);
    expect(parseCurrencyBR('R$ 0,00')).toBe(0);
    expect(parseCurrencyBR(0)).toBe(0);
    expect(parseCurrencyBR('0')).toBe(0);
    expect(parseCurrencyBR(150.5)).toBe(150.5);
  });

  it('deve retornar null para valores ausentes ou inválidos', () => {
    expect(parseCurrencyBR('')).toBeNull();
    expect(parseCurrencyBR(null)).toBeNull();
    expect(parseCurrencyBR(undefined)).toBeNull();
    expect(parseCurrencyBR('R$ -')).toBeNull();
    expect(parseCurrencyBR('ABC')).toBeNull();
  });
});

describe('import-utils > Datas', () => {
  it('deve extrair data brasileira corretamente', () => {
    // Entradas do usuário
    expect(formatDateBR(parseBrazilianDate('10/03/2025'))).toBe('10/03/2025');
    expect(formatDateBR(parseBrazilianDate('10-03-2025'))).toBe('10/03/2025');
    expect(formatDateBR(parseBrazilianDate('2025-03-10'))).toBe('10/03/2025');
  });

  it('deve extrair Excel Serial Date corretamente', () => {
    // Excel Serial para 10/03/2025 = 45726
    const parsed = parseBrazilianDate(45726);
    expect(formatDateBR(parsed)).toBe('10/03/2025');
  });

  it('deve retornar null para datas vazias ou inválidas', () => {
    expect(parseBrazilianDate('')).toBeNull();
    expect(parseBrazilianDate('data-invalida')).toBeNull();
    expect(parseBrazilianDate(null)).toBeNull();
  });
});

describe('import-utils > Nomes de Clientes', () => {
  it('deve consertar nomes SÃO MATEUS corrompidos', () => {
    expect(normalizeClientName('PARTICULAR SÏ MATEU')).toBe('PARTICULAR SÃO MATEUS');
    expect(normalizeClientName('PARTICULAR SI MATEU')).toBe('PARTICULAR SÃO MATEUS');
    expect(normalizeClientName('PARTICULAR SAO MATEU')).toBe('PARTICULAR SÃO MATEUS');
    expect(normalizeClientName('PARTICULAR SÃO MATEU')).toBe('PARTICULAR SÃO MATEUS');
    expect(normalizeClientName('PARTICULAR SÃO MATEUS')).toBe('PARTICULAR SÃO MATEUS');
  });

  it('deve higienizar nomes comuns', () => {
    expect(normalizeClientName(' João da Silva ')).toBe('JOÃO DA SILVA');
    expect(normalizeClientName('EMPRESA   LTDA')).toBe('EMPRESA LTDA');
  });
});

describe('import-utils > Colunas Dinâmicas', () => {
  it('deve recuperar valores por aliases exatos ou parciais', () => {
    const aliases = ['valor', 'valor bruto', 'preço', 'r$'];

    expect(getValueByAliases({ 'Valor': 150 }, aliases)).toBe(150);
    expect(getValueByAliases({ 'VALOR BRUTO': 150 }, aliases)).toBe(150);
    expect(getValueByAliases({ 'Preço': 150 }, aliases)).toBe(150);
    expect(getValueByAliases({ 'R$': 150 }, aliases)).toBe(150);
    
    // Partial
    expect(getValueByAliases({ 'Valor do Serviço': 150 }, aliases)).toBe(150);
  });

  it('deve ignorar colunas vazias', () => {
    const aliases = ['valor', 'preço'];
    const row = {
      'Preço Sugerido': '',
      'Preço': 150
    };
    expect(getValueByAliases(row, aliases)).toBe(150);
  });
});

describe('import-utils > Extração de Placas NFS-e', () => {
  it('deve extrair placa no padrão Mercosul de Discriminação Serviço', () => {
    const text = 'Serviço de vistoria veicular para a placa SKP4J26 FIAT ARGO DRIVE 1.3 AT';
    expect(extractVehiclePlate(text)).toBe('SKP4J26');
  });

  it('deve extrair placa no padrão Antigo com hífen ou espaço', () => {
    expect(extractVehiclePlate('Vistoria para o veículo ABC-1234 chevrolet celta')).toBe('ABC1234');
    expect(extractVehiclePlate('Placa ABC 1234 ano 2015')).toBe('ABC1234');
  });

  it('deve retornar null para textos sem placa identificável e não inventar placas de números ou descrições', () => {
    expect(extractVehiclePlate('VISTORIA FIXA')).toBeNull();
    expect(extractVehiclePlate('VISTORIA DE VEICULO LEVE')).toBeNull();
    expect(extractVehiclePlate('DESCRIÇÃO DO ITEM | QUANT. | VALOR UNIT. | DESCONTO | TOTAL\nVISTORIA DE VEICULO PESADO | 1,0000 | 142,0000 | 0,00 | 142,00')).toBeNull();
    expect(extractVehiclePlate('031.713.247-41 - ERICSON VINICIUS FREIRE RAFAEL')).toBeNull();
  });

  it('deve validar padrões válidos de placa brasileira', () => {
    expect(isValidPlate('SKP4J26')).toBe(true);
    expect(isValidPlate('ABC1234')).toBe(true);
    expect(isValidPlate('ABC-1234')).toBe(true);
    expect(isValidPlate('INVALID')).toBe(false);
    expect(isValidPlate('1234567')).toBe(false);
  });
});

