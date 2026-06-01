export function isValidUUID(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

// Helper para converter IDs numéricos ou virtuais em UUIDs válidos para a tabela audit_issues
export function toUuid(id: string | number): string {
  const strId = String(id);
  // Se já for um UUID válido, retorna ele mesmo
  if (isValidUUID(strId)) {
    return strId;
  }
  
  // Se for numérico (ID autoincremental de Receitas/Despesas)
  if (/^\d+$/.test(strId)) {
    const padded = strId.padStart(12, '0');
    return `00000000-0000-4000-8000-${padded}`;
  }

  // Caso seja uma string como "insight-123" ou similar
  let hex = '';
  for (let i = 0; i < strId.length; i++) {
    hex += strId.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(32, '0').slice(0, 32);
  // Formata com versão 4 (dígito 13 como '4') e variante (dígito 17 como '8')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Helper para converter UUIDs de volta para IDs originais
export function fromUuid(uuid: string): string {
  if (!uuid) return uuid;
  if (/^00000000-0000-4000-8000-\d{12}$/.test(uuid)) {
    const endPart = uuid.split('-')[4];
    const num = parseInt(endPart, 10);
    return String(num);
  }
  return uuid;
}
