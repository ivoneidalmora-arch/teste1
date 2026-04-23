/**
 * Tabela de Conversão VRTE 2025
 * Mapeia o Valor Bruto para o Valor Líquido após deduções padrão.
 */
export const CONVERSAO_VRTE_2025: Record<number, number> = {
  198.13: 147.41,
  169.83: 127.08,
  141.52: 105.86,
  108.50: 75.96,
  94.35: 63.49
};

/**
 * Calcula o valor líquido com base no bruto usando a tabela VRTE.
 * Se não houver correspondência exata, retorna o valor bruto original.
 */
export const calculateLiquido = (bruto: number): number => {
  const match = Object.keys(CONVERSAO_VRTE_2025).find(
    k => Math.abs(parseFloat(k) - bruto) < 0.01
  );
  return match ? CONVERSAO_VRTE_2025[parseFloat(match)] : bruto;
};

/**
 * Categorias padrão de vistoria
 */
export const VISTORIA_CATEGORIES = [
  "Transferência",
  "Vistoria Cautelar",
  "Vistoria de Entrada",
  "Vistoria de Retorno"
] as const;

export type VistoriaCategory = typeof VISTORIA_CATEGORIES[number];
