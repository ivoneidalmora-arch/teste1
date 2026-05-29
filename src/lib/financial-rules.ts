/**
 * Regras Financeiras e Automações de Valores Líquidos
 * Ano de Referência: 2025
 */

/**
 * Tabela de conversão obrigatória para 2025
 * Valor Bruto -> Valor Líquido
 */
export const NET_VALUE_BY_GROSS_VALUE_2025: Record<string, number> = {
  "198.13": 147.44,
  "169.83": 127.08,
  "141.52": 105.86,
  "108.50": 75.96,
  "92.35": 63.99,
  "94.35": 63.49,
};

/**
 * Normaliza valores monetários de diversas fontes (string, número, com vírgula, R$, etc.)
 */
export function normalizeCurrencyValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number(value.toFixed(2));
  }

  let str = value.toString().trim().replace(/\s/g, "").replace("R$", "");
  
  // Se tem vírgula, assume formato BR (1.234,56)
  if (str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }
  
  const numericValue = Number(str);
  return Number.isNaN(numericValue) ? 0 : Number(numericValue.toFixed(2));
}

/**
 * Retorna o valor líquido automático para lançamentos de 2025, se aplicável.
 */
export function getNetValueFor2025(
  grossValue: string | number | null | undefined,
  date: string | Date | null | undefined
): number | null {
  if (!date) return null;

  const transactionDate = new Date(date);

  if (Number.isNaN(transactionDate.getTime())) {
    return null;
  }

  // Regra válida apenas para o ano de 2025
  if (transactionDate.getFullYear() !== 2025) {
    return null;
  }

  const normalizedGrossValue = normalizeCurrencyValue(grossValue);
  const key = normalizedGrossValue.toFixed(2);

  return NET_VALUE_BY_GROSS_VALUE_2025[key] ?? null;
}

/**
 * Determina se a regra automática deve ser aplicada ou se um valor manual deve ser preservado.
 */
export function shouldApplyAutoNetValue(currentNetValue: number, grossValue: number): boolean {
  const autoNetValue = NET_VALUE_BY_GROSS_VALUE_2025[grossValue.toFixed(2)];
  
  // Fórmula antiga de fallback: bruto - 50.72
  const oldFormulaValue = Math.max(0, grossValue - 50.72);
  
  return (
    !currentNetValue ||
    currentNetValue === 0 ||
    currentNetValue === grossValue ||
    (!!autoNetValue && Math.abs(currentNetValue - autoNetValue) < 0.01) ||
    Math.abs(currentNetValue - oldFormulaValue) < 0.02
  );
}

/**
 * Retorna o status detalhado da automação para uma transação.
 */
export function getNetValueAutomationStatus(transaction: any) {
  const grossValue = normalizeCurrencyValue(
    transaction.amountBruto ?? transaction.valor_bruto ?? transaction.valor ?? transaction.amount ?? transaction.grossAmount
  );

  const currentNetValue = normalizeCurrencyValue(
    transaction.amountLiquido ?? transaction.valor_liquido ?? transaction.netAmount
  );

  const dateStr = transaction.date ?? transaction.data ?? transaction.dateString;
  const autoNetValue = getNetValueFor2025(grossValue, dateStr);

  if (!dateStr) {
    return {
      status: "invalid_date",
      label: "Data ausente",
      autoNetValue: null,
    };
  }

  const transactionDate = new Date(dateStr);

  if (Number.isNaN(transactionDate.getTime())) {
    return {
      status: "invalid_date",
      label: "Data inválida",
      autoNetValue: null,
    };
  }

  if (transactionDate.getFullYear() !== 2025) {
    return {
      status: "outside_2025",
      label: "Fora de 2025",
      autoNetValue: null,
    };
  }

  if (!autoNetValue) {
    return {
      status: "no_rule",
      label: "Sem regra",
      autoNetValue: null,
    };
  }

  if (!shouldApplyAutoNetValue(currentNetValue, grossAmountToComparable(grossValue))) {
    return {
      status: "manual_preserved",
      label: "Valor manual preservado",
      autoNetValue,
    };
  }

  return {
    status: "applied",
    label: "Automático 2025",
    autoNetValue,
  };
}

// Auxiliar para comparação precisa
function grossAmountToComparable(val: number): number {
  return Number(val.toFixed(2));
}
