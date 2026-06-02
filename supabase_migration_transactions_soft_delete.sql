-- MIGRATION: Adicionar Soft Delete na tabela transactions
-- Timestamp: 2026-06-02

-- 1. Adicionar colunas em transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "deleted_by" UUID REFERENCES public.app_users(id) DEFAULT NULL;

-- 2. Índice para otimizar busca de registros não excluídos
CREATE INDEX IF NOT EXISTS idx_transactions_active ON public.transactions(app_user_id) WHERE deleted_at IS NULL;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.transactions."deleted_at" IS 'Timestamp de exclusão lógica (soft delete)';
COMMENT ON COLUMN public.transactions."deleted_by" IS 'ID do usuário que realizou a exclusão';
