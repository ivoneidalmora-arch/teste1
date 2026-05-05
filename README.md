# Alfa Perícia e Vistoria - Dashboard Financeiro Premium

Sistema avançado de gestão financeira e inteligência de dados para empresas de vistoria automotiva.

## 🚀 Tecnologias

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Segurança**: JWT, bcryptjs, Cookies HTTP-Only, Middleware Server-side

## 🛠️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_secreta

# Segurança
JWT_SECRET=uma_string_longa_e_aleatoria
```

### 2. Banco de Dados (Supabase)

Execute o script SQL abaixo no SQL Editor do seu projeto Supabase para criar a estrutura necessária de usuários:

```sql
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
```

> [!NOTE]
> O sistema utiliza a `SUPABASE_SERVICE_ROLE_KEY` no servidor para operações de autenticação, garantindo que os hashes de senha nunca sejam expostos publicamente.

## 📦 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🏗️ Build e Produção

```bash
# Rodar lint
npm run lint

# Checagem de tipos
npm run typecheck

# Gerar build de produção
npm run build
```

## 🔒 Segurança e Arquitetura

- **Middleware**: Proteção de rotas no nível do servidor.
- **Isolamento de Dados**: Toda transação financeira é filtrada pelo `app_user_id` do usuário autenticado.
- **Admin Service**: Operações sensíveis de banco de dados são realizadas via `supabaseAdmin` no servidor.
