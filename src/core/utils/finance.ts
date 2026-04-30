export type VistoriaCategory = 
  | 'Transferência' 
  | 'Motor' 
  | 'Especial' 
  | 'Vistoria de Entrada' 
  | 'Vistoria de Retorno' 
  | 'Vistoria Cautelar';

export const VISTORIA_CATEGORIES: VistoriaCategory[] = [
  'Transferência',
  'Motor',
  'Especial',
  'Vistoria de Entrada',
  'Vistoria de Retorno',
  'Vistoria Cautelar'
];

/**
 * Tabela de Conversão VRTE 2025 (Taxa Detran)
 * Bruto -> Liquido (Após dedução da taxa)
 */
export const CONVERSAO_VRTE_2025: Record<number, number> = {
  198.13: 147.41, // Transferência
  244.38: 193.66, // Motor / Especial
  138.69: 87.97,  // Vistoria de Entrada
  0: 0            // Retorno
};

/**
 * Calcula o valor líquido com base no bruto, 
 * subtraindo a taxa VRTE correspondente.
 */
export function calculateLiquido(bruto: number): number {
  if (bruto === 0) return 0;
  
  if (CONVERSAO_VRTE_2025[bruto] !== undefined) {
    return CONVERSAO_VRTE_2025[bruto];
  }
  
  // Se não estiver na tabela, assume taxa padrão de 50.72 (VRTE 2025)
  // Somente se for um valor positivo que pareça uma vistoria paga
  return Math.max(0, bruto - 50.72);
}
