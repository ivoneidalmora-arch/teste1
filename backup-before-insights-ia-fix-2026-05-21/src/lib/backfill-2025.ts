import { supabase } from '@/lib/supabase/client';
import { normalizeCurrencyValue, getNetValueFor2025, shouldApplyAutoNetValue } from './financial-rules';

/**
 * Script de Backfill para atualizar lançamentos de 2025 com as novas regras de valor líquido.
 */
export async function backfillNetValues2025() {
  console.log('[Backfill 2025] Iniciando processamento...');
  
  // Buscar apenas receitas de 2025
  const { data, error } = await supabase
    .from("Receitas")
    .select("*")
    .gte("date", "2025-01-01")
    .lte("date", "2025-12-31");

  if (error) {
    console.error('[Backfill 2025] Erro ao buscar dados:', error);
    throw error;
  }

  let updated = 0;
  let ignored = 0;
  let alreadyCorrect = 0;

  for (const transaction of data ?? []) {
    const grossValue = normalizeCurrencyValue(
      transaction.amountBruto ?? transaction.amount
    );

    const currentNetValue = normalizeCurrencyValue(transaction.amountLiquido);
    const autoNetValue = getNetValueFor2025(grossValue, transaction.date);

    // Se não houver regra para este valor bruto
    if (!autoNetValue) {
      ignored++;
      continue;
    }

    // Se o valor já estiver correto
    if (currentNetValue === autoNetValue) {
      alreadyCorrect++;
      continue;
    }

    // Se houver valor manual preservado (diferente do bruto e diferente do sugerido)
    if (!shouldApplyAutoNetValue(currentNetValue, grossValue)) {
      ignored++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("Receitas")
      .update({
        amountBruto: grossValue,
        amountLiquido: autoNetValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error(`[Backfill 2025] Erro ao atualizar ID ${transaction.id}:`, updateError);
      throw updateError;
    }

    updated++;
  }

  const result = {
    found: data?.length ?? 0,
    updated,
    alreadyCorrect,
    ignored,
  };

  console.log('[Backfill 2025] Resultado:', result);
  return result;
}
