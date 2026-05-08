/**
 * Normaliza o nome da receita com base em prefixos específicos.
 * Regras:
 * - "completa" -> "Vistoria de Transferência"
 * - "simplificada" -> "Vistoria de Entrada"
 * - "fixa" -> "Vistoria de Transferência"
 * - "retorno" -> "Vistoria de Retorno"
 * 
 * @param name Nome original da receita
 * @returns Nome normalizado ou o nome original caso não combine com nenhum prefixo
 */
export function normalizeRevenueName(name: string): string {
  const originalName = String(name ?? "").trim();
  if (!originalName) return "";
  
  const normalized = originalName.toLowerCase();

  if (normalized.startsWith("completa")) {
    return "Vistoria de Transferência";
  }

  if (normalized.startsWith("simplificada")) {
    return "Vistoria de Entrada";
  }

  if (normalized.startsWith("fixa")) {
    return "Vistoria de Transferência";
  }

  if (normalized.startsWith("retorno")) {
    return "Vistoria de Retorno";
  }

  return originalName;
}
