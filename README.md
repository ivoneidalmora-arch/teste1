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

## 📅 Integração Google Calendar

O sistema integra-se ao Google Calendar para sincronizar vistorias e feriados.

### 1. Configuração no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Ative a **Google Calendar API**.
3. Em **OAuth consent screen**, configure como "External" e adicione os escopos:
   - `.../auth/calendar.events`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
4. Em **Credentials**, crie um **OAuth 2.0 Client ID** do tipo "Web Application".
5. Adicione as **Authorized Redirect URIs**:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Produção: `https://seu-dominio.com/api/auth/google/callback`

### 2. Variáveis de Ambiente Adicionais
No seu `.env.local` e no painel do Vercel, adicione:

```env
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
ENCRYPTION_KEY=uma_chave_de_32_caracteres_para_criptografia
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com # ou http://localhost:3000
```

### 3. Banco de Dados
Execute o arquivo `supabase_migration_calendar_final.sql` no seu SQL Editor do Supabase para criar as tabelas de conexões, eventos e duplicatas aprovadas.

### ⚠️ Solução de Problemas: Erro 403 Access Denied
Se você receber o erro `access_denied` ao tentar conectar, verifique:
1. **App em Teste**: No Google Cloud Console, se o status do app estiver em "Testing", você deve adicionar o e-mail do usuário explicitamente em "Test users" na tela de consentimento OAuth.
2. **Scopes**: Garanta que todos os escopos solicitados foram autorizados na tela de consentimento.
3. **Redirect URI**: O `NEXT_PUBLIC_SITE_URL` deve bater exatamente com o que está configurado no Google Cloud (incluindo https e ausência de barra final).

## 🔒 Segurança e Arquitetura
- **Middleware**: Proteção de rotas no nível do servidor.
- **Isolamento de Dados**: Toda transação financeira é filtrada pelo `app_user_id` do usuário autenticado.
- **Admin Service**: Operações sensíveis de banco de dados são realizadas via `supabaseAdmin` no servidor.
- **OAuth Security**: Utiliza `nonce` via cookies HTTP-only e criptografia AES-256-GCM para tokens em repouso.
