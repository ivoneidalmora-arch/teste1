-- SQL para criação da tabela de usuários profissionais
-- Execute este comando no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Nota: Como o sistema usa supabaseAdmin (Service Role) no servidor, 
-- não é necessário criar policies públicas para leitura de hash de senha.
-- Isso mantém os hashes protegidos contra acesso direto via cliente anon.
