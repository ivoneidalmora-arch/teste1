-- MIGRATION: Adicionar campos de Valor Bruto e Líquido para Automação 2025
-- Tabela: Receitas

-- 1. Adicionar colunas na tabela Receitas se não existirem
ALTER TABLE "Receitas" 
ADD COLUMN IF NOT EXISTS "amountBruto" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "amountLiquido" DECIMAL(12,2);

-- 2. Backfill inicial: Copiar o valor atual de 'amount' para os novos campos
UPDATE "Receitas" 
SET 
  "amountBruto" = COALESCE("amountBruto", "amount"),
  "amountLiquido" = COALESCE("amountLiquido", "amount")
WHERE "amountBruto" IS NULL OR "amountLiquido" IS NULL;

-- 3. Comentários
COMMENT ON COLUMN "Receitas"."amountBruto" IS 'Valor total da vistoria sem deduções';
COMMENT ON COLUMN "Receitas"."amountLiquido" IS 'Valor final após regras de automação 2025 ou deduções manuais';
