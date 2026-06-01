// Helper para converter IDs numéricos ou virtuais em UUIDs válidos para a tabela audit_issues
export function toUuid(id: string | number): string {
  const strId = String(id);
  // Se já for um UUID válido, retorna ele mesmo
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(strId)) {
    return strId;
  }
  
  // Se for numérico (ID autoincremental de Receitas/Despesas)
  if (/^\d+$/.test(strId)) {
    const padded = strId.padStart(12, '0');
    return `00000000-0000-0000-0000-${padded}`;
  }

  // Caso seja uma string como "insight-123" ou similar
  let hex = '';
  for (let i = 0; i < strId.length; i++) {
    hex += strId.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Helper para converter UUIDs de volta para IDs originais
export function fromUuid(uuid: string): string {
  if (!uuid) return uuid;
  if (/^00000000-0000-0000-0000-\d{12}$/.test(uuid)) {
    const endPart = uuid.split('-')[4];
    const num = parseInt(endPart, 10);
    return String(num);
  }
  return uuid;
}
