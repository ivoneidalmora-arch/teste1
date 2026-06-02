-- Migration: Fix and Migrate Data from Receitas and Despesas to transactions
-- Timestamp: 2026-06-02

-- 1. Certificar que a tabela transactions existe
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    gross_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    expense_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL DEFAULT 'Sem Categoria',
    customer_name TEXT,
    plate TEXT,
    service_name TEXT,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    source TEXT DEFAULT 'manual',
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    deleted_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Adicionar colunas caso a tabela já existisse antes
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "deleted_by" UUID REFERENCES public.app_users(id) DEFAULT NULL;

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(app_user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_active ON public.transactions(app_user_id) WHERE deleted_at IS NULL;

-- 2. Migrar dados de Receitas corrigindo os nomes das colunas
DO $$
BEGIN
   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Receitas') THEN
      INSERT INTO public.transactions (
          app_user_id, 
          type, 
          date, 
          gross_amount, 
          net_amount, 
          category, 
          customer_name, 
          plate, 
          service_name, 
          payment_method, 
          status, 
          deleted_at,
          deleted_by
      )
      SELECT 
          app_user_id,
          'income',
          COALESCE((date::TEXT)::DATE, CURRENT_DATE),
          COALESCE("amountBruto", amount, 0),
          COALESCE("amountLiquido", amount, 0),
          COALESCE(category, 'Sem Categoria'),
          cliente,
          placa,
          category, -- service_name is mapped to category
          pagamento,
          'paid', -- Assuming all old incomes are paid
          deleted_at,
          deleted_by
      FROM public."Receitas"
      -- Evitar duplicados caso já tenha rodado
      WHERE NOT EXISTS (
          SELECT 1 FROM public.transactions t 
          WHERE t.type = 'income' AND t.app_user_id = public."Receitas".app_user_id AND t.date = COALESCE((public."Receitas".date::TEXT)::DATE, CURRENT_DATE) AND t.gross_amount = COALESCE(public."Receitas"."amountBruto", public."Receitas".amount, 0)
      );
   END IF;
END $$;

-- 3. Migrar dados de Despesas corrigindo os nomes das colunas
DO $$
BEGIN
   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Despesas') THEN
      INSERT INTO public.transactions (
          app_user_id, 
          type, 
          date, 
          expense_amount, 
          category, 
          payment_method, 
          status,
          deleted_at,
          deleted_by
      )
      SELECT 
          app_user_id,
          'expense',
          COALESCE((date::TEXT)::DATE, CURRENT_DATE),
          COALESCE(amount, 0),
          COALESCE(category, 'Sem Categoria'),
          'Pix', -- Default if not present
          CASE WHEN status = 'Pago' THEN 'paid' ELSE 'pending' END,
          deleted_at,
          deleted_by
      FROM public."Despesas"
      -- Evitar duplicados caso já tenha rodado
      WHERE NOT EXISTS (
          SELECT 1 FROM public.transactions t 
          WHERE t.type = 'expense' AND t.app_user_id = public."Despesas".app_user_id AND t.date = COALESCE((public."Despesas".date::TEXT)::DATE, CURRENT_DATE) AND t.expense_amount = COALESCE(public."Despesas".amount, 0)
      );
   END IF;
END $$;
